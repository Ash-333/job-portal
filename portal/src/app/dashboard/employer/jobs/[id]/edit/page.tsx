'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ArrowLeft, Loader2, DollarSign, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP'] as const
const WORK_TYPES = ['ONSITE', 'REMOTE', 'HYBRID'] as const
const EXP_LEVELS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'FRESHER', label: 'Fresher' },
  { value: 'INTERNSHIP_ONLY', label: 'Internship Only' },
  { value: 'ZERO_TO_ONE_YEAR', label: '0-1 Year' },
  { value: 'ONE_TO_THREE_YEARS', label: '1-3 Years' },
  { value: 'THREE_TO_FIVE_YEARS', label: '3-5 Years' },
  { value: 'FIVE_PLUS_YEARS', label: '5+ Years' },
] as const

export default function EditJobPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    jobType: 'FULL_TIME',
    workLocationType: 'ONSITE',
    experienceLevel: '',
    salaryMin: '',
    salaryMax: '',
    salaryNegotiable: false,
    currency: 'NPR',
    applicationDeadline: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        const [jobRes, catRes] = await Promise.all([
          api.getEmployerJob(params.id as string),
          api.getJobCategories(),
        ])
        const job = jobRes.job
        setForm({
          title: job.title || '',
          description: job.description || '',
          category: job.category || '',
          location: job.location || '',
          jobType: job.jobType || 'FULL_TIME',
          workLocationType: job.workLocationType || 'ONSITE',
          experienceLevel: job.experienceLevel || '',
          salaryMin: job.salaryMin?.toString() || '',
          salaryMax: job.salaryMax?.toString() || '',
          salaryNegotiable: job.salaryNegotiable || false,
          currency: job.currency || 'NPR',
          applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
        })
        setCategories(catRes.categories || [])
      } catch (error) {
        toast.error('Failed to load job')
        router.push('/dashboard/employer/jobs')
      } finally {
        setFetching(false)
      }
    }
    load()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.title || !form.description || !form.category || !form.location || !form.experienceLevel) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const data: any = {
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        jobType: form.jobType,
        workLocationType: form.workLocationType,
        experienceLevel: form.experienceLevel,
        currency: form.currency,
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        salaryNegotiable: form.salaryNegotiable,
        applicationDeadline: form.applicationDeadline || undefined,
      }

      await api.updateEmployerJob(params.id as string, data)
      toast.success('Job updated successfully')
      router.push(`/dashboard/employer/jobs/${params.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update job')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-lg">
          <Link href={`/dashboard/employer/jobs/${params.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit Job</h2>
          <p className="text-muted-foreground mt-1">{form.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description *</Label>
                  <RichTextEditor
                    value={form.description}
                    onChange={(v) => setForm({ ...form, description: v })}
                    placeholder="Describe the role, responsibilities, and ideal candidate..."
                    height="300px"
                    disabled={loading}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                      disabled={loading}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                      disabled={loading}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Job Type</Label>
                    <Select
                      value={form.jobType}
                      onValueChange={(v) => setForm({ ...form, jobType: v })}
                      disabled={loading}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {JOB_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Work Type</Label>
                    <Select
                      value={form.workLocationType}
                      onValueChange={(v) => setForm({ ...form, workLocationType: v })}
                      disabled={loading}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {WORK_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Experience Level *</Label>
                    <Select
                      value={form.experienceLevel}
                      onValueChange={(v) => setForm({ ...form, experienceLevel: v })}
                      disabled={loading}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXP_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Salary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={form.salaryMin}
                    onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={form.salaryMax}
                    onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.salaryNegotiable}
                    onChange={(e) => setForm({ ...form, salaryNegotiable: e.target.checked })}
                    disabled={loading}
                    className="h-4 w-4 rounded border-border text-primary accent-primary"
                  />
                  <span className="text-sm text-foreground">Negotiable</span>
                </label>
              </CardContent>
            </Card>

            <Card className="border border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Deadline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="applicationDeadline">Application Deadline</Label>
                  <Input
                    id="applicationDeadline"
                    type="date"
                    value={form.applicationDeadline}
                    onChange={(e) => setForm({ ...form, applicationDeadline: e.target.value })}
                    disabled={loading}
                    className="rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" asChild disabled={loading} className="flex-1 rounded-xl">
                <Link href={`/dashboard/employer/jobs/${params.id}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 rounded-xl">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
