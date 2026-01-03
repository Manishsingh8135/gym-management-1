import { Router } from 'express';
import authRoutes from './auth.routes.js';
import memberRoutes from './member.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import planRoutes from './plan.routes.js';
import membershipRoutes from './membership.routes.js';
import paymentRoutes from './payment.routes.js';
import attendanceRoutes from './attendance.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/members', memberRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/plans', planRoutes);
router.use('/memberships', membershipRoutes);
router.use('/payments', paymentRoutes);
router.use('/attendance', attendanceRoutes);

export default router;
