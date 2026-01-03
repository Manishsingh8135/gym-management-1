import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalMembers,
    activeMembers,
    todayCheckIns,
    expiringThisWeek,
    todayRevenue,
    newMembersThisMonth,
  ] = await Promise.all([
    prisma.member.count({ where: { organizationId } }),
    prisma.member.count({ where: { organizationId, status: 'ACTIVE' } }),
    prisma.attendance.count({
      where: {
        member: { organizationId },
        checkInTime: { gte: today },
      },
    }),
    prisma.membership.count({
      where: {
        member: { organizationId },
        status: 'ACTIVE',
        endDate: {
          gte: today,
          lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        member: { organizationId },
        createdAt: { gte: today },
        status: 'SUCCESS',
      },
      _sum: { amount: true },
    }),
    prisma.member.count({
      where: {
        organizationId,
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      totalMembers,
      activeMembers,
      todayCheckIns,
      expiringThisWeek,
      todayRevenue: todayRevenue._sum.amount || 0,
      newMembersThisMonth,
    },
  });
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;

  const [recentCheckIns, recentPayments, recentMembers] = await Promise.all([
    prisma.attendance.findMany({
      where: { member: { organizationId } },
      include: {
        member: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { checkInTime: 'desc' },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { member: { organizationId }, status: 'SUCCESS' },
      include: {
        member: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.member.findMany({
      where: { organizationId },
      select: { id: true, firstName: true, lastName: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const activities = [
    ...recentCheckIns.map((c) => ({
      type: 'check_in',
      message: `${c.member.firstName} ${c.member.lastName} checked in`,
      timestamp: c.checkInTime,
    })),
    ...recentPayments.map((p) => ({
      type: 'payment',
      message: `Payment of ₹${p.amount} received from ${p.member.firstName}`,
      timestamp: p.createdAt,
    })),
    ...recentMembers.map((m) => ({
      type: 'new_member',
      message: `New member: ${m.firstName} ${m.lastName}`,
      timestamp: m.createdAt,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
   .slice(0, 10);

  res.json({
    success: true,
    data: activities,
  });
});
