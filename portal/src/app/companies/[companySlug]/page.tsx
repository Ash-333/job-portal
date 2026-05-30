'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, CompanyProfile, Job } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, MapPin, Globe, Users, Briefcase, Building2, ArrowLeft, ExternalLink } from 'lucide-react'

export default function CompanyPage() {
  const params = useParams()
  const [company, setCompany] = useState<CompanyProfile | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const slug = params.companySlug as string
        const res = await api.getCompany(slug)
        setCompany(res.company)
        setJobs(res.jobs || [])
      } catch (err: any) {
        setError(err.message || 'Company not found')
      } finally {
        setLoading(false)
      }
    }
    fetchCompany()
  }, [params.companySlug])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Company not found</h1>
        <p className="text-muted-foreground mb-6">{error || 'This company does not exist or has no public profile.'}</p>
        <Button asChild>
          <Link href="/jobs">Browse Jobs</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <Button variant="ghost" asChild>
            <Link href="/jobs" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>

          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24 rounded-xl">
              <AvatarImage src={company.companyLogo} alt={company.companyName} />
              <AvatarFallback className="rounded-xl bg-muted text-2xl">
                {company.companyName?.charAt(0).toUpperCase() || 'C'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{company.companyName}</h1>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {company.industry && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {company.industry}
                  </span>
                )}
                {company.companySize && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {company.companySize} employees
                  </span>
                )}
                {company.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {company.location}
                  </span>
                )}
                {company.companyWebsite && (
                  <a
                    href={company.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {company.companyDescription && (
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{company.companyDescription}</p>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Open Positions ({jobs.length})
            </h2>
            {jobs.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No open positions at this time.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <Link key={job.id} href={`/jobs/${job.slug}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{job.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {job.location}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 ml-4">
                            <Badge variant="secondary">{job.jobType?.replace('_', ' ')}</Badge>
                            <Badge variant="outline">{job.workLocationType}</Badge>
                            <Badge variant="outline">{job.experienceLevel?.replace(/_/g, ' ')}</Badge>
                          </div>
                        </div>
                        {job.salaryMin && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {job.currency} {job.salaryMin.toLocaleString()}{job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : ''}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
