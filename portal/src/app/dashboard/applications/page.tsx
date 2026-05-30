'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useRequireAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  Calendar,
  Building2,
  MapPin,
  Clock,
  FileText,
  ExternalLink,
  Loader2,
  Briefcase,
  History,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react'
import { api, JobApplication, StatusHistoryEntry } from '@/lib/api'

function getStatusColor(status: string) {
  switch (status) {
    case 'PENDING': return 'bg-warning/10 text-warning border-warning/20'
    case 'REVIEWED': return 'bg-primary/10 text-primary border-primary/20'
    case 'SHORTLISTED': return 'bg-success/10 text-success border-success/20'
    case 'ACCEPTED': return 'bg-success/10 text-success border-success/20'
    case 'REJECTED': return 'bg-destructive/10 text-destructive border-destructive/20'
    case 'HIRED': return 'bg-accent/10 text-accent border-accent/20'
    default: return 'bg-muted text-muted-foreground border-border'
  }
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: 'Under Review',
    REVIEWED: 'Reviewed',
    SHORTLISTED: 'Shortlisted',
    ACCEPTED: 'Accepted',
    REJECTED: 'Not Selected',
    HIRED: 'Hired',
  }
  return labels[status] || status
}

export default function ApplicationsPage() {
  const { user, loading } = useRequireAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)
  const [historyData, setHistoryData] = useState<Record<string, StatusHistoryEntry[]>>({})
  const [loadingHistory, setLoadingHistory] = useState<string | null>(null)

  const { data: applicationsData, isLoading, error } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.getMyApplications(),
    enabled: !!user,
  })

  const applications = applicationsData?.applications || []

  const filteredApplications = applications.filter((app: JobApplication) => {
    const matchesSearch = !searchQuery ||
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || statusFilter === 'all' || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: applications.length,
    pending: applications.filter((a: JobApplication) => a.status === 'PENDING').length,
    shortlisted: applications.filter((a: JobApplication) => a.status === 'SHORTLISTED').length,
    hired: applications.filter((a: JobApplication) => a.status === 'HIRED').length,
  }

  const toggleHistory = async (applicationId: string) => {
    if (expandedHistory === applicationId) {
      setExpandedHistory(null)
      return
    }
    setExpandedHistory(applicationId)
    if (!historyData[applicationId]) {
      setLoadingHistory(applicationId)
      try {
        const res = await api.getApplicationHistory(applicationId)
        setHistoryData(prev => ({ ...prev, [applicationId]: res.history }))
      } catch {
        setHistoryData(prev => ({ ...prev, [applicationId]: [] }))
      } finally {
        setLoadingHistory(null)
      }
    }
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Applications</h2>
        <p className="text-muted-foreground mt-1">Track the status of your job applications.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'text-primary bg-primary/10' },
          { label: 'Under Review', value: stats.pending, icon: Clock, color: 'text-warning bg-warning/10' },
          { label: 'Shortlisted', value: stats.shortlisted, icon: Briefcase, color: 'text-success bg-success/10' },
          { label: 'Hired', value: stats.hired, icon: Badge as any, color: 'text-accent bg-accent/10' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="border border-border/60">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 text-sm rounded-xl"
          />
        </div>
        <div className="sm:w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-11 text-sm rounded-xl">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Under Review</SelectItem>
              <SelectItem value="REVIEWED">Reviewed</SelectItem>
              <SelectItem value="SHORTLISTED">Shortlisted</SelectItem>
              <SelectItem value="ACCEPTED">Accepted</SelectItem>
              <SelectItem value="REJECTED">Not Selected</SelectItem>
              <SelectItem value="HIRED">Hired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse border border-border/60">
              <CardContent className="p-6">
                <div className="h-5 bg-muted rounded w-2/3 mb-3" />
                <div className="h-4 bg-muted rounded w-1/3 mb-4" />
                <div className="h-4 bg-muted rounded w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border border-border/60">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">Failed to load applications.</p>
            <Button onClick={() => window.location.reload()} className="rounded-xl">Try Again</Button>
          </CardContent>
        </Card>
      ) : !filteredApplications.length ? (
        <Card className="border border-border/60">
          <CardContent className="p-12 text-center">
            {applications.length === 0 ? (
              <>
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6">Start exploring opportunities and apply!</p>
                <Button asChild className="rounded-xl">
                  <Link href="/jobs">Browse Jobs</Link>
                </Button>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Matches</h3>
                <p className="text-muted-foreground mb-6">Try different search terms or filters.</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all') }} className="rounded-xl">
                  Clear Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application: JobApplication) => (
            <Card key={application.id} className="border border-border/60 hover:border-border transition-colors">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{application.job.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{application.job.companyName}</span>
                          <span className="text-muted-foreground/40">|</span>
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{application.job.location}</span>
                        </div>
                      </div>
                      <Badge className={`shrink-0 rounded-lg text-xs px-2.5 py-1 border ${getStatusColor(application.status)}`}>
                        {getStatusLabel(application.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {(application.message || application.coverLetter) && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Cover letter included
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild className="rounded-lg h-9 text-xs">
                      <Link href={`/jobs/${application.job.slug}`}>
                        <ExternalLink className="h-3 w-3 mr-1.5" /> View Job
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-lg h-9 text-xs"
                      onClick={() => toggleHistory(application.id)}
                    >
                      <History className="h-3 w-3 mr-1.5" />
                      {expandedHistory === application.id ? 'Hide' : 'History'}
                    </Button>
                  </div>
                </div>

                {/* Status History */}
                {expandedHistory === application.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status Timeline</h4>
                    {loadingHistory === application.id ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (historyData[application.id]?.length || 0) === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">No history available.</p>
                    ) : (
                      <div className="space-y-0">
                        {historyData[application.id]?.map((entry, idx) => (
                          <div key={entry.id} className="flex gap-3 pb-3 relative">
                            {idx < (historyData[application.id]?.length || 1) - 1 && (
                              <div className="absolute left-[11px] top-5 bottom-0 w-0.5 bg-border" />
                            )}
                            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-primary bg-background flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs px-2 py-0 rounded-lg">
                                  {entry.oldStatus} → {entry.newStatus}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(entry.changedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Status-specific messages */}
                {application.status === 'SHORTLISTED' && (
                  <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-xl">
                    <p className="text-sm font-medium text-success flex items-center gap-2">
                      You&rsquo;ve been shortlisted! Keep an eye on your email for next steps.
                    </p>
                  </div>
                )}
                {application.status === 'HIRED' && (
                  <div className="mt-3 p-3 bg-accent/5 border border-accent/20 rounded-xl">
                    <p className="text-sm font-medium text-accent flex items-center gap-2">
                      Congratulations on your new role!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CTA */}
      {applications.length > 0 && (
        <Card className="border border-border/60">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-foreground mb-1">Keep Applying</h3>
            <p className="text-sm text-muted-foreground mb-4">Increase your chances by applying to more positions.</p>
            <div className="flex gap-3 justify-center">
              <Button asChild className="rounded-xl">
                <Link href="/jobs">Browse More Jobs <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" asChild className="rounded-xl">
                <Link href="/dashboard/profile">Update Profile</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
