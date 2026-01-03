import { type Request, type Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { AppError, asyncHandler } from '../middlewares/error.middleware.js';

export const getPlans = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { includeInactive } = req.query;

  const where: any = { organizationId };
  if (!includeInactive) {
    where.isActive = true;
  }

  const plans = await prisma.plan.findMany({
    where,
    include: {
      durations: {
        where: { isActive: true },
        orderBy: { durationMonths: 'asc' },
      },
      _count: {
        select: { memberships: true },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  res.json({
    success: true,
    data: plans,
  });
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const plan = await prisma.plan.findFirst({
    where: { id, organizationId },
    include: {
      durations: {
        orderBy: { durationMonths: 'asc' },
      },
      _count: {
        select: { memberships: true },
      },
    },
  });

  if (!plan) {
    throw new AppError('Plan not found', 404, 'NOT_FOUND');
  }

  res.json({
    success: true,
    data: plan,
  });
});

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const organizationId = req.user!.organizationId;
  const { durations, ...planData } = req.body;

  const plan = await prisma.plan.create({
    data: {
      ...planData,
      organizationId,
      durations: {
        create: durations || [],
      },
    },
    include: {
      durations: true,
    },
  });

  res.status(201).json({
    success: true,
    data: plan,
    message: 'Plan created successfully',
  });
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;
  const { durations, ...planData } = req.body;

  const existing = await prisma.plan.findFirst({
    where: { id, organizationId },
  });

  if (!existing) {
    throw new AppError('Plan not found', 404, 'NOT_FOUND');
  }

  // Update plan and handle durations
  const plan = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Update plan data
    const updatedPlan = await tx.plan.update({
      where: { id },
      data: planData,
    });

    // If durations provided, update them
    if (durations && Array.isArray(durations)) {
      // Delete existing durations
      await tx.planDuration.deleteMany({
        where: { planId: id },
      });

      // Create new durations
      await tx.planDuration.createMany({
        data: durations.map((d: any) => ({
          planId: id,
          durationMonths: d.durationMonths,
          price: d.price,
          discountPercent: d.discountPercent || 0,
          registrationFee: d.registrationFee || 0,
          isActive: d.isActive ?? true,
        })),
      });
    }

    return tx.plan.findUnique({
      where: { id },
      include: { durations: true },
    });
  });

  res.json({
    success: true,
    data: plan,
    message: 'Plan updated successfully',
  });
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user!.organizationId;

  const existing = await prisma.plan.findFirst({
    where: { id, organizationId },
    include: {
      _count: { select: { memberships: true } },
    },
  });

  if (!existing) {
    throw new AppError('Plan not found', 404, 'NOT_FOUND');
  }

  // If plan has memberships, soft delete (deactivate)
  if (existing._count.memberships > 0) {
    await prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: 'Plan deactivated (has active memberships)',
    });
  } else {
    // Hard delete if no memberships
    await prisma.plan.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  }
});

// Get public plans (for member-facing pages)
export const getPublicPlans = asyncHandler(async (req: Request, res: Response) => {
  const { organizationSlug } = req.params;

  const organization = await prisma.organization.findUnique({
    where: { slug: organizationSlug },
  });

  if (!organization) {
    throw new AppError('Organization not found', 404, 'NOT_FOUND');
  }

  const plans = await prisma.plan.findMany({
    where: {
      organizationId: organization.id,
      isActive: true,
    },
    include: {
      durations: {
        where: { isActive: true },
        orderBy: { durationMonths: 'asc' },
      },
    },
    orderBy: { displayOrder: 'asc' },
  });

  res.json({
    success: true,
    data: plans,
  });
});
