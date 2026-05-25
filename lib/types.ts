export type UserRole = "worker" | "employer" | "admin" | "superadmin";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  role: UserRole;
  nicVerified?: boolean;
  suspended?: boolean;
  agreedToTerms?: boolean;
  agreedToTermsAt?: any;
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
  createdAt?: any;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt?: any;
}
