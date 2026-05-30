'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { api, JobFilters } from '@/lib/api'
import { JobCardSkeleton } from '@/components/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { JobCard } from '@/components/jobs/job-card'
import { Search, X, Loader2, MapPin, Briefcase } from 'lucide-react'

function JobsContent() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<JobFilters>({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    location: searchParams.get('location') || '',
    workLocationType: searchParams.get('workLocationType') || '',
    jobType: searchParams.get('jobType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
    salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined,
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { data, isLoading, isFetchingNextPage, error, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['jobs', filters],
    queryFn: ({ pageParam }) => api.getJobs(filters, pageParam, 12),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
  })

  const jobs = data?.pages.flatMap(p => p.jobs) ?? []
  const totalJobs = data?.pages[0]?.pagination.total ?? 0

  const { ref: sentinelRef } = useInView({
    threshold: 0,
    onChange: useCallback((inView: boolean) => {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['job-categories'],
    queryFn: () => api.getJobCategories(),
  })

  const categories = categoriesData?.categories || []

  const filterOptions = {
    jobTypes: [
      { value: 'FULL_TIME', label: 'Full Time' },
      { value: 'PART_TIME', label: 'Part Time' },
      { value: 'CONTRACT', label: 'Contract' },
      { value: 'INTERNSHIP', label: 'Internship' },
    ],
    workTypes: [
      { value: 'ONSITE', label: 'On-site' },
      { value: 'REMOTE', label: 'Remote' },
      { value: 'HYBRID', label: 'Hybrid' },
    ],
    experienceLevels: [
      { value: 'STUDENT', label: 'Student' },
      { value: 'FRESHER', label: 'Fresher' },
      { value: 'INTERNSHIP_ONLY', label: 'Internship' },
      { value: 'ZERO_TO_ONE_YEAR', label: '0–1 Year' },
      { value: 'ONE_TO_THREE_YEARS', label: '1–3 Years' },
      { value: 'THREE_TO_FIVE_YEARS', label: '3–5 Years' },
      { value: 'FIVE_PLUS_YEARS', label: '5+ Years' },
    ],
  }

  const handleFilterChange = (key: keyof JobFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value === '' || value === 'all' ? undefined : value }))
  }

  const clearFilters = () => {
    setFilters({})
  }

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '')

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Location</h4>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="City or country..."
            value={filters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="pl-10 h-10 text-sm rounded-xl"
          />
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Category</h4>
        <Select value={filters.category || 'all'} onValueChange={(v) => handleFilterChange('category', v)}>
          <SelectTrigger className="h-10 text-sm rounded-xl">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Job Type</h4>
        <div className="space-y-2">
          {filterOptions.jobTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="jobType"
                checked={filters.jobType === type.value}
                onChange={() => handleFilterChange('jobType', filters.jobType === type.value ? '' : type.value)}
                className="h-4 w-4 rounded-full border-2 border-border text-primary accent-primary"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Work Style</h4>
        <div className="space-y-2">
          {filterOptions.workTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="workType"
                checked={filters.workLocationType === type.value}
                onChange={() => handleFilterChange('workLocationType', filters.workLocationType === type.value ? '' : type.value)}
                className="h-4 w-4 rounded-full border-2 border-border text-primary accent-primary"
              />
              <span className="text-sm text-foreground group-hover:text-primary transition-colors">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Experience</h4>
        <Select value={filters.experienceLevel || 'all'} onValueChange={(v) => handleFilterChange('experienceLevel', v)}>
          <SelectTrigger className="h-10 text-sm rounded-xl">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {filterOptions.experienceLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Salary Range</h4>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.salaryMin || ''}
            onChange={(e) => handleFilterChange('salaryMin', e.target.value ? parseInt(e.target.value) : undefined)}
            className="h-10 text-sm rounded-xl w-1/2"
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.salaryMax || ''}
            onChange={(e) => handleFilterChange('salaryMax', e.target.value ? parseInt(e.target.value) : undefined)}
            className="h-10 text-sm rounded-xl w-1/2"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters} className="w-full rounded-xl">
          <X className="h-4 w-4 mr-2" /> Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-muted/50 to-background border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="max-w-4xl">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-3">
              Find Your <span className="gradient-primary bg-clip-text text-transparent">Next Role</span>
            </h1>
              <p className="text-muted-foreground text-lg">
                  {totalJobs ? `${totalJobs} opportunities waiting for you` : 'Browse thousands of opportunities'}
                </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Mobile Filter Toggle */}
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs, companies..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-11 h-12 text-sm rounded-xl border-2 border-border focus-visible:ring-primary/30"
            />
          </div>
          <Button
            variant="outline"
            className="lg:hidden h-12 px-4 rounded-xl"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Filters{hasActiveFilters ? ` (${Object.values(filters).filter(v => v !== undefined && v !== '').length})` : ''}
          </Button>
        </div>

        {/* Mobile Filters */}
        {mobileFiltersOpen && (
          <Card className="mb-8 lg:hidden">
            <CardContent className="p-6">
              <FilterContent />
            </CardContent>
          </Card>
        )}

        <div className="flex gap-10">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <Card className="sticky top-24 border border-border/60">
              <CardContent className="p-6">
                <FilterContent />
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                  <X className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-6">Failed to load jobs. Please try again.</p>
                <Button onClick={() => window.location.reload()} className="rounded-xl">
                  Try Again
                </Button>
              </div>
            ) : !jobs.length ? (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
                <Button variant="outline" onClick={clearFilters} className="rounded-xl">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{totalJobs}</span> jobs found
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>

                {/* Infinite scroll sentinel */}
                {hasNextPage && (
                  <div ref={sentinelRef} className="mt-12 flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-sm text-muted-foreground">Loading more jobs...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">Loading jobs...</span>
      </div>
    }>
      <JobsContent />
    </Suspense>
  )
}
