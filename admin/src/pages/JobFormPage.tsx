import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import RichTextEditor from '../components/RichTextEditor'
import ImageUpload from '../components/ImageUpload'
import { useCreateJob, useUpdateJob, useJob, useUploadCompanyLogo, useJobCategories } from '../hooks/useApi'
import toast from 'react-hot-toast'

export default function JobFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    category: '',
    location: '',
    jobType: 'FULL_TIME',
    workLocationType: 'ONSITE',
    experienceLevel: 'ONE_TO_THREE_YEARS',
    salaryMin: '',
    salaryMax: '',
    salaryNegotiable: false,
    currency: 'NPR',
    companyName: '',
    companyWebsite: '',
    companyLogo: '',
    applicationDeadline: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isActive: true,
    isFeatured: false,
  })

  const { data: jobData, isLoading: loadingJob } = useJob(id || '')
  const { data: categoriesData } = useJobCategories()
  const createJobMutation = useCreateJob()
  const updateJobMutation = useUpdateJob()
  const uploadLogoMutation = useUploadCompanyLogo()

  const categories = categoriesData?.categories || []

  useEffect(() => {
    if (isEditing && jobData?.job) {
      const job = jobData.job
      setFormData({
        title: job.title || '',
        description: job.description || '',
        requirements: '',
        responsibilities: '',
        category: job.category || '',
        location: job.location || '',
        jobType: job.jobType || 'FULL_TIME',
        workLocationType: job.workLocationType || 'ONSITE',
        experienceLevel: job.experienceLevel || 'FRESHER',
        salaryMin: job.salaryMin?.toString() || '',
        salaryMax: job.salaryMax?.toString() || '',
        salaryNegotiable: job.salaryNegotiable || false,
        currency: job.currency || 'NPR',
        companyName: job.companyName || '',
        companyWebsite: job.companyWebsite || '',
        companyLogo: job.companyLogo || '',
        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : '',
        metaTitle: job.metaTitle || '',
        metaDescription: job.metaDescription || '',
        metaKeywords: job.metaKeywords?.join(', ') || '',
        isActive: job.isActive ?? true,
        isFeatured: job.isFeatured ?? false,
      })
    }
  }, [isEditing, jobData])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDescriptionChange = (content: string) => {
    setFormData(prev => ({ ...prev, description: content }))
  }

  const handleLogoUpload = async (file: File) => {
    const result = await uploadLogoMutation.mutateAsync(file)
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.companyName || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    const submitData = {
      ...formData,
      requirements: [],
      responsibilities: [],
      salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
      salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
      applicationDeadline: formData.applicationDeadline || undefined,
      metaKeywords: formData.metaKeywords.split(',').map(k => k.trim()).filter(k => k),
    }

    if (isEditing) {
      updateJobMutation.mutate({ id: id!, data: submitData }, {
        onSuccess: () => {
          navigate('/jobs')
        }
      })
    } else {
      createJobMutation.mutate(submitData, {
        onSuccess: () => {
          navigate('/jobs')
        }
      })
    }
  }



  if (loadingJob && isEditing) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link to="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Job' : 'Create New Job'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update job posting details' : 'Fill in the details to create a new job posting'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isEditing && (
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      placeholder="Company name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Website
                    </label>
                    <Input
                      type="url"
                      value={formData.companyWebsite}
                      onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                      placeholder="https://company.com"
                    />
                  </div>
                </div>

                {/* Company Logo */}
                <ImageUpload
                  value={formData.companyLogo}
                  onChange={(url) => setFormData(prev => ({ ...prev, companyLogo: url }))}
                  onUpload={handleLogoUpload}
                  isUploading={uploadLogoMutation.isPending}
                  label="Company Logo (Optional)"
                  placeholder="Enter logo URL or upload a file"
                  maxSize={2}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <Input
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g. Kathmandu, Nepal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Describe the job role, company culture, and what makes this opportunity exciting..."
                    height="300px"
                  />
                </div>


              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    value={formData.jobType}
                    onChange={(e) => handleInputChange('jobType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Work Location Type
                  </label>
                  <select
                    value={formData.workLocationType}
                    onChange={(e) => handleInputChange('workLocationType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ONSITE">Onsite</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="STUDENT">Student / Currently Studying</option>
                    <option value="FRESHER">Fresher</option>
                    <option value="INTERNSHIP_ONLY">Internship Experience Only</option>
                    <option value="ZERO_TO_ONE_YEAR">0–1 Year</option>
                    <option value="ONE_TO_THREE_YEARS">1–3 Years</option>
                    <option value="THREE_TO_FIVE_YEARS">3–5 Years</option>
                    <option value="FIVE_PLUS_YEARS">5+ Years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Deadline
                  </label>
                  <Input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Salary */}
            <Card>
              <CardHeader>
                <CardTitle>Salary Information (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NPR">NPR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                {/* Negotiable Option */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="salaryNegotiable"
                    checked={formData.salaryNegotiable}
                    onChange={(e) => handleInputChange('salaryNegotiable', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="salaryNegotiable" className="text-sm font-medium text-gray-700">
                    Salary is negotiable
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Min Salary
                    </label>
                    <Input
                      type="number"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange('salaryMin', e.target.value)}
                      placeholder="50000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Salary
                    </label>
                    <Input
                      type="number"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange('salaryMax', e.target.value)}
                      placeholder="100000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (visible to job seekers)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                    Featured (highlight on homepage)
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={createJobMutation.isPending || updateJobMutation.isPending}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {createJobMutation.isPending || updateJobMutation.isPending
                      ? 'Saving...'
                      : (isEditing ? 'Update Job' : 'Create Job')
                    }
                  </Button>
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <Link to="/jobs">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
