import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  authAPI,
  dashboardAPI,
  jobsAPI,
  usersAPI,
  applicationsAPI,
  blogsAPI,
  uploadAPI,
  auditLogsAPI,
  plansAPI,
  subscriptionsAPI,
  sponsoredAPI,
} from '../lib/api'
import toast from 'react-hot-toast'

// Query Keys
export const queryKeys = {
  dashboard: ['dashboard'] as const,
  dashboardStats: () => [...queryKeys.dashboard, 'stats'] as const,

  jobs: ['jobs'] as const,
  jobsList: (params: Record<string, any>) => [...queryKeys.jobs, 'list', params] as const,
  job: (id: string) => [...queryKeys.jobs, 'detail', id] as const,
  jobCategories: () => [...queryKeys.jobs, 'categories'] as const,
  jobApprovals: ['jobs', 'approvals'] as const,

  users: ['users'] as const,
  usersList: (params: Record<string, any>) => [...queryKeys.users, 'list', params] as const,
  user: (id: string) => [...queryKeys.users, 'detail', id] as const,

  applications: ['applications'] as const,
  applicationsList: (params: Record<string, any>) => [...queryKeys.applications, 'list', params] as const,

  blogs: ['blogs'] as const,
  blogsList: (params: Record<string, any>) => [...queryKeys.blogs, 'list', params] as const,
  blog: (id: string) => [...queryKeys.blogs, 'detail', id] as const,

  auditLogs: ['auditLogs'] as const,
  auditLogsList: (params: Record<string, any>) => [...queryKeys.auditLogs, 'list', params] as const,

  plans: ['plans'] as const,
  plansList: (params?: Record<string, any>) => [...queryKeys.plans, 'list', params] as const,
  plan: (id: string) => [...queryKeys.plans, 'detail', id] as const,

  subscriptions: ['subscriptions'] as const,
  subscriptionsList: (params?: Record<string, any>) => [...queryKeys.subscriptions, 'list', params] as const,

  sponsored: ['sponsored'] as const,
  sponsoredList: (params?: Record<string, any>) => [...queryKeys.sponsored, 'list', params] as const,
}

// Dashboard Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboardStats(),
    queryFn: dashboardAPI.getStats,
  })
}

// Jobs Hooks
export const useJobs = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.jobsList(params),
    queryFn: () => jobsAPI.getJobs(params),
  })
}

export const useJob = (id: string) => {
  return useQuery({
    queryKey: queryKeys.job(id),
    queryFn: () => jobsAPI.getJob(id),
    enabled: !!id,
  })
}

export const useCreateJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsAPI.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Job created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create job')
    },
  })
}

export const useUpdateJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => jobsAPI.updateJob(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.job(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Job updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update job')
    },
  })
}

export const useDeleteJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsAPI.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Job deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete job')
    },
  })
}

export const useJobCategories = () => {
  return useQuery({
    queryKey: queryKeys.jobCategories(),
    queryFn: jobsAPI.getCategories,
  })
}

// Approval Hooks
export const usePendingApprovals = () => {
  return useQuery({
    queryKey: queryKeys.jobApprovals,
    queryFn: () => jobsAPI.getJobs({ status: ['PENDING', 'RESUBMITTED'], limit: 100 }),
  })
}

export const useApproveJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: jobsAPI.approveJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobApprovals })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Job approved successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to approve job')
    },
  })
}

export const useRejectJob = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ jobId, rejectionReason }: { jobId: string; rejectionReason: string }) =>
      jobsAPI.rejectJob(jobId, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs })
      queryClient.invalidateQueries({ queryKey: queryKeys.jobApprovals })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Job rejected')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject job')
    },
  })
}

// Users Hooks
export const useUsers = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.usersList(params),
    queryFn: () => usersAPI.getUsers(params),
  })
}

export const useUser = (id: string) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => usersAPI.getUser(id),
    enabled: !!id,
  })
}

export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('User deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user')
    },
  })
}

