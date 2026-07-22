export type TenantStatus = "trial" | "active" | "suspended" | "expired";
export type TenantPlan = "basic" | "standard" | "pro";

export interface Tenant {
  id: string;
  academy_name_ar: string;
  academy_name_en: string;
  logo_url: string | null;
  color_primary: string;
  color_secondary: string;
  color_accent: string;
  color_dark: string;
  contact_phone: string | null;
  contact_email: string | null;
  welcome_message: string;
  subdomain: string;
  custom_domain: string | null;
  owner_name: string;
  owner_email: string;
  owner_phone: string | null;
  plan: TenantPlan;
  max_branches: number;
  max_students: number;
  status: TenantStatus;
  trial_ends_at: string;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Subset of Tenant safe to inject into the page as CSS vars / render pre-auth. */
export type TenantBranding = Pick<
  Tenant,
  | "id"
  | "academy_name_ar"
  | "academy_name_en"
  | "logo_url"
  | "color_primary"
  | "color_secondary"
  | "color_accent"
  | "color_dark"
  | "status"
  | "trial_ends_at"
  | "subscription_ends_at"
  | "welcome_message"
>;

export interface SuperAdmin {
  id: string;
  auth_user_id: string;
  username: string;
  created_at: string;
}

export interface Subscription {
  id: number;
  tenant_id: string;
  plan: TenantPlan;
  amount: number;
  currency: string;
  branches_included: number;
  students_included: number;
  status: "pending" | "active" | "cancelled" | "expired";
  payment_ref: string | null;
  payment_note: string | null;
  starts_at: string | null;
  ends_at: string | null;
  activated_by: string | null;
  activated_at: string | null;
  created_at: string;
}

export interface BranchAddon {
  id: number;
  tenant_id: string;
  branches: number;
  amount: number;
  currency: string;
  status: "pending" | "active" | "rejected";
  payment_ref: string | null;
  activated_by: string | null;
  activated_at: string | null;
  created_at: string;
}

export type StaffRole = "admin" | "staff";

export interface Staff {
  id: string;
  tenant_id: string;
  auth_user_id: string;
  username: string;
  branch_id: number | null;
  role: StaffRole;
  active: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  tenant_id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface Branch {
  id: number;
  tenant_id: string;
  name_ar: string;
  name_en: string | null;
  active: boolean;
  created_at: string;
}

export interface Student {
  id: number;
  tenant_id: string;
  full_name: string;
  phone: string;
  branch_id: number | null;
  points: number;
  active: boolean;
  joined_at: string;
  created_at: string;
}

export type PointsLogType = "grant" | "redeem" | "excel" | "manual" | "adjustment";

export interface PointsLog {
  id: number;
  tenant_id: string;
  student_id: number;
  points: number;
  action: string;
  type: PointsLogType;
  granted_by: string;
  branch_id: number | null;
  note: string | null;
  created_at: string;
}

export interface Reward {
  id: number;
  tenant_id: string;
  name_ar: string;
  name_en: string | null;
  description: string | null;
  points_required: number;
  active: boolean;
  redeemed_count: number;
  created_at: string;
}

export type RedemptionStatus = "pending" | "approved" | "rejected";

export interface Redemption {
  id: number;
  tenant_id: string;
  student_id: number;
  reward_id: number;
  status: RedemptionStatus;
  redeemed_at: string;
  approved_by: string | null;
  note: string | null;
}

export interface TenantStats {
  tenant_id: string;
  academy_name_ar: string;
  plan: TenantPlan;
  status: TenantStatus;
  max_branches: number;
  max_students: number;
  subscription_ends_at: string | null;
  trial_ends_at: string;
  branches_used: number;
  students_count: number;
  addon_branches: number;
  total_branches_allowed: number;
  total_revenue: number;
}

export interface LimitCheckResult {
  allowed: boolean;
  reason?: "subscription_inactive" | "trial_expired" | "branch_limit_reached" | "student_limit_reached";
  current?: number;
  max?: number;
}
