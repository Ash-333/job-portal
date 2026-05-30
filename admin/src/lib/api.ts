import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface ApiInstance extends AxiosInstance {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T = any>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
}) as ApiInstance

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor — extract .data and handle auth errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    const message = error.response?.data?.message || error.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/admin/login', credentials),

  register: (data: { email: string; password: string; name: string; secretKey: string }) =>
    api.post('/auth/admin/register', data),

  getProfile: () =>
    api.get('/auth/admin/profile'),
}

// Dashboard API
export const dashboardAPI = {
  getStats: () =>
    api.get('/admin/dashboard/stats'),

  getRecentActivity: () =>
    api.get('/admin/dashboard/recent-activity'),
}

// Jobs API
export const jobsAPI = {
  getJobs: (params?: any) =>
    api.get('/admin/jobs', { params }),

  getJob: (id: string) =>
    api.get(`/admin/jobs/${id}`),

  createJob: (data: any) =>
    api.post('/admin/jobs', data),

  updateJob: (id: string, data: any) =>
    api.put(`/admin/jobs/${id}`, data),

  deleteJob: (id: string) =>
    api.delete(`/admin/jobs/${id}`),

  approveJob: (id: string) =>
    api.put(`/admin/jobs/${id}/approve`),

  rejectJob: (id: string, rejectionReason: string) =>
    api.put(`/admin/jobs/${id}/reject`, { rejectionReason }),

  toggleJobStatus: (id: string) =>
    api.patch(`/admin/jobs/${id}/toggle-status`),

  getCategories: () =>
    api.get<{ categories: string[]; total: number }>('/jobs/categories'),
}

// Users API
export const usersAPI = {
  getUsers: (params?: any) =>
    api.get('/admin/users', { params }),

  getUser: (id: string) =>
    api.get(`/admin/users/${id}`),

  updateUser: (id: string, data: any) =>
    api.put(`/admin/users/${id}`, data),

  deleteUser: (id: string) =>
    api.delete(`/admin/users/${id}`),

  suspendUser: (id: string) =>
    api.put(`/admin/users/${id}/suspend`),

  unsuspendUser: (id: string) =>
    api.put(`/admin/users/${id}/unsuspend`),
}

// Applications API
export const applicationsAPI = {
  getApplications: (params?: any) =>
    api.get('/admin/applications', { params }),

  getApplication: (id: string) =>
    api.get(`/admin/applications/${id}`),

  updateApplicationStatus: (id: string, status: string) =>
    api.put(`/admin/applications/${id}/status`, { status }),

  deleteApplication: (id: string) =>
    api.delete(`/admin/applications/${id}`),
}

// Blogs API
export const blogsAPI = {
  getBlogs: (params?: any) =>
    api.get('/admin/blogs', { params }),

  getBlog: (id: string) =>
    api.get(`/admin/blogs/${id}`),

  createBlog: (data: any) =>
    api.post('/admin/blogs', data),

  updateBlog: (id: string, data: any) =>
    api.put(`/admin/blogs/${id}`, data),

  deleteBlog: (id: string) =>
    api.delete(`/admin/blogs/${id}`),

  toggleBlogStatus: (id: string) =>
    api.patch(`/admin/blogs/${id}/toggle-status`),
}

// Analytics API
export const analyticsAPI = {
  getJobStats: (period?: string) =>
    api.get('/admin/analytics/jobs', { params: { period } }),

  getUserStats: (period?: string) =>
    api.get('/admin/analytics/users', { params: { period } }),

  getApplicationStats: (period?: string) =>
    api.get('/admin/analytics/applications', { params: { period } }),
}

// Upload API
export const uploadAPI = {
  uploadBlogImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/blog-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  uploadCompanyLogo: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/company-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// Audit Logs API
export const auditLogsAPI = {
  getLogs: (params?: any) =>
    api.get('/admin/audit-logs', { params }),

  cleanupLogs: (retentionDays: number = 15) =>
    api.delete('/admin/audit-logs/cleanup', { data: { retentionDays } }),
}

// Subscription Plans API
export const plansAPI = {
  getAll: (params?: any) =>
    api.get('/admin/subscription-plans', { params }),

  getById: (id: string) =>
    api.get(`/admin/subscription-plans/${id}`),

  create: (data: any) =>
    api.post('/admin/subscription-plans', data),

  update: (id: string, data: any) =>
    api.put(`/admin/subscription-plans/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/subscription-plans/${id}`),
}

// Subscriptions API
export const subscriptionsAPI = {
  getAll: (params?: any) =>
    api.get('/admin/subscriptions', { params }),

  activate: (id: string) =>
    api.put(`/admin/subscriptions/${id}/activate`),

  cancel: (id: string) =>
    api.put(`/admin/subscriptions/${id}/cancel`),
}

// Sponsored Companies API
export const sponsoredAPI = {
  getAll: (params?: any) =>
    api.get('/admin/sponsored-companies', { params }),

  create: (data: any) =>
    api.post('/admin/sponsored-companies', data),

  update: (id: string, data: any) =>
    api.put(`/admin/sponsored-companies/${id}`, data),

  delete: (id: string) =>
    api.delete(`/admin/sponsored-companies/${id}`),
}

export default api
