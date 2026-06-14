export type UserRole = "worker" | "employer" | "admin" | "superadmin";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  role: UserRole;
  roles?: string[];
  activeRole?: string;
  nicVerified?: boolean;
  nicPending?: boolean;
  suspended?: boolean;
  agreedToTerms?: boolean;
  createdAt?: any;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  payRate: number;
  payType: "hour" | "day" | "job";
  employerId: string;
  employerName: string;
  status: "open" | "in_progress" | "completed" | "cancelled";
  isUrgent: boolean;
  activeTimerSession?: string;
  timerStatus?: string;
  createdAt?: any;
}
