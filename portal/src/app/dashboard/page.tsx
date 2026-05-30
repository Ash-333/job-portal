'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRequireAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { api, getExperienceLabel } from '@/lib/api'
import {
  Briefcase,
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowRight,
  Loader2,
  User,
  Search,
} from 'lucide-react'

export default function DashboardHomePage() {
  const { user, loading } = useRequireAuth()

  const { data: applicationsData, isLoading: appsLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.getMyApplications(),
    enabled: !!user,
  })

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const applications = applicationsData?.applications || []
  const totalApps = applications.length
  const pendingApps = applications.filter((a: any) => a.status === 'PENDING').length
  const shortlistedApps = applications.filter((a: any) => a.status === 'SHORTLISTED').length
  const hiredApps = applications.filter((a: any) => a.status === 'HIRED').length

  const initials = user.firstName
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`
    : user.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {user.firstName || 'there'}!
        </h2>
        <p className="text-muted-foreground mt-1">
          Here&rsquo;s an overview of your job search activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Applications</p>
                <p className="text-2xl font-bold text-foreground mt-1">{totalApps}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Under Review</p>
                <p className="text-2xl font-bold text-foreground mt-1">{pendingApps}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Shortlisted</p>
                <p className="text-2xl font-bold text-foreground mt-1">{shortlistedApps}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hired</p>
                <p className="text-2xl font-bold text-foreground mt-1">{hiredApps}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Profile Summary */}
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Profile Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-foreground">{user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Your Name'}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                {user.experienceLevel && (
                  <Badge variant="secondary" className="mt-1 text-xs rounded-lg">
                    {getExperienceLabel(user.experienceLevel)}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profile Completion</span>
                <span className="font-medium text-foreground">
                  {user.profileCompleted ? '100%' : 'Incomplete'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${user.profileCompleted ? 'bg-success w-full' : 'bg-primary w-1/2'}`}
                />
              </div>
            </div>

            {!user.profileCompleted && (
              <Button asChild size="sm" className="w-full rounded-xl">
                <Link href="/dashboard/profile">
                  Complete Profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" asChild className="w-full justify-between rounded-xl h-12">
              <Link href="/jobs">
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Browse Jobs
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-between rounded-xl h-12">
              <Link href="/dashboard/applications">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View Applications
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-between rounded-xl h-12">
              <Link href="/dashboard/profile">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Edit Profile
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {applications.length > 0 && (
        <Card className="border border-border/60">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Recent Applications</CardTitle>
            <Button variant="ghost" size="sm" asChild className="rounded-lg text-xs">
              <Link href="/dashboard/applications">View All <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {applications.slice(0, 5).map((app: any) => (
                <div key={app.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{app.job.title}</p>
                    <p className="text-xs text-muted-foreground">{app.job.companyName}</p>
                  </div>
                  <Badge
                    className={`text-xs rounded-lg px-2 py-0.5 shrink-0 ml-4 ${
                      app.status === 'PENDING' ? 'bg-warning/10 text-warning' :
                      app.status === 'REVIEWED' ? 'bg-primary/10 text-primary' :
                      app.status === 'SHORTLISTED' ? 'bg-success/10 text-success' :
                      app.status === 'HIRED' ? 'bg-accent/10 text-accent' :
                      app.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    } border-0`}
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
