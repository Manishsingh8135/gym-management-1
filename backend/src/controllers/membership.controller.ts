import { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../middlewares/error.middleware.js';

export const getMemberships = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { memberId, status, page = 1, limit = 20 } = req.query;

  const where: any = {
    member: { organizationId },
  };

  if (memberId) {
    where.memberId = memberId;
  }

  if (status) {
    where.status = status;
  }

  const [memberships, total] = await Promise.all([
    prisma.membership.findMany({
      where,
      include: {
        plan: {
          select: { id: true, name: true, color: true },
        },
        member: {
          select: { id: true, memberId: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.membership.count({ where }),
  ]);

  res.json({
    success: true,
    data: memberships,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

export const getMembership = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const membership = await prisma.membership.findFirst({
    where: {
      id,
      member: { organizationId },
    },
    include: {
      plan: true,
      member: {
        select: { id: true, memberId: true, firstName: true, lastName: true, email: true, phone: true },
      },
    },
  });

  if (!membership) {
    throw new AppError('Membership not found', 404, 'NOT_FOUND');
  }

  res.json({
    success: true,
    data: membership,
  });
});

export const createMembership = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { memberId, planId, durationId, startDate } = req.body;

  // Verify member belongs to organization
  const member = await prisma.member.findFirst({
    where: { id: memberId, organizationId },
  });

  if (!member) {
    throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND');
  }

  // Verify plan belongs to organization
  const plan = await prisma.plan.findFirst({
    where: { id: planId, organizationId },
    include: {
      durations: true,
    },
  });

  if (!plan) {
    throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
  }

  // Find the duration
  const duration = plan.durations.find(d => d.id === durationId);
  if (!duration) {
    throw new AppError('Invalid plan duration', 400, 'INVALID_DURATION');
  }

  // Calculate end date
  const start = new Date(startDate || new Date());
  const end = new Date(start);
  end.setMonth(end.getMonth() + duration.durationMonths);

  // Expire any existing active memberships for this member
  await prisma.membership.updateMany({
    where: {
      memberId,
      status: 'ACTIVE',
    },
    data: {
      status: 'EXPIRED',
    },
  });

  // Create new membership
  const membership = await prisma.membership.create({
    data: {
      memberId,
      planId,
      startDate: start,
      endDate: end,
      status: 'ACTIVE',
      remainingClassCredits: plan.classCredits,
      remainingPTSessions: plan.ptSessions,
    },
    include: {
      plan: { select: { id: true, name: true } },
      member: { select: { id: true, memberId: true, firstName: true, lastName: true } },
    },
  });

  // Update member status to active
  await prisma.member.update({
    where: { id: memberId },
    data: { status: 'ACTIVE' },
  });

  res.status(201).json({
    success: true,
    data: membership,
    message: 'Membership assigned successfully',
  });
});

export const renewMembership = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const { durationId, startFromCurrent } = req.body;

  const membership = await prisma.membership.findFirst({
    where: {
      id,
      member: { organizationId },
    },
    include: {
      plan: {
        include: { durations: true },
      },
    },
  });

  if (!membership) {
    throw new AppError('Membership not found', 404, 'NOT_FOUND');
  }

  // Find the duration
  const duration = membership.plan.durations.find(d => d.id === durationId);
  if (!duration) {
    throw new AppError('Invalid plan duration', 400, 'INVALID_DURATION');
  }

  // Calculate new dates
  let newStartDate: Date;
  if (startFromCurrent && membership.status === 'ACTIVE' && new Date(membership.endDate) > new Date()) {
    newStartDate = new Date(membership.endDate);
  } else {
    newStartDate = new Date();
  }

  const newEndDate = new Date(newStartDate);
  newEndDate.setMonth(newEndDate.getMonth() + duration.durationMonths);

  // Update membership
  const updatedMembership = await prisma.membership.update({
    where: { id },
    data: {
      startDate: newStartDate,
      endDate: newEndDate,
      status: 'ACTIVE',
      isFrozen: false,
      freezeStartDate: null,
      freezeEndDate: null,
    },
    include: {
      plan: { select: { id: true, name: true } },
      member: { select: { id: true, memberId: true, firstName: true, lastName: true } },
    },
  });

  // Update member status
  await prisma.member.update({
    where: { id: membership.memberId },
    data: { status: 'ACTIVE' },
  });

  res.json({
    success: true,
    data: updatedMembership,
    message: 'Membership renewed successfully',
  });
});

export const freezeMembership = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const { freezeDays, reason } = req.body;

  const membership = await prisma.membership.findFirst({
    where: {
      id,
      member: { organizationId },
    },
    include: {
      plan: true,
    },
  });

  if (!membership) {
    throw new AppError('Membership not found', 404, 'NOT_FOUND');
  }

  if (membership.status !== 'ACTIVE') {
    throw new AppError('Only active memberships can be frozen', 400, 'INVALID_STATUS');
  }

  if (!membership.plan.freezeAllowed) {
    throw new AppError('This plan does not allow freezing', 400, 'FREEZE_NOT_ALLOWED');
  }

  const totalFreezeDays = membership.totalFreezeDays + freezeDays;
  if (totalFreezeDays > membership.plan.maxFreezeDays) {
    throw new AppError(
      `Maximum freeze days (${membership.plan.maxFreezeDays}) exceeded`,
      400,
      'MAX_FREEZE_EXCEEDED'
    );
  }

  const freezeStart = new Date();
  const freezeEnd = new Date();
  freezeEnd.setDate(freezeEnd.getDate() + freezeDays);

  // Extend the membership end date by freeze days
  const newEndDate = new Date(membership.endDate);
  newEndDate.setDate(newEndDate.getDate() + freezeDays);

  const updatedMembership = await prisma.membership.update({
    where: { id },
    data: {
      status: 'FROZEN',
      isFrozen: true,
      freezeStartDate: freezeStart,
      freezeEndDate: freezeEnd,
      totalFreezeDays,
      endDate: newEndDate,
    },
    include: {
      plan: { select: { id: true, name: true } },
      member: { select: { id: true, memberId: true, firstName: true, lastName: true } },
    },
  });

  // Update member status
  await prisma.member.update({
    where: { id: membership.memberId },
    data: { status: 'FROZEN' },
  });

  res.json({
    success: true,
    data: updatedMembership,
    message: `Membership frozen for ${freezeDays} days`,
  });
});