// Applications Hooks
export const useApplications = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.applicationsList(params),
    queryFn: () => applicationsAPI.getApplications(params),
  })
}

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      applicationsAPI.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.applications })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Application status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update application status')
    },
  })
}

// Blogs Hooks
export const useBlogs = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.blogsList(params),
    queryFn: () => blogsAPI.getBlogs(params),
  })
}

export const useBlog = (id: string) => {
  return useQuery({
    queryKey: queryKeys.blog(id),
    queryFn: () => blogsAPI.getBlog(id),
    enabled: !!id,
  })
}

export const useCreateBlog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: blogsAPI.createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Blog created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create blog')
    },
  })
}

export const useUpdateBlog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blogsAPI.updateBlog(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs })
      queryClient.invalidateQueries({ queryKey: queryKeys.blog(id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Blog updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update blog')
    },
  })
}

export const useDeleteBlog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: blogsAPI.deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.blogs })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats() })
      toast.success('Blog deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete blog')
    },
  })
}

// Auth Hooks
export const useRegister = () => {
  return useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      toast.success('Registration successful')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed')
    },
  })
}

export const useLogin = () => {
  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: () => {
      toast.success('Login successful')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed')
    },
  })
}

// Upload Hooks
export const useUploadBlogImage = () => {
  return useMutation({
    mutationFn: (file: File) => uploadAPI.uploadBlogImage(file),
    onSuccess: () => {
      toast.success('Image uploaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload image')
    },
  })
}

export const useUploadCompanyLogo = () => {
  return useMutation({
    mutationFn: (file: File) => uploadAPI.uploadCompanyLogo(file),
    onSuccess: () => {
      toast.success('Logo uploaded successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload logo')
    },
  })
}

export const useSuspendUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersAPI.suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('User suspended')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to suspend user')
    },
  })
}

export const useUnsuspendUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersAPI.unsuspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
      toast.success('User unsuspended')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to unsuspend user')
    },
  })
}

// Audit Logs Hooks
export const useAuditLogs = (params: Record<string, any> = {}) => {
  return useQuery({
    queryKey: queryKeys.auditLogsList(params),
    queryFn: () => auditLogsAPI.getLogs(params),
  })
}

export const useCleanupAuditLogs = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (retentionDays: number = 15) => auditLogsAPI.cleanupLogs(retentionDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auditLogs })
      toast.success('Audit logs cleaned up')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to clean up logs')
    },
  })
}

// Plans Hooks
export const usePlans = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.plansList(params),
    queryFn: () => plansAPI.getAll(params),
  })
}

export const usePlan = (id: string) => {
  return useQuery({
    queryKey: queryKeys.plan(id),
    queryFn: () => plansAPI.getById(id),
    enabled: !!id,
  })
}

export const useCreatePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: plansAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans })
      toast.success('Plan created')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create plan')
    },
  })
}

export const useUpdatePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => plansAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans })
      toast.success('Plan updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update plan')
    },
  })
}

export const useDeletePlan = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: plansAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.plans })
      toast.success('Plan deleted')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete plan')
    },
  })
}

// Subscriptions Hooks
export const useSubscriptions = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.subscriptionsList(params),
    queryFn: () => subscriptionsAPI.getAll(params),
  })
}

export const useActivateSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionsAPI.activate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions })
      toast.success('Subscription activated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to activate subscription')
    },
  })
}

export const useCancelSubscription = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionsAPI.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions })
      toast.success('Subscription cancelled')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel subscription')
    },
  })
}

// Sponsored Companies Hooks
export const useSponsoredCompanies = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: queryKeys.sponsoredList(params),
    queryFn: () => sponsoredAPI.getAll(params),
  })
}

export const useCreateSponsoredCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sponsoredAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sponsored })
      toast.success('Sponsored company created')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create sponsored company')
    },
  })
}

export const useUpdateSponsoredCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => sponsoredAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sponsored })
      toast.success('Sponsored company updated')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update sponsored company')
    },
  })
}

export const useDeleteSponsoredCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sponsoredAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sponsored })
      toast.success('Sponsored company removed')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove sponsored company')
    },
  })
}
