export type UserRole = "worker" | "employer";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  location?: string;
  bio?: string;
  photoURL?: string;
  createdAt: any;
}

export interface WorkerProfile {
  userId: string;
  skills: string[];
  hourlyRate?: number;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
}

export interface Job {
  id?: string;
  employerId: string;
  employerName: string;
  title: string;
  description: string;
  category: string;
  location: string;
  payRate: number;
  payType: "hourly" | "fixed";
  status: "open" | "in_progress" | "completed" | "cancelled";
  isUrgent: boolean;
  createdAt: any;
}

export interface Application {
  id?: string;
  jobId: string;
  jobTitle: string;
  workerId: string;
  workerName: string;
  message?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: any;
}

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: any;
}

export interface Review {
  id?: string;
  jobId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  createdAt: any;
}

export const SERVICE_CATEGORIES = [
  "Plumbing","Electrical","Welding","Glass Fitting",
  "Computer Repairs","Cleaning","Vehicle Washing",
  "Painting","Household Help","Loading & Logistics",
];
