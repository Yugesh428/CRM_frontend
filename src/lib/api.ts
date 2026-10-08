// ==========================================
// AUTHENTICATED API CLIENT (Requires Token)
// ==========================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==========================================
// HELPER TO GET TOKEN
// ==========================================

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// ==========================================
// TYPES
// ==========================================

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
  employeeCode?: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  bio?: string;
  profilePhoto?: string;
  designation?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export interface CreateUserPayload {
  fullName: string;
  email: string;
  role: "admin" | "receptionist" | "visa_officer" | "documentation_officer" | "counselor" | "teacher" | "student";
  phone?: string;
  designation?: string;
  employeeCode?: string;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  role?: string;
  phone?: string;
  isActive?: boolean;
  designation?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalApplications: number;
  pendingApplications: number;
  totalOrganizations: number;
  [key: string]: any;
}

// ==========================================
// AUTH PROFILE ENDPOINTS
// ==========================================

export async function getProfile(): Promise<ApiResponse<{ user: User; organization: any }>> {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<ApiResponse<{ user: User }>> {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function changePassword(payload: ChangePasswordPayload): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ==========================================
// ADMIN - DASHBOARD
// ==========================================

export async function getAdminDashboard(): Promise<ApiResponse<DashboardStats>> {
  const res = await fetch(`${API_BASE}/api/admin/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// ADMIN - USER MANAGEMENT
// ==========================================

export async function getAllUsers(params?: {
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<User[]>> {
  const query = new URLSearchParams();
  if (params?.role) query.append("role", params.role);
  if (params?.isActive !== undefined) query.append("isActive", params.isActive.toString());
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/admin/users?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getUsersByRole(role: string): Promise<ApiResponse<User[]>> {
  const res = await fetch(`${API_BASE}/api/admin/users/role/${role}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getUserById(id: string | number): Promise<ApiResponse<User>> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createUser(payload: CreateUserPayload): Promise<ApiResponse<{ user: User; generatedPassword: string }>> {
  const res = await fetch(`${API_BASE}/api/admin/users`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateUser(id: string | number, payload: UpdateUserPayload): Promise<ApiResponse<{ user: User }>> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteUser(id: string | number): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function toggleUserStatus(id: string | number): Promise<ApiResponse<{ user: User }>> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}/toggle-status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function resetUserPassword(id: string | number): Promise<ApiResponse<{ newPassword: string }>> {
  const res = await fetch(`${API_BASE}/api/admin/users/${id}/reset-password`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// ADMIN - TEACHER MANAGEMENT
// ==========================================

export async function getAllTeachers(): Promise<ApiResponse<User[]>> {
  const res = await fetch(`${API_BASE}/api/admin/teachers`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createTeacher(payload: CreateUserPayload): Promise<ApiResponse<{ user: User; generatedPassword: string }>> {
  const res = await fetch(`${API_BASE}/api/admin/teachers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateTeacher(id: string | number, payload: UpdateUserPayload): Promise<ApiResponse<{ user: User }>> {
  const res = await fetch(`${API_BASE}/api/admin/teachers/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteTeacher(id: string | number): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/admin/teachers/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// APPLICATIONS - placeholder, full interface & functions defined below
// ==========================================

// ==========================================
// VISA MANAGEMENT
// ==========================================

export async function getVisaDashboard(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/visa/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getAllVisaCases(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<any>> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/visa?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getVisaCaseById(id: string): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/visa/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createVisaCase(payload: any): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/visa`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

// ==========================================
// ENGLISH TESTS
// ==========================================

export async function getEnglishTestDashboard(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/english-tests/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getAllEnrollments(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<any>> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/english-tests/enrollments?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getEnrollmentById(id: string): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/english-tests/enrollments/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// ORGANIZATIONS (Super Admin Only)
// ==========================================

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  subscriptionPlan: "free" | "basic" | "professional" | "enterprise";
  status: "active" | "suspended" | "trial" | "expired";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  trialEndDate?: string;
  maxUsers: number;
  maxLeads: number;
  maxStudents: number;
  maxStorage: number;
  currentUsers: number;
  currentLeads: number;
  currentStudents: number;
  currentStorage: number;
  settings?: any;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  adminCount?: number;
}

export interface CreateOrganizationPayload {
  name: string;
  slug?: string;
  description?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  subscriptionPlan?: "free" | "basic" | "professional" | "enterprise";
  subscriptionEndDate?: string;
  trialEndDate?: string;
  maxUsers?: number;
  maxLeads?: number;
  maxStudents?: number;
  maxStorage?: number;
  settings?: any;
  adminName?: string;
  adminEmail?: string;
  adminPhone?: string;
}

export interface UpdateOrganizationPayload {
  name?: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  website?: string;
  subscriptionPlan?: "free" | "basic" | "professional" | "enterprise";
  status?: "active" | "suspended" | "trial" | "expired";
  subscriptionEndDate?: string;
  trialEndDate?: string;
  maxUsers?: number;
  maxLeads?: number;
  maxStudents?: number;
  maxStorage?: number;
  settings?: any;
}

export async function getAllOrganizations(params?: {
  status?: string;
  plan?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ organizations: Organization[]; total: number }>> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.plan) query.append("plan", params.plan);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/organizations?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getOrganizationById(id: string): Promise<ApiResponse<Organization>> {
  const res = await fetch(`${API_BASE}/api/organizations/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createOrganization(payload: CreateOrganizationPayload): Promise<ApiResponse<{ organization: Organization; admin: any; emailSent: boolean; temporaryPassword?: string }>> {
  const res = await fetch(`${API_BASE}/api/organizations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateOrganization(id: string, payload: UpdateOrganizationPayload): Promise<ApiResponse<Organization>> {
  const res = await fetch(`${API_BASE}/api/organizations/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function toggleOrganizationStatus(id: string, status: string, reason?: string): Promise<ApiResponse<Organization>> {
  const res = await fetch(`${API_BASE}/api/organizations/${id}/toggle-status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason }),
  });
  return res.json();
}

export async function deleteOrganization(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/organizations/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getOrganizationUsers(id: string, role?: string): Promise<ApiResponse<User[]>> {
  const query = role ? `?role=${role}` : "";
  const res = await fetch(`${API_BASE}/api/organizations/${id}/users${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getPlatformStatistics(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/organizations/statistics`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// PERMISSIONS & PERMISSION GROUPS
// ==========================================

export interface PermissionGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Array<{
    module: string;
    action: string;
    scope: string;
    resource?: string | null;
  }>;
  status: "active" | "inactive";
  permissionCount?: number;
  staffCount?: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionGroupPayload {
  name: string;
  code?: string;
  description?: string;
  permissions: Array<{
    module: string;
    action: string;
    scope: string;
    resource?: string | null;
  }>;
  status?: "active" | "inactive";
}

// Permission Groups
export async function getAllPermissionGroups(params?: { status?: string; search?: string }): Promise<ApiResponse<PermissionGroup[]>> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.search) query.append("search", params.search);

  const res = await fetch(`${API_BASE}/api/permission-groups?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getPermissionGroupById(id: string): Promise<ApiResponse<PermissionGroup>> {
  const res = await fetch(`${API_BASE}/api/permission-groups/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createPermissionGroup(payload: CreatePermissionGroupPayload): Promise<ApiResponse<PermissionGroup>> {
  const res = await fetch(`${API_BASE}/api/permission-groups`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updatePermissionGroup(id: string, payload: Partial<CreatePermissionGroupPayload>): Promise<ApiResponse<PermissionGroup>> {
  const res = await fetch(`${API_BASE}/api/permission-groups/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deletePermissionGroup(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/permission-groups/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function duplicatePermissionGroup(id: string): Promise<ApiResponse<PermissionGroup>> {
  const res = await fetch(`${API_BASE}/api/permission-groups/${id}/duplicate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getPermissionGroupMembers(id: string): Promise<ApiResponse<User[]>> {
  const res = await fetch(`${API_BASE}/api/permission-groups/${id}/members`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function assignUserToPermissionGroup(groupId: string, userId: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/permission-groups/assign-user`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ groupId, userId }),
  });
  return res.json();
}

export async function removeUserFromPermissionGroup(userId: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/permission-groups/remove-user`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });
  return res.json();
}

export async function getPermissionGroupStatistics(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/permission-groups/statistics`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// Individual Permissions
export async function getAvailablePermissions(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/permissions/available`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getUserPermissions(userId: string): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/permissions/user/${userId}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getMyPermissions(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/permissions/me`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function setBulkPermissions(userId: string, permissions: Array<{ module: string; action: string; scope: string; resource?: string }>): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/permissions/bulk`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, permissions }),
  });
  return res.json();
}

export async function grantPermission(userId: string, module: string, action: string, scope: string, resource?: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/permissions/grant`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, module, action, scope, resource }),
  });
  return res.json();
}

export async function revokePermission(userId: string, module: string, action: string, resource?: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/permissions/revoke`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId, module, action, resource }),
  });
  return res.json();
}

export async function copyPermissions(fromUserId: string, toUserId: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/permissions/copy`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ fromUserId, toUserId }),
  });
  return res.json();
}

// ==========================================
// STUDENT PORTAL
// ==========================================

export async function getStudentDashboard(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/student-portal/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getMyApplications(): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_BASE}/api/student-portal/applications`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// STAFF PORTAL
// ==========================================

export async function getStaffDashboard(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/staff-portal/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getAssignedApplications(): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_BASE}/api/staff-portal/applications`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// LEADS MANAGEMENT
// ==========================================

export interface Lead {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  highestQualification?: string;
  institution?: string;
  graduationYear?: string;
  gpaPercentage?: number;
  preferredCountry?: string;
  secondPreferredCountry?: string;
  preferredUniversityId?: string;
  preferredUniversityName?: string;
  preferredCourseId?: string;
  preferredCourseName?: string;
  degreeLevel?: string;
  preferredIntake?: string;
  estimatedBudget?: string;
  englishTestStatus?: string;
  // IELTS
  ieltsOverall?: number;
  ieltsListening?: number;
  ieltsReading?: number;
  ieltsWriting?: number;
  ieltsSpeaking?: number;
  ieltsExamDate?: string;
  // PTE
  pteOverall?: number;
  pteListening?: number;
  pteReading?: number;
  pteWriting?: number;
  pteSpeaking?: number;
  pteExamDate?: string;
  // TOEFL
  toeflTotal?: number;
  toeflListening?: number;
  toeflReading?: number;
  toeflWriting?: number;
  toeflSpeaking?: number;
  toeflExamDate?: string;
  // Duolingo / GRE / GMAT
  duolingoScore?: number;
  duolingoExamDate?: string;
  greScore?: number;
  gmatScore?: number;
  // Other
  academicBackground?: string;
  currentEducationStatus?: string;
  studyDestination?: string;
  leadType?: string;
  status: string;
  source: string;
  priority: string;
  preferredContactMethod?: string;
  remarks?: string;
  lastContactedDate?: string;
  nextFollowUpDate?: string;
  assignedToId?: string;
  assignedCounselor?: {
    id: string;
    fullName: string;
    email: string;
  };
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeadPayload {
  fullName: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  address?: string;
  city?: string;
  province?: string;
  country?: string;
  highestQualification?: string;
  institution?: string;
  graduationYear?: string;
  gpaPercentage?: number;
  preferredCountry?: string;
  secondPreferredCountry?: string;
  preferredUniversityName?: string;
  preferredCourseName?: string;
  degreeLevel?: string;
  preferredIntake?: string;
  estimatedBudget?: string;
  source?: string;
  priority?: string;
  preferredContactMethod?: string;
  remarks?: string;
  nextFollowUpDate?: string;
  assignedToId?: string;
}

export interface UpdateLeadPayload extends Partial<CreateLeadPayload> {
  status?: string;
  lastContactedDate?: string;
}

export async function getAllLeads(params?: {
  status?: string;
  source?: string;
  priority?: string;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ leads: Lead[]; total: number; meta: any }>> {
  const query = new URLSearchParams();
  if (params?.status) query.append("status", params.status);
  if (params?.source) query.append("source", params.source);
  if (params?.priority) query.append("priority", params.priority);
  if (params?.assignedToId) query.append("assignedToId", params.assignedToId);
  if (params?.search) query.append("search", params.search);
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/leads?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getLeadById(id: string): Promise<ApiResponse<Lead>> {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createLead(payload: CreateLeadPayload): Promise<ApiResponse<Lead>> {
  const res = await fetch(`${API_BASE}/api/leads`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateLead(id: string, payload: UpdateLeadPayload): Promise<ApiResponse<Lead>> {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteLead(id: string): Promise<ApiResponse> {
  const res = await fetch(`${API_BASE}/api/leads/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function assignLead(id: string, counselorId: string): Promise<ApiResponse<Lead>> {
  const res = await fetch(`${API_BASE}/api/leads/${id}/assign`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ counselorId }),
  });
  return res.json();
}

export async function getLeadsByStatus(status: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ leads: Lead[]; total: number }>> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/leads/status/${status}?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getLeadsBySource(source: string, params?: { page?: number; limit?: number }): Promise<ApiResponse<{ leads: Lead[]; total: number }>> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/leads/source/${source}?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getFollowUps(params?: { page?: number; limit?: number }): Promise<ApiResponse<{ followUps: Lead[]; total: number }>> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/leads/follow-ups?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getLeadReports(): Promise<ApiResponse<{
  totalLeads: number;
  convertedLeads: number;
  conversionRate: string;
  byStatus: Array<{ status: string; count: number }>;
  bySource: Array<{ source: string; count: number }>;
}>> {
  const res = await fetch(`${API_BASE}/api/leads/reports`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// LEAD NOTES & ACTIVITIES
// ==========================================

export interface LeadNote {
  id: string;
  leadId: string;
  note: string;
  createdBy: string;
  createdByUser?: {
    fullName: string;
  };
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  activityType: string;
  description: string;
  createdBy: string;
  createdByUser?: {
    fullName: string;
  };
  createdAt: string;
}

export async function getLeadNotes(leadId: string): Promise<ApiResponse<LeadNote[]>> {
  const res = await fetch(`${API_BASE}/api/leads/${leadId}/notes`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function addLeadNote(leadId: string, note: string): Promise<ApiResponse<LeadNote>> {
  const res = await fetch(`${API_BASE}/api/leads/${leadId}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ note }),
  });
  return res.json();
}

export async function getLeadActivities(leadId: string): Promise<ApiResponse<LeadActivity[]>> {
  const res = await fetch(`${API_BASE}/api/leads/${leadId}/activities`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}


// ==========================================
// UNIVERSITIES API
// ==========================================

export interface University {
  id: string;
  name: string;
  code: string;
  country: string;
  city: string;
  description?: string;
  website?: string;
  ranking?: string;
  type: "public" | "private" | "semi_government";
  logoUrl?: string;
  coverImageUrl?: string;
  introVideoUrl?: string;
  brochureUrl?: string;
  campusCount?: number;
  campusNames?: string[];
  intakes?: string[];
  partnerStatus: "partner" | "non_partner" | "preferred_partner";
  isActive: boolean;
  rating?: number;
  establishedYear?: number;
  totalStudents?: string;
  accreditation?: string;
  applicationFee?: string;
  admissionRequirements?: string;
  scholarshipsAvailable?: string;
  courseCount?: number;
  courses?: Course[];
  campuses?: Campus[];
  media?: {
    images: Media[];
    videos: Media[];
  };
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Media {
  id: string;
  url: string;
  mediaType: "image" | "video";
  mediableType: string;
  mediableId: string;
  thumbnailUrl?: string;
  altText?: string;
  caption?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  shortDescription?: string;
  discipline?: string;
  specialization?: string;
  level: string;
  mode: string;
  duration?: string;
  durationMonths?: number;
  intakes?: string[];
  tuitionFee?: number;
  currency?: string;
  applicationFee?: number;
  scholarshipAmount?: number;
  feeFrequency?: string;
  ieltsOverall?: number;
  pteOverall?: number;
  toeflTotal?: number;
  minimumGPA?: number;
  coverImageUrl?: string;
  isActive: boolean;
  isFeatured: boolean;
  isScholarshipAvailable: boolean;
  universityId: string;
  campusId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campus {
  id: string;
  name: string;
  campusType: "main" | "branch" | "satellite" | "online";
  status: "active" | "inactive" | "under_construction" | "temporarily_closed";
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  description?: string;
  establishedYear?: number;
  totalArea?: string;
  totalStudents?: number;
  totalFaculty?: number;
  facilities?: string[];
  intakes?: string[];
  availableDepartments?: string[];
  imageUrl?: string;
  mapUrl?: string;
  universityId: string;
  university?: {
    id: string;
    name: string;
    logoUrl?: string;
    country?: string;
    partnerStatus?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export async function getAllUniversities(params?: {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  type?: string;
  partnerStatus?: string;
  isActive?: boolean;
}): Promise<ApiResponse<University[]>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.search) queryParams.append("search", params.search);
  if (params?.country) queryParams.append("country", params.country);
  if (params?.type) queryParams.append("type", params.type);
  if (params?.partnerStatus) queryParams.append("partnerStatus", params.partnerStatus);
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());

  const res = await fetch(`${API_BASE}/api/universities?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getUniversityById(id: string): Promise<ApiResponse<University>> {
  const res = await fetch(`${API_BASE}/api/universities/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createUniversity(data: Partial<University>): Promise<ApiResponse<University>> {
  const res = await fetch(`${API_BASE}/api/universities`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateUniversity(id: string, data: Partial<University>): Promise<ApiResponse<University>> {
  const res = await fetch(`${API_BASE}/api/universities/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteUniversity(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/universities/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function toggleUniversityStatus(id: string, isActive: boolean): Promise<ApiResponse<University>> {
  const res = await fetch(`${API_BASE}/api/universities/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });
  return res.json();
}


// ========================================
// CAMPUSES API
// ========================================

export async function getAllCampuses(params?: {
  universityId?: string;
  city?: string;
  country?: string;
  campusType?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Campus[]>> {
  const queryParams = new URLSearchParams();
  if (params?.universityId) queryParams.append("universityId", params.universityId);
  if (params?.city) queryParams.append("city", params.city);
  if (params?.country) queryParams.append("country", params.country);
  if (params?.campusType) queryParams.append("campusType", params.campusType);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/campuses?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getCampusesByUniversity(universityId: string): Promise<ApiResponse<{ university: any; campuses: Campus[] }>> {
  const res = await fetch(`${API_BASE}/api/campuses/university/${universityId}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getCampusById(id: string): Promise<ApiResponse<Campus>> {
  const res = await fetch(`${API_BASE}/api/campuses/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createCampus(data: Partial<Campus>): Promise<ApiResponse<Campus>> {
  const res = await fetch(`${API_BASE}/api/campuses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCampus(id: string, data: Partial<Campus>): Promise<ApiResponse<Campus>> {
  const res = await fetch(`${API_BASE}/api/campuses/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCampus(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/campuses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function toggleCampusStatus(id: string): Promise<ApiResponse<{ id: string; status: string }>> {
  const res = await fetch(`${API_BASE}/api/campuses/${id}/toggle-status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ========================================
// COURSES API
// ========================================

export async function getAllCourses(params?: {
  universityId?: string;
  campusId?: string;
  level?: string;
  mode?: string;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ courses: Course[]; meta: any }>> {
  const queryParams = new URLSearchParams();
  if (params?.universityId) queryParams.append("universityId", params.universityId);
  if (params?.campusId) queryParams.append("campusId", params.campusId);
  if (params?.level) queryParams.append("level", params.level);
  if (params?.mode) queryParams.append("mode", params.mode);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const res = await fetch(`${API_BASE}/api/courses?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getCourseById(id: string): Promise<ApiResponse<Course>> {
  const res = await fetch(`${API_BASE}/api/courses/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createCourse(data: Partial<Course>): Promise<ApiResponse<Course>> {
  const res = await fetch(`${API_BASE}/api/courses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<ApiResponse<Course>> {
  const res = await fetch(`${API_BASE}/api/courses/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCourse(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/courses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}


// ==========================================
// INTAKES API
// ==========================================

export interface Intake {
  id: string;
  month: string;
  year: number;
  label?: string;
  applicationOpensDate?: string;
  applicationDeadline?: string;
  courseStartDate: string;
  courseEndDate?: string;
  orientationDate?: string;
  totalSeats?: number;
  availableSeats?: number;
  status: "upcoming" | "open" | "closing_soon" | "closed" | "cancelled" | "full";
  notes?: string;
  isFeatured: boolean;
  isActive: boolean;
  organizationId: string;
  courseId: string;
  universityId: string;
  campusId?: string;
  course?: { id: string; name: string; code: string; level?: string };
  university?: { id: string; name: string; logoUrl?: string; country?: string };
  campus?: { id: string; name: string; city?: string };
  createdAt: string;
  updatedAt: string;
}

export async function getAllIntakes(params?: {
  universityId?: string;
  courseId?: string;
  campusId?: string;
  status?: string;
  month?: string;
  year?: number;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Intake[]>> {
  const q = new URLSearchParams();
  if (params?.universityId) q.append("universityId", params.universityId);
  if (params?.courseId) q.append("courseId", params.courseId);
  if (params?.campusId) q.append("campusId", params.campusId);
  if (params?.status) q.append("status", params.status);
  if (params?.month) q.append("month", params.month);
  if (params?.year) q.append("year", params.year.toString());
  if (params?.search) q.append("search", params.search);
  if (params?.page) q.append("page", params.page.toString());
  if (params?.limit) q.append("limit", params.limit.toString());
  const res = await fetch(`${API_BASE}/api/intakes?${q.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getIntakeById(id: string): Promise<ApiResponse<Intake>> {
  const res = await fetch(`${API_BASE}/api/intakes/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createIntake(data: Partial<Intake>): Promise<ApiResponse<Intake>> {
  const res = await fetch(`${API_BASE}/api/intakes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateIntake(id: string, data: Partial<Intake>): Promise<ApiResponse<Intake>> {
  const res = await fetch(`${API_BASE}/api/intakes/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteIntake(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/intakes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}


// ==========================================
// FEES API
// ==========================================

export interface Fee {
  id: string;
  tuitionFee: number;
  feePeriod: "per_year" | "per_semester" | "per_trimester" | "per_credit" | "total_course";
  currency: "AUD" | "USD" | "GBP" | "CAD" | "NZD" | "EUR" | "JPY" | "SGD" | "INR" | "NPR" | "OTHER";
  applicationFee?: number;
  deposit?: number;
  enrollmentFee?: number;
  registrationFee?: number;
  insuranceFee?: number;
  studentServicesFee?: number;
  materialFee?: number;
  technologyFee?: number;
  otherFees?: number;
  otherFeesDescription?: string;
  estimatedLivingCost?: number;
  estimatedTotalCost?: number;
  feeNotes?: string;
  gstIncluded: boolean;
  gstPercentage?: number;
  academicYear: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  status: "current" | "expired" | "upcoming" | "draft";
  organizationId: string;
  courseId: string;
  universityId: string;
  campusId?: string;
  intakeId?: string;
  course?: { id: string; name: string; code: string; level?: string };
  university?: { id: string; name: string; logoUrl?: string; country?: string };
  campus?: { id: string; name: string; city?: string };
  intake?: { id: string; label: string; month: string; year: number };
  createdAt: string;
  updatedAt: string;
}

export async function getAllFees(params?: {
  universityId?: string;
  courseId?: string;
  campusId?: string;
  intakeId?: string;
  status?: string;
  academicYear?: string;
  currency?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Fee[]>> {
  const q = new URLSearchParams();
  if (params?.universityId) q.append("universityId", params.universityId);
  if (params?.courseId) q.append("courseId", params.courseId);
  if (params?.campusId) q.append("campusId", params.campusId);
  if (params?.intakeId) q.append("intakeId", params.intakeId);
  if (params?.status) q.append("status", params.status);
  if (params?.academicYear) q.append("academicYear", params.academicYear);
  if (params?.currency) q.append("currency", params.currency);
  if (params?.search) q.append("search", params.search);
  if (params?.page) q.append("page", params.page.toString());
  if (params?.limit) q.append("limit", params.limit.toString());
  const res = await fetch(`${API_BASE}/api/fees?${q.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getFeeById(id: string): Promise<ApiResponse<Fee>> {
  const res = await fetch(`${API_BASE}/api/fees/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getFeeHistoryByCourse(courseId: string): Promise<ApiResponse<Fee[]>> {
  const res = await fetch(`${API_BASE}/api/fees/course/${courseId}/history`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createFee(data: Partial<Fee>): Promise<ApiResponse<Fee>> {
  const res = await fetch(`${API_BASE}/api/fees`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateFee(id: string, data: Partial<Fee>): Promise<ApiResponse<Fee>> {
  const res = await fetch(`${API_BASE}/api/fees/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteFee(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/fees/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}


// ==========================================
// SCHOLARSHIPS API
// ==========================================

export interface Scholarship {
  id: string;
  name: string;
  description?: string;
  type: "merit_based" | "academic_excellence" | "need_based" | "early_application" | "country_specific" | "course_specific" | "diversity" | "sports" | "research" | "alumni" | "partial" | "full_tuition" | "other";
  amountType: "fixed_amount" | "percentage" | "full_tuition" | "partial_tuition";
  amount?: number;
  percentage?: number;
  currency: string;
  amountDescription?: string;
  eligibilityCriteria?: string;
  minimumGpa?: number;
  minimumIelts?: number;
  minimumPte?: number;
  minimumToefl?: number;
  eligibleCountries?: string;
  eligibleNationalities?: string;
  applicationOpenDate?: string;
  deadline?: string;
  applicationProcess?: string;
  requiredDocuments?: string;
  automaticConsideration: boolean;
  duration?: string;
  renewable: boolean;
  renewalCriteria?: string;
  numberOfAwards?: number;
  awardsRemaining?: number;
  websiteUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  termsAndConditions?: string;
  status: "active" | "expired" | "upcoming" | "suspended" | "draft";
  organizationId: string;
  universityId: string;
  courseId?: string;
  intakeId?: string;
  university?: { id: string; name: string; logoUrl?: string; country?: string };
  course?: { id: string; name: string; code: string };
  intake?: { id: string; label: string; month: string; year: number };
  createdAt: string;
  updatedAt: string;
}

export async function getAllScholarships(params?: {
  universityId?: string;
  courseId?: string;
  intakeId?: string;
  type?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Scholarship[]>> {
  const q = new URLSearchParams();
  if (params?.universityId) q.append("universityId", params.universityId);
  if (params?.courseId) q.append("courseId", params.courseId);
  if (params?.intakeId) q.append("intakeId", params.intakeId);
  if (params?.type) q.append("type", params.type);
  if (params?.status) q.append("status", params.status);
  if (params?.search) q.append("search", params.search);
  if (params?.page) q.append("page", params.page.toString());
  if (params?.limit) q.append("limit", params.limit.toString());
  const res = await fetch(`${API_BASE}/api/scholarships?${q.toString()}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getScholarshipById(id: string): Promise<ApiResponse<Scholarship>> {
  const res = await fetch(`${API_BASE}/api/scholarships/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createScholarship(data: Partial<Scholarship>): Promise<ApiResponse<Scholarship>> {
  const res = await fetch(`${API_BASE}/api/scholarships`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateScholarship(id: string, data: Partial<Scholarship>): Promise<ApiResponse<Scholarship>> {
  const res = await fetch(`${API_BASE}/api/scholarships/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteScholarship(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/scholarships/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}


// ==========================================
// FOLLOW-UPS API
// ==========================================

export interface FollowUp {
  id: string;
  leadId: string;
  counselorId: string;
  followUpDate: string;
  followUpTime?: string;
  followUpType: string;
  discussion?: string;
  studentRequirement?: string;
  counselorNotes?: string;
  followUpOutcome?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  status: string;
  completedAt?: string;
  durationMinutes?: number;
  isUrgent: boolean;
  reminderNote?: string;
  organizationId: string;
  counselor?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFollowUpPayload {
  leadId: string;
  counselorId: string;
  followUpDate: string;
  followUpTime?: string;
  followUpType: string;
  discussion?: string;
  studentRequirement?: string;
  counselorNotes?: string;
  followUpOutcome?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  status?: string;
  durationMinutes?: number;
  isUrgent?: boolean;
  reminderNote?: string;
}

export async function getFollowUpsByLead(leadId: string): Promise<ApiResponse<FollowUp[]>> {
  const res = await fetch(`${API_BASE}/api/follow-ups/lead/${leadId}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createFollowUp(payload: CreateFollowUpPayload): Promise<ApiResponse<FollowUp>> {
  const res = await fetch(`${API_BASE}/api/follow-ups`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateFollowUp(id: string, payload: Partial<CreateFollowUpPayload> & { status?: string }): Promise<ApiResponse<FollowUp>> {
  const res = await fetch(`${API_BASE}/api/follow-ups/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteFollowUp(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/follow-ups/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}


// ==========================================
// COUNSELORS API  (/api/counselors)
// ==========================================

export interface Counselor {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeCode?: string;
  designation?: string;
  bio?: string;
  profilePhoto?: string;
  departmentId?: string;
  specializations?: string[];
  isActive: boolean;
  joinedDate?: string;
  lastLogin?: string;
  lastActive?: string;
  createdAt: string;
  updatedAt: string;
  statistics?: {
    assignedLeads: number;
    activeStudents: number;
    applications: number;
    pendingFollowUps: number;
    convertedLeads: number;
  };
}

export interface CreateCounselorPayload {
  fullName: string;
  email: string;
  phone?: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  specializations?: string[];
  bio?: string;
  joinedDate?: string;
}

export interface UpdateCounselorPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  employeeCode?: string;
  departmentId?: string;
  designation?: string;
  specializations?: string[];
  bio?: string;
  profilePhoto?: string;
  isActive?: boolean;
}

export async function getAllCounselors(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ counselors?: Counselor[]; data?: Counselor[]; meta?: any }>> {
  const q = new URLSearchParams();
  if (params?.search) q.append("search", params.search);
  if (params?.status) q.append("status", params.status);
  if (params?.page) q.append("page", params.page.toString());
  if (params?.limit) q.append("limit", params.limit.toString());
  const res = await fetch(`${API_BASE}/api/counselors?${q}`, { headers: getAuthHeaders() });
  return res.json();
}

export async function getCounselorById(id: string): Promise<ApiResponse<Counselor>> {
  const res = await fetch(`${API_BASE}/api/counselors/${id}`, { headers: getAuthHeaders() });
  return res.json();
}

export async function createCounselor(payload: CreateCounselorPayload): Promise<ApiResponse<Counselor>> {
  const res = await fetch(`${API_BASE}/api/counselors`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateCounselor(id: string, payload: UpdateCounselorPayload): Promise<ApiResponse<Counselor>> {
  const res = await fetch(`${API_BASE}/api/counselors/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteCounselor(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/counselors/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function toggleCounselorStatus(id: string): Promise<ApiResponse<{ id: string; isActive: boolean }>> {
  const res = await fetch(`${API_BASE}/api/counselors/${id}/toggle-status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return res.json();
}


// ==========================================
// DEPARTMENTS API  (/api/departments)
// ==========================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: "active" | "inactive";
  departmentHeadId?: string;
  organizationId: string;
  staffCount?: number;
  departmentHead?: {
    id: string;
    fullName: string;
    email: string;
    employeeCode?: string;
    profilePhoto?: string;
  };
  staff?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  departmentHeadId?: string;
  status?: "active" | "inactive";
}

export interface UpdateDepartmentPayload {
  name?: string;
  code?: string;
  description?: string;
  departmentHeadId?: string | null;
  status?: "active" | "inactive";
}

export async function getAllDepartments(params?: {
  status?: string;
  search?: string;
}): Promise<ApiResponse<Department[]>> {
  const q = new URLSearchParams();
  if (params?.status) q.append("status", params.status);
  if (params?.search) q.append("search", params.search);
  const res = await fetch(`${API_BASE}/api/departments?${q}`, { headers: getAuthHeaders() });
  return res.json();
}

export async function getDepartmentById(id: string): Promise<ApiResponse<Department>> {
  const res = await fetch(`${API_BASE}/api/departments/${id}`, { headers: getAuthHeaders() });
  return res.json();
}

export async function createDepartment(payload: CreateDepartmentPayload): Promise<ApiResponse<Department>> {
  const res = await fetch(`${API_BASE}/api/departments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateDepartment(id: string, payload: UpdateDepartmentPayload): Promise<ApiResponse<Department>> {
  const res = await fetch(`${API_BASE}/api/departments/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteDepartment(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/departments/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getDepartmentStatistics(): Promise<ApiResponse<{
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  largestDepartment: { name: string; staffCount: number } | null;
  breakdown: { id: string; name: string; status: string; staffCount: number }[];
}>> {
  const res = await fetch(`${API_BASE}/api/departments/statistics`, { headers: getAuthHeaders() });
  return res.json();
}


// ==========================================
// STAFF API  (/api/staff)
// ==========================================

export interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  employeeCode?: string;
  departmentId?: string;
  designation?: string;
  bio?: string;
  profilePhoto?: string;
  specializations?: string[];
  isActive: boolean;
  joinedDate?: string;
  lastLogin?: string;
  lastActive?: string;
  assignedWork?: number;
  createdAt: string;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  employeeCode?: string;
  department?: string;
  designation?: string;
  specializations?: string[];
  bio?: string;
  joinedDate?: string;
}

export interface UpdateStaffPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: string;
  employeeCode?: string;
  departmentId?: string;
  designation?: string;
  specializations?: string[];
  bio?: string;
  isActive?: boolean;
}

export interface StaffStats {
  overview: {
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    onLeave: number;
  };
  byRole: {
    admins: number;
    receptionists: number;
    counselors: number;
    visaOfficers: number;
    documentationOfficers: number;
  };
}

export async function getAllStaff(params?: {
  search?: string;
  role?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<StaffMember[]>> {
  const q = new URLSearchParams();
  if (params?.search) q.append("search", params.search);
  if (params?.role) q.append("role", params.role);
  if (params?.department) q.append("department", params.department);
  if (params?.status) q.append("status", params.status);
  if (params?.page) q.append("page", params.page.toString());
  if (params?.limit) q.append("limit", params.limit.toString());
  const res = await fetch(`${API_BASE}/api/staff?${q}`, { headers: getAuthHeaders() });
  return res.json();
}

export async function getStaffStats(): Promise<ApiResponse<StaffStats>> {
  const res = await fetch(`${API_BASE}/api/staff/stats`, { headers: getAuthHeaders() });
  return res.json();
}

export async function getStaffById(id: string): Promise<ApiResponse<StaffMember>> {
  const res = await fetch(`${API_BASE}/api/staff/${id}`, { headers: getAuthHeaders() });
  return res.json();
}

export async function createStaff(payload: CreateStaffPayload): Promise<ApiResponse<StaffMember>> {
  const res = await fetch(`${API_BASE}/api/staff`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateStaff(id: string, payload: UpdateStaffPayload): Promise<ApiResponse<StaffMember>> {
  const res = await fetch(`${API_BASE}/api/staff/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function toggleStaffStatus(id: string): Promise<ApiResponse<{ id: string; isActive: boolean }>> {
  const res = await fetch(`${API_BASE}/api/staff/${id}/toggle-status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function resetStaffPassword(id: string): Promise<ApiResponse<{ email: string; emailSent: boolean }>> {
  const res = await fetch(`${API_BASE}/api/staff/${id}/reset-password`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return res.json();
}


// ========================================
// COURSE REQUIREMENTS API
// ========================================

export interface CourseRequirement {
  id: string;
  courseId: string;
  universityId: string;
  intakeId?: string | null;
  applicableCountry?: string | null;
  studyLevel?: string;
  // Academic
  minimumGPA?: number;
  minimumPercentage?: number;
  minimumQualification?: string;
  academicRequirementNotes?: string;
  requiredSubjects?: string[];
  subjectNotes?: string;
  // IELTS
  ieltsOverall?: number;
  ieltsListening?: number;
  ieltsReading?: number;
  ieltsWriting?: number;
  ieltsSpeaking?: number;
  // PTE
  pteOverall?: number;
  pteListening?: number;
  pteReading?: number;
  pteWriting?: number;
  pteSpeaking?: number;
  // TOEFL
  toeflTotal?: number;
  toeflListening?: number;
  toeflReading?: number;
  toeflWriting?: number;
  toeflSpeaking?: number;
  // Other tests
  duolingoScore?: number;
  satTotal?: number;
  actScore?: number;
  greTotal?: number;
  gmatTotal?: number;
  englishRequirementNotes?: string;
  moiAccepted?: boolean;
  englishWaiverAvailable?: boolean;
  // Work experience
  workExperienceRequired?: boolean;
  workExperienceYears?: number;
  workExperienceDetails?: string;
  // Study gap
  studyGapPolicy?: string;
  studyGapNotes?: string;
  // Documents
  requiredDocuments?: string[];
  documentNotes?: string;
  // Additional
  additionalRequirements?: string;
  scholarshipRequirements?: string;
  interviewRequired?: string;
  portfolioRequired?: string;
  countrySpecificNotes?: string;
  status?: string;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  course?: Course;
  university?: University;
  intake?: Intake;
}

export async function getAllCourseRequirements(params?: {
  courseId?: string;
  universityId?: string;
  intakeId?: string;
  country?: string;
  studyLevel?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<CourseRequirement[]>> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, String(value));
      }
    });
  }
  const res = await fetch(`${API_BASE}/api/course-requirements?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getCourseRequirementById(id: string): Promise<ApiResponse<CourseRequirement>> {
  const res = await fetch(`${API_BASE}/api/course-requirements/${id}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getRequirementsByCourse(
  courseId: string,
  params?: { country?: string; intakeId?: string }
): Promise<ApiResponse<any>> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });
  }
  const res = await fetch(`${API_BASE}/api/course-requirements/course/${courseId}?${query}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createCourseRequirement(data: Partial<CourseRequirement>): Promise<ApiResponse<CourseRequirement>> {
  const res = await fetch(`${API_BASE}/api/course-requirements`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCourseRequirement(id: string, data: Partial<CourseRequirement>): Promise<ApiResponse<CourseRequirement>> {
  const res = await fetch(`${API_BASE}/api/course-requirements/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteCourseRequirement(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/course-requirements/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function copyCourseRequirement(id: string, targetIntakeId: string): Promise<ApiResponse<CourseRequirement>> {
  const res = await fetch(`${API_BASE}/api/course-requirements/${id}/copy`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ targetIntakeId }),
  });
  return res.json();
}

// ==========================================
// APPLICATIONS
// ==========================================
export interface Application {
  id: string;
  applicationNumber: string;
  
  // Student Reference
  studentId: string;
  
  // University & Course Selection
  universityId: string;
  campusId?: string | null;
  courseId: string;
  intakeId: string;
  
  // Application Details
  applicationType?: "new_application" | "transfer" | "re_application" | "course_change";
  applicationChannel?: "consultancy" | "direct" | "agent" | "online_portal" | "walk_in";
  applicationDate: string;
  priority?: "low" | "medium" | "high" | "urgent";
  status?: "new" | "in_progress" | "documents_pending" | "ready_to_submit" | "submitted" | "offer_received" | "offer_accepted" | "rejected" | "withdrawn" | "visa";
  
  // Staff Assignment
  assignedStaffId?: string | null;
  applicationOfficerId?: string | null;
  visaOfficerId?: string | null;
  submittedById?: string | null;
  
  // Academic Information
  highestQualification?: string | null;
  institution?: string | null;
  graduationYear?: string | null;
  gpa?: number | null;
  percentage?: number | null;
  
  // English Test Information
  englishTest?: string | null;
  englishTestOverallScore?: number | null;
  englishTestDate?: string | null;
  englishTestScores?: {
    listening?: number;
    reading?: number;
    writing?: number;
    speaking?: number;
  };
  
  // Submission Information
  submissionDate?: string | null;
  universityReferenceNumber?: string | null;
  submissionMethod?: "university_portal" | "email" | "consultancy_portal" | "courier" | "agent_submission" | "online_system";
  portalId?: string | null;
  
  // Notes & Additional
  notes?: string | null;
  internalNotes?: string | null;
  metadata?: any;
  
  // Multi-tenancy
  organizationId?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  
  // Relations
  student?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    country?: string;
    nationality?: string;
    dateOfBirth?: string;
  };
  university?: {
    id: string;
    name: string;
    country?: string;
    city?: string;
    logoUrl?: string;
  };
  campus?: {
    id: string;
    name: string;
    city?: string;
    campusType?: string;
  };
  course?: {
    id: string;
    name: string;
    code?: string;
    level?: string;
    mode?: string;
    duration?: string;
  };
  intake?: {
    id: string;
    label?: string;
    month?: string;
    year?: number;
    status?: string;
    courseStartDate?: string;
  };
  assignedStaff?: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
    employeeCode?: string;
  };
  applicationOfficer?: {
    id: string;
    fullName: string;
    email: string;
  };
  visaOfficer?: {
    id: string;
    fullName: string;
    email: string;
  };
  submittedBy?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export async function getAllApplications(params?: {
  status?: string;
  studentId?: string;
  universityId?: string;
  courseId?: string;
  assignedStaffId?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<Application[]>> {
  const q = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        q.append(key, String(value));
      }
    });
  }
  const res = await fetch(`${API_BASE}/api/applications?${q}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getApplicationDashboard(): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/applications/dashboard`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getApplicationById(id: string): Promise<ApiResponse<Application>> {
  const res = await fetch(`${API_BASE}/api/applications/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  // Backend wraps the application in a nested object
  if (json.success && json.data?.application) {
    return { ...json, data: json.data.application };
  }
  return json;
}

export async function createApplication(data: Partial<Application>): Promise<ApiResponse<Application>> {
  const res = await fetch(`${API_BASE}/api/applications`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateApplication(id: string, data: Partial<Application>): Promise<ApiResponse<Application>> {
  const res = await fetch(`${API_BASE}/api/applications/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteApplication(id: string): Promise<ApiResponse<void>> {
  const res = await fetch(`${API_BASE}/api/applications/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function updateApplicationStatus(id: string, status: string, notes?: string): Promise<ApiResponse<Application>> {
  const res = await fetch(`${API_BASE}/api/applications/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes }),
  });
  return res.json();
}

export async function submitApplication(id: string, data: {
  submissionMethod?: string;
  universityReferenceNumber?: string;
  portalId?: string;
  notes?: string;
}): Promise<ApiResponse<Application>> {
  const res = await fetch(`${API_BASE}/api/applications/${id}/submit`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function withdrawApplication(id: string, reason: string): Promise<ApiResponse<Application>> {
  const res = await fetch(`${API_BASE}/api/applications/${id}/withdraw`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });
  return res.json();
}

// Application Documents - See APPLICATION DOCUMENTS section below for full API

// Application Offers
export async function getApplicationOffers(applicationId: string): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_BASE}/api/applications/${applicationId}/offers`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getAllApplicationOffers(params?: {
  applicationId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<any[]>> {
  const q = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") q.append(key, String(value));
    });
  }
  const res = await fetch(`${API_BASE}/api/applications/offers/all?${q}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function createApplicationOffer(data: any): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/applications/offers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function acceptApplicationOffer(offerId: string, data?: any): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/applications/offers/${offerId}/accept`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data || {}),
  });
  return res.json();
}

export async function declineApplicationOffer(offerId: string, data?: any): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/applications/offers/${offerId}/decline`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data || {}),
  });
  return res.json();
}

// Application Notes
export async function getApplicationNotes(applicationId: string): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_BASE}/api/applications/${applicationId}/notes`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function addApplicationNote(applicationId: string, data: { note: string; isInternal?: boolean }): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}/api/applications/${applicationId}/notes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// Application Activity Log
export async function getApplicationActivity(applicationId: string): Promise<ApiResponse<any[]>> {
  const res = await fetch(`${API_BASE}/api/applications/${applicationId}/activity`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

// ==========================================
// HELPER FUNCTIONS FOR API REQUESTS
// ==========================================

function buildQuery(params?: Record<string, any>): string {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      q.append(key, String(value));
    }
  });
  const queryString = q.toString();
  return queryString ? `?${queryString}` : "";
}

async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<any>> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
  return res.json();
}

// ==========================================
// APPLICATION DOCUMENTS
// ==========================================
export interface ApplicationDocument {
  id: string;
  applicationId: string;
  documentType: string;
  documentName: string;
  description?: string | null;
  isRequired: boolean;
  isUploaded: boolean;
  isVerified: boolean;
  fileName?: string | null;
  fileUrl?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  status: string;
  uploadedById?: string | null;
  uploadedAt?: string | null;
  verifiedById?: string | null;
  verifiedAt?: string | null;
  notes?: string | null;
  rejectionReason?: string | null;
  verificationNotes?: string | null;
  expiryDate?: string | null;
  issueDate?: string | null;
  version?: number;
  previousVersionId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  // Relations
  application?: {
    id: string;
    applicationNumber: string;
    studentId?: string;
    status?: string;
  };
  uploadedBy?: { id: string; fullName: string; email: string };
  verifiedBy?: { id: string; fullName: string; email: string };
}

export async function getAllApplicationDocuments(params?: Record<string, any>) {
  return apiRequest(`/api/applications/documents/all${buildQuery(params)}`);
}

export async function getApplicationDocumentById(id: string) {
  return apiRequest(`/api/applications/documents/${id}`);
}

export async function createApplicationDocument(data: Partial<ApplicationDocument>) {
  return apiRequest(`/api/applications/documents`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateApplicationDocument(id: string, data: Partial<ApplicationDocument>) {
  return apiRequest(`/api/applications/documents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function verifyApplicationDocument(
  id: string,
  data: { verified: boolean; verificationNotes?: string; rejectionReason?: string }
) {
  return apiRequest(`/api/applications/documents/${id}/verify`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteApplicationDocument(id: string) {
  return apiRequest(`/api/applications/documents/${id}`, { method: "DELETE" });
}

export async function getApplicationDocumentStats(applicationId: string) {
  return apiRequest(`/api/applications/documents/stats/${applicationId}`);
}

export async function bulkUploadApplicationDocuments(documents: Partial<ApplicationDocument>[]): Promise<ApiResponse<any>> {
  return apiRequest(`/api/applications/documents/bulk-upload`, {
    method: "POST",
    body: JSON.stringify({ documents }),
  });
}