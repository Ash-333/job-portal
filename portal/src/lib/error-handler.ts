import { toast } from 'sonner'

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export class AppError extends Error {
  status: number
  code?: string

  constructor(message: string, status = 500, code?: string) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
  }
}

export const parseApiError = (error: any): ApiError => {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code,
    }
  }

  // If it's a standard Error with a message
  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500,
    }
  }

  // If it's an object with error details
  if (typeof error === 'object' && error !== null) {
    return {
      message: error.message || error.error || 'An unexpected error occurred',
      status: error.status || error.statusCode || 500,
      code: error.code,
    }
  }

  // If it's a string
  if (typeof error === 'string') {
    return {
      message: error,
      status: 500,
    }
  }

  // Fallback
  return {
    message: 'An unexpected error occurred',
    status: 500,
  }
}

export const handleApiError = (error: any, customMessage?: string): void => {
  const apiError = parseApiError(error)

  // Use custom message if provided, otherwise use the API error message
  const message = customMessage || apiError.message
  const status = apiError.status || 500

  // Show different toast types based on status
  if (status === 401) {
    toast.error('Authentication required. Please log in.')
  } else if (status === 403) {
    toast.error(message)
  } else if (status === 404) {
    toast.error('The requested resource was not found.')
  } else if (status === 422) {
    toast.error('Please check your input and try again.')
  } else if (status >= 500) {
    toast.error('Server error. Please try again later.')
  } else {
    toast.error(message)
  }

  // Log error for debugging
  console.error('API Error:', apiError)
}

export const getErrorMessage = (error: any): string => {
  const apiError = parseApiError(error)
  return apiError.message
}

export const isNetworkError = (error: any): boolean => {
  return (
    error instanceof TypeError ||
    error.message?.includes('fetch') ||
    error.message?.includes('network') ||
    error.message?.includes('Network error')
  )
}

export const isAuthError = (error: any): boolean => {
  const apiError = parseApiError(error)
  const status = apiError.status || 500
  return status === 401 || status === 403
}

export const isValidationError = (error: any): boolean => {
  const apiError = parseApiError(error)
  const status = apiError.status || 500
  return status === 422 || status === 400
}

// Email verification specific error handling
export const isEmailVerificationError = (error: any): boolean => {
  const apiError = parseApiError(error)
  const status = apiError.status || 500
  return (
    status === 403 &&
    (apiError.message?.includes('verify') || apiError.message?.includes('verification'))
  )
}

export const handleEmailVerificationError = (error: any, userEmail?: string): void => {
  if (isEmailVerificationError(error)) {
    const apiError = parseApiError(error)
    toast.error(apiError.message, {
      duration: 6000,
      action: userEmail ? {
        label: 'Resend Email',
        onClick: () => {
          // This will be handled by the component
          window.dispatchEvent(new CustomEvent('resend-verification', { detail: { email: userEmail } }))
        }
      } : undefined
    })
  } else {
    handleApiError(error)
  }
}
