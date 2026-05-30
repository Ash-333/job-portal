import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Clock, Star, ArrowRight } from 'lucide-react'
import { Job, formatSalary, getJobTypeLabel } from '@/lib/api'

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="group h-full border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Header: Logo + Title + Company */}
        <div className="flex items-start gap-4 mb-4">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt="" className="w-12 h-12 rounded-xl object-cover border border-border/50 shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2 text-[15px]">
                {job.title}
              </h3>
              {job.isFeatured && (
                <Star className="h-4 w-4 text-warning fill-warning shrink-0 mt-0.5" />
              )}
            </div>
            {job.companySlug ? (
              <Link href={`/companies/${job.companySlug}`} className="text-sm text-muted-foreground mt-0.5 truncate hover:text-primary transition-colors">
                {job.companyName}
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{job.companyName}</p>
            )}
          </div>
        </div>

        {/* Badge Row */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="secondary" className="rounded-lg text-xs font-medium px-2 py-0.5 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </Badge>
          <Badge variant="outline" className="rounded-lg text-xs font-medium px-2 py-0.5">
            {getJobTypeLabel(job.jobType)}
          </Badge>
          {job.workLocationType && (
            <Badge variant="outline" className="rounded-lg text-xs font-medium px-2 py-0.5">
              {job.workLocationType}
            </Badge>
          )}
        </div>

        {/* Description Preview */}
        {job.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">
            {job.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
          </p>
        )}

        {/* Bottom: Salary + Category + CTA */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            {job.salaryMin ? (
              <span className="text-sm font-semibold text-primary">{formatSalary(job.salaryMin, job.salaryMax, job.salaryNegotiable)}</span>
            ) : (
              <span className="text-xs text-muted-foreground">Salary not disclosed</span>
            )}
            <p className="text-xs text-muted-foreground">{job.category}</p>
          </div>
          <Button asChild size="sm" variant="ghost" className="rounded-lg shrink-0">
            <Link href={`/jobs/${job.slug}`}>
              View <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
