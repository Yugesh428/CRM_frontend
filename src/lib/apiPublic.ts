// ==========================================
// PUBLIC API CLIENT (No Authentication Required)
// ==========================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==========================================
// TYPES
// ==========================================

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role?: "admin" | "receptionist" | "visa_officer" | "documentation_officer" | "counselor";
  phone?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { msg: string; param?: string; location?: string }[];
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  organizationId: number | null;
  phone?: string;
  designation?: string;
  profilePhoto?: string;
  bio?: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  status: string;
  subscriptionPlan: string;
  logo: string | null;
  settings?: any;
}

export interface LoginResponse {
  user: User;
  organization: Organization | null;
  token: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking: number | null;
  logo: string | null;
  website: string | null;
  description: string | null;
}

export interface Course {
  id: string;
  universityId: string;
  name: string;
  level: string;
  duration: string;
  tuitionFee: number | null;
  applicationFee: number | null;
  description: string | null;
}

// ==========================================
// AUTH ENDPOINTS
// ==========================================

export async function login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function register(payload: RegisterPayload): Promise<ApiResponse<LoginResponse>> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ==========================================
// PUBLIC DATA ENDPOINTS
// ==========================================

export async function getUniversities(params?: {
  country?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ universities: University[]; total: number }>> {
  const query = new URLSearchParams();
  if (params?.country) query.append("country", params.country);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/universities?${query}`);
  return res.json();
}

export async function getUniversityById(id: string): Promise<ApiResponse<University>> {
  const res = await fetch(`${API_BASE}/api/universities/${id}`);
  return res.json();
}

export async function getCourses(params?: {
  universityId?: string;
  level?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ courses: Course[]; total: number }>> {
  const query = new URLSearchParams();
  if (params?.universityId) query.append("universityId", params.universityId);
  if (params?.level) query.append("level", params.level);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/courses?${query}`);
  return res.json();
}

export async function getCourseById(id: string): Promise<ApiResponse<Course>> {
  const res = await fetch(`${API_BASE}/api/courses/${id}`);
  return res.json();
}

export async function getCampuses(universityId?: string): Promise<ApiResponse<any[]>> {
  const query = universityId ? `?universityId=${universityId}` : "";
  const res = await fetch(`${API_BASE}/api/campuses${query}`);
  return res.json();
}

export async function getIntakes(courseId?: string): Promise<ApiResponse<any[]>> {
  const query = courseId ? `?courseId=${courseId}` : "";
  const res = await fetch(`${API_BASE}/api/intakes${query}`);
  return res.json();
}

export async function getCourseRequirements(courseId: string): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_BASE}/api/course-requirements?courseId=${courseId}`);
  return res.json();
}

export async function getFees(courseId?: string): Promise<ApiResponse<any[]>> {
  const query = courseId ? `?courseId=${courseId}` : "";
  const res = await fetch(`${API_BASE}/api/fees${query}`);
  return res.json();
}

export async function getScholarships(params?: {
  universityId?: string;
  country?: string;
}): Promise<ApiResponse<any[]>> {
  const query = new URLSearchParams();
  if (params?.universityId) query.append("universityId", params.universityId);
  if (params?.country) query.append("country", params.country);

  const res = await fetch(`${API_BASE}/api/scholarships?${query}`);
  return res.json();
}

// ==========================================
// HEALTH CHECK
// ==========================================

export async function healthCheck(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}