export const unfreezeMembership = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const membership = await prisma.membership.findFirst({
    where: {
      id,
      member: { organizationId },
    },
  });

  if (!membership) {
    throw new AppError('Membership not found', 404, 'NOT_FOUND');
  }

  if (membership.status !== 'FROZEN') {
    throw new AppError('Membership is not frozen', 400, 'INVALID_STATUS');
  }

  const updatedMembership = await prisma.membership.update({
    where: { id },
    data: {
      status: 'ACTIVE',
      isFrozen: false,
      freezeEndDate: new Date(),
    },
    include: {
      plan: { select: { id: true, name: true } },
      member: { select: { id: true, memberId: true, firstName: true, lastName: true } },
    },
  });

  // Update member status
  await prisma.member.update({
    where: { id: membership.memberId },
    data: { status: 'ACTIVE' },
  });

  res.json({
    success: true,
    data: updatedMembership,
    message: 'Membership unfrozen successfully',
  });
});

export const cancelMembership = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const membership = await prisma.membership.findFirst({
    where: {
      id,
      member: { organizationId },
    },
  });

  if (!membership) {
    throw new AppError('Membership not found', 404, 'NOT_FOUND');
  }

  const updatedMembership = await prisma.membership.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      isFrozen: false,
    },
    include: {
      plan: { select: { id: true, name: true } },
      member: { select: { id: true, memberId: true, firstName: true, lastName: true } },
    },
  });

  // Update member status
  await prisma.member.update({
    where: { id: membership.memberId },
    data: { status: 'INACTIVE' },
  });

  res.json({
    success: true,
    data: updatedMembership,
    message: 'Membership cancelled',
  });
});

export const upgradeMembership = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const { newPlanId, newDurationId } = req.body;

  const membership = await prisma.membership.findFirst({
    where: {
      id,
      member: { organizationId },
    },
  });

  if (!membership) {
    throw new AppError('Membership not found', 404, 'NOT_FOUND');
  }

  // Verify new plan
  const newPlan = await prisma.plan.findFirst({
    where: { id: newPlanId, organizationId },
    include: { durations: true },
  });

  if (!newPlan) {
    throw new AppError('New plan not found', 404, 'PLAN_NOT_FOUND');
  }

  const duration = newPlan.durations.find(d => d.id === newDurationId);
  if (!duration) {
    throw new AppError('Invalid plan duration', 400, 'INVALID_DURATION');
  }

  // Calculate new end date from today
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + duration.durationMonths);

  const updatedMembership = await prisma.membership.update({
    where: { id },
    data: {
      planId: newPlanId,
      startDate,
      endDate,
      status: 'ACTIVE',
      isFrozen: false,
      remainingClassCredits: newPlan.classCredits,
      remainingPTSessions: newPlan.ptSessions,
    },
    include: {
      plan: { select: { id: true, name: true } },
      member: { select: { id: true, memberId: true, firstName: true, lastName: true } },
    },
  });

  res.json({
    success: true,
    data: updatedMembership,
    message: 'Membership upgraded successfully',
  });
});
