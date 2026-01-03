export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  organizationId: string;
  branchId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "TRAINER" | "STAFF";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  isMain: boolean;
}

export interface Member {
  id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  qrCode: string;
  status: MemberStatus;
  joinDate: string;
  trainerId?: string;
  trainer?: Pick<User, "id" | "firstName" | "lastName" | "avatar">;
  branchId: string;
  branch?: Branch;
  currentMembership?: Membership;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type MemberStatus = "ACTIVE" | "INACTIVE" | "FROZEN" | "EXPIRED" | "BLOCKED";

export interface Plan {
  id: string;
  name: string;
  description?: string;
  features: string[];
  durations: PlanDuration[];
  includesClasses: boolean;
  classCredits?: number;
  includesPT: boolean;
  ptSessions?: number;
  includesLocker: boolean;
  includesParking: boolean;
  freezeAllowed: boolean;
  maxFreezeDays: number;
  isPopular: boolean;
  displayOrder: number;
  color?: string;
  isActive: boolean;
}

export interface PlanDuration {
  id: string;
  durationMonths: number;
  price: number;
  discountPercent: number;
  registrationFee: number;
  isActive: boolean;
}

export interface Membership {
  id: string;
  memberId: string;
  planId: string;
  plan?: Plan;
  startDate: string;
  endDate: string;
  isFrozen: boolean;
  freezeStartDate?: string;
  freezeEndDate?: string;
  totalFreezeDays: number;
  status: MembershipStatus;
  remainingClassCredits?: number;
  remainingPTSessions?: number;
}

export type MembershipStatus = "ACTIVE" | "EXPIRED" | "FROZEN" | "CANCELLED";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  memberId: string;
  member?: Member;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  notes?: string;
}

export type InvoiceStatus = "PENDING" | "PAID" | "PARTIAL" | "CANCELLED" | "REFUNDED";

export interface InvoiceItem {
  id: string;
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  referenceId?: string;
  referenceType?: string;
}

export type InvoiceItemType =
  | "REGISTRATION"
  | "MEMBERSHIP"
  | "RENEWAL"
  | "PT_SESSION"
  | "CLASS"
  | "PRODUCT"
  | "ADDON"
  | "OTHER";

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  memberId: string;
  member?: Member;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  collectedById?: string;
  collectedBy?: User;
  notes?: string;
  createdAt: string;
}

export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "UPI"
  | "NET_BANKING"
  | "WALLET"
  | "CHEQUE"
  | "BANK_TRANSFER"
  | "ONLINE";

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "REFUNDED";

export interface Class {
  id: string;
  name: string;
  description?: string;
  category: ClassCategory;
  difficulty: ClassDifficulty;
  durationMinutes: number;
  maxCapacity: number;
  waitlistEnabled: boolean;
  maxWaitlist: number;
  color?: string;
  image?: string;
  isActive: boolean;
}

export type ClassCategory =
  | "YOGA"
  | "ZUMBA"
  | "AEROBICS"
  | "SPINNING"
  | "HIIT"
  | "CROSSFIT"
  | "PILATES"
  | "KICKBOXING"
  | "DANCE"
  | "STRENGTH"
  | "SWIMMING"
  | "OTHER";

export type ClassDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";

export interface ClassSchedule {
  id: string;
  classId: string;
  class?: Class;
  branchId: string;
  branch?: Branch;
  instructorId: string;
  instructor?: User;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location?: string;
  isRecurring: boolean;
  specificDate?: string;
  isCancelled: boolean;
  bookedCount?: number;
  waitlistCount?: number;
}

export interface ClassBooking {
  id: string;
  scheduleId: string;
  schedule?: ClassSchedule;
  memberId: string;
  member?: Member;
  classDate: string;
  status: BookingStatus;
  isWaitlisted: boolean;
  waitlistPosition?: number;
  attended?: boolean;
  checkedInAt?: string;
}

export type BookingStatus = "CONFIRMED" | "CANCELLED" | "NO_SHOW" | "COMPLETED";

export interface Attendance {
  id: string;
  memberId: string;
  member?: Member;
  branchId: string;
  branch?: Branch;
  checkInTime: string;
  checkOutTime?: string;
  duration?: number;
  checkInMethod: CheckInMethod;
}

export type CheckInMethod = "QR_CODE" | "MANUAL" | "BIOMETRIC" | "CARD";

export interface Lead {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone: string;
  interestedIn?: string;
  preferredTiming?: string;
  source: LeadSource;
  sourceDetails?: string;
  status: LeadStatus;
  assignedToId?: string;
  assignedTo?: User;
  nextFollowUp?: string;
  notes?: string;
  convertedMemberId?: string;
  convertedAt?: string;
  lostReason?: string;
  createdAt: string;
}

export type LeadSource =
  | "WALK_IN"
  | "WEBSITE"
  | "SOCIAL_MEDIA"
  | "REFERRAL"
  | "ADVERTISEMENT"
  | "CORPORATE"
  | "OTHER";

export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "INTERESTED"
  | "TOUR_SCHEDULED"
  | "TOUR_DONE"
  | "NEGOTIATION"
  | "WON"
  | "LOST";

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  todayCheckIns: number;
  expiringThisWeek: number;
  todayRevenue: number;
  newMembersThisMonth: number;
}

export interface Activity {
  type: "check_in" | "payment" | "new_member" | "booking";
  message: string;
  timestamp: string;
}
