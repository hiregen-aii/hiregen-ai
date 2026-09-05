export type UserStatus =
  | "Active"
  | "Inactive"
  | "Pending";

export type CompanyStatus =
  | "Active"
  | "Waiting";

export type VerificationStatus =
  | "Verified"
  | "Pending";

export type RoleStatus =
  | "Active"
  | "Limited";

export type ActivityStatus =
  | "Success"
  | "Completed"
  | "Approved"
  | "Running"
  | "Removed"
  | "Saved"
  | "Passed";

export interface AdminStat {
  id: number;
  title: string;
  value: number;
  icon: string;
  color: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: UserStatus;
  lastLogin: string;
}

export interface Role {
  id: number;
  name: string;
  users: number;
  permissions: string;
  status: RoleStatus;
}

export interface Company {
  id: number;
  name: string;
  email: string;
  industry: string;
  website: string;
  phone: string;
  location: string;
  verification: VerificationStatus;
  status: CompanyStatus;
}

export interface ActivityLog {
  id: number;
  date: string;
  admin: string;
  activity: string;
  module: string;
  status: ActivityStatus;
}

export interface AddUserForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: UserStatus;
}

export interface AddRoleForm {
  name: string;
  permissions: string;
  status: RoleStatus;
}

export interface AddCompanyForm {
  name: string;
  email: string;
  industry: string;
  website: string;
  phone: string;
  location: string;
  verification: VerificationStatus;
  status: CompanyStatus;
}

export interface DeleteModalState {
  open: boolean;
  type: "user" | "role" | "company";
  id: number | null;
}

export interface ViewModalState {
  open: boolean;
  type: "user" | "role" | "company";
  data: User | Role | Company | null;
}