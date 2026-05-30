import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
  card?: boolean
}

export function Loading({
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
  card = false
}: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    )
  }

  if (card) {
    return (
      <Card>
        <CardContent className="p-8">
          {content}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      {content}
    </div>
  )
}

// Skeleton components for better loading UX
export function JobCardSkeleton() {
  return (
    <Card className="glass border-0 h-full flex flex-col overflow-hidden">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="space-y-6 flex-1">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-6 bg-gradient-to-r from-muted to-muted/50 rounded-2xl animate-pulse" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-muted to-muted/50 rounded-xl animate-pulse" />
                <div className="h-4 bg-gradient-to-r from-muted to-muted/50 rounded-full w-2/3 animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-12 bg-gradient-to-r from-accent/20 to-accent/10 rounded-full animate-pulse" />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-3">
            <div className="h-7 w-20 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full animate-pulse" />
            <div className="h-7 w-16 bg-gradient-to-r from-accent/20 to-accent/10 rounded-full animate-pulse" />
          </div>

          {/* Salary */}
          <div className="h-10 bg-gradient-to-r from-success/20 to-accent/10 rounded-2xl animate-pulse" />

          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded animate-pulse" />
            <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-4/5 animate-pulse" />
            <div className="h-3 bg-gradient-to-r from-muted to-muted/50 rounded w-3/5 animate-pulse" />
          </div>

          {/* Badges */}
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-gradient-to-r from-muted to-muted/50 rounded-full animate-pulse" />
            <div className="h-6 w-16 bg-gradient-to-r from-muted to-muted/50 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Button */}
        <div className="mt-6">
          <div className="h-12 bg-gradient-to-r from-primary/30 to-primary/20 rounded-2xl animate-pulse" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ApplicationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            </div>
            <div className="h-6 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-16 bg-muted rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
