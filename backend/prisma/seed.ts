import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Organization
  const organization = await prisma.organization.upsert({
    where: { slug: "gympro-demo" },
    update: {},
    create: {
      name: "GymPro Demo",
      slug: "gympro-demo",
      email: "info@gympro.com",
      phone: "9876543210",
      address: "123 Fitness Street",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400001",
      taxEnabled: true,
      taxName: "GST",
      taxPercentage: 18,
    },
  });

  console.log("✅ Organization created:", organization.name);

  // Create Branch
  const branch = await prisma.branch.upsert({
    where: { id: "main-branch" },
    update: {},
    create: {
      id: "main-branch",
      organizationId: organization.id,
      name: "Main Branch",
      code: "MAIN",
      address: "123 Fitness Street",
      city: "Mumbai",
      phone: "9876543210",
      email: "main@gympro.com",
      isMain: true,
    },
  });

  console.log("✅ Branch created:", branch.name);

  // Create Admin User
  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gympro.com" },
    update: {},
    create: {
      email: "admin@gympro.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      phone: "9876543210",
      role: "ADMIN",
      organizationId: organization.id,
      branchId: branch.id,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create some membership plans
  const basicPlan = await prisma.plan.upsert({
    where: { id: "basic-plan" },
    update: {},
    create: {
      id: "basic-plan",
      organizationId: organization.id,
      name: "Basic",
      description: "Access to gym equipment during standard hours",
      features: ["Gym access", "Locker room", "Basic equipment"],
      accessAllBranches: false,
      accessAllDays: true,
      accessAllHours: false,
      allowedStartTime: "06:00",
      allowedEndTime: "22:00",
      includesClasses: false,
      includesPT: false,
      freezeAllowed: true,
      maxFreezeDays: 15,
      displayOrder: 1,
      color: "#6B7280",
    },
  });

  await prisma.planDuration.createMany({
    data: [
      { planId: basicPlan.id, durationMonths: 1, price: 1500, registrationFee: 500 },
      { planId: basicPlan.id, durationMonths: 3, price: 4000, discountPercent: 11, registrationFee: 500 },
      { planId: basicPlan.id, durationMonths: 6, price: 7500, discountPercent: 17, registrationFee: 0 },
      { planId: basicPlan.id, durationMonths: 12, price: 14000, discountPercent: 22, registrationFee: 0 },
    ],
    skipDuplicates: true,
  });

  const premiumPlan = await prisma.plan.upsert({
    where: { id: "premium-plan" },
    update: {},
    create: {
      id: "premium-plan",
      organizationId: organization.id,
      name: "Premium",
      description: "Full access including group classes",
      features: ["Gym access", "All group classes", "Locker room", "Towel service", "Sauna access"],
      accessAllBranches: true,
      accessAllDays: true,
      accessAllHours: true,
      includesClasses: true,
      includesPT: false,
      freezeAllowed: true,
      maxFreezeDays: 30,
      isPopular: true,
      displayOrder: 2,
      color: "#10B981",
    },
  });

  await prisma.planDuration.createMany({
    data: [
      { planId: premiumPlan.id, durationMonths: 1, price: 2500, registrationFee: 500 },
      { planId: premiumPlan.id, durationMonths: 3, price: 7000, discountPercent: 7, registrationFee: 500 },
      { planId: premiumPlan.id, durationMonths: 6, price: 13000, discountPercent: 13, registrationFee: 0 },
      { planId: premiumPlan.id, durationMonths: 12, price: 24000, discountPercent: 20, registrationFee: 0 },
    ],
    skipDuplicates: true,
  });

  const vipPlan = await prisma.plan.upsert({
    where: { id: "vip-plan" },
    update: {},
    create: {
      id: "vip-plan",
      organizationId: organization.id,
      name: "VIP",
      description: "Premium access with personal training sessions",
      features: ["All Premium features", "4 PT sessions/month", "Nutrition consultation", "Priority booking", "Guest passes"],
      accessAllBranches: true,
      accessAllDays: true,
      accessAllHours: true,
      includesClasses: true,
      includesPT: true,
      ptSessions: 4,
      includesLocker: true,
      includesParking: true,
      freezeAllowed: true,
      maxFreezeDays: 45,
      guestPassesPerMonth: 2,
      displayOrder: 3,
      color: "#F59E0B",
    },
  });

  await prisma.planDuration.createMany({
    data: [
      { planId: vipPlan.id, durationMonths: 1, price: 5000, registrationFee: 0 },
      { planId: vipPlan.id, durationMonths: 3, price: 14000, discountPercent: 7, registrationFee: 0 },
      { planId: vipPlan.id, durationMonths: 6, price: 27000, discountPercent: 10, registrationFee: 0 },
      { planId: vipPlan.id, durationMonths: 12, price: 50000, discountPercent: 17, registrationFee: 0 },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Plans created: Basic, Premium, VIP");

  // Create some sample members
  const members = [
    { firstName: "John", lastName: "Doe", email: "john@example.com", phone: "9876543001", gender: "MALE" as const },
    { firstName: "Jane", lastName: "Smith", email: "jane@example.com", phone: "9876543002", gender: "FEMALE" as const },
    { firstName: "Mike", lastName: "Johnson", email: "mike@example.com", phone: "9876543003", gender: "MALE" as const },
    { firstName: "Sarah", lastName: "Wilson", email: "sarah@example.com", phone: "9876543004", gender: "FEMALE" as const },
    { firstName: "Alex", lastName: "Brown", email: "alex@example.com", phone: "9876543005", gender: "MALE" as const },
  ];

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    await prisma.member.upsert({
      where: { memberId: `GYM${String(i + 1).padStart(4, "0")}` },
      update: {},
      create: {
        memberId: `GYM${String(i + 1).padStart(4, "0")}`,
        organizationId: organization.id,
        branchId: branch.id,
        ...m,
        status: i < 3 ? "ACTIVE" : i === 3 ? "FROZEN" : "EXPIRED",
        joinDate: new Date(Date.now() - (180 - i * 30) * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("✅ Sample members created");

  console.log("\n🎉 Seeding completed!");
  console.log("\n📧 Login credentials:");
  console.log("   Email: admin@gympro.com");
  console.log("   Password: admin123\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
