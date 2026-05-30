import { useParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowLeft, Edit, MapPin, Building, Clock, DollarSign, Users, Calendar, Home, UserCheck } from 'lucide-react'
import { useJob, useApplications } from '../hooks/useApi'
import { formatDate } from '../lib/utils'
import { sanitizeHtml } from '../lib/sanitize'

export default function JobViewPage() {
  const { id } = useParams()
  const { data: jobData, isLoading, error } = useJob(id || '')
  const { data: applicationsData } = useApplications({ jobId: id, limit: 5 })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !jobData?.job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>Job not found or failed to load.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const job = jobData.job
  const applications = applicationsData?.data || []
  const totalApplications = applicationsData?.pagination?.total || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/jobs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600">{job.companyName}</p>
          </div>
        </div>
        <Link to={`/jobs/${job.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm font-medium">{job.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium">{job.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Type:</span>
                  <span className="text-sm font-medium">{job.jobType.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Work Location:</span>
                  <span className="text-sm font-medium">{job.workLocationType || 'Onsite'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Experience:</span>
                  <span className="text-sm font-medium">{job.experienceLevel.replace('_', ' ')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(job.description) }}
              />
            </CardContent>
          </Card>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {job.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-gray-700">{req}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {job.responsibilities.map((resp: string, index: number) => (
                    <li key={index} className="text-gray-700">{resp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.companyLogo && (
                <div className="flex justify-center">
                  <img
                    src={job.companyLogo}
                    alt={`${job.companyName} logo`}
                    className="h-16 w-16 object-contain"
                  />
                </div>
              )}
              <div>
                <h3 className="font-medium text-gray-900">{job.companyName}</h3>
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Salary Info */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
            </CardHeader>
            <CardContent>
              {job.salaryNegotiable ? (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">Negotiable</span>
                </div>
              ) : job.salaryMin || job.salaryMax ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Salary Range:</span>
                  </div>
                  <div className="text-lg font-medium">
                    {job.salaryMin && job.salaryMax
                      ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                      : job.salaryMin
                        ? `${job.currency} ${job.salaryMin.toLocaleString()}+`
                        : `Up to ${job.currency} ${job.salaryMax?.toLocaleString()}`
                    }
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Not specified</p>
              )}
            </CardContent>
          </Card>

          {/* Application Deadline */}
          {job.applicationDeadline && (
            <Card>
              <CardHeader>
                <CardTitle>Application Deadline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 font-medium">
                    {formatDate(job.applicationDeadline)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {job.isActive ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Featured:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  job.isFeatured
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.isFeatured ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    <p>Created: {formatDate(job.createdAt)}</p>
                    <p>Updated: {formatDate(job.updatedAt)}</p>
                    <p>Views: {job.viewCount || 0}</p>
                  </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Applications</CardTitle>
                <Link to={`/jobs/${job.id}/applicants`}>
                  <Button variant="outline" size="sm">
                    <UserCheck className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalApplications}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>

              {applications.length > 0 && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-700">Recent Applicants:</div>
                  {applications.slice(0, 3).map((application: any) => (
                    <div key={application.id} className="flex items-center space-x-2">
                      <div className="flex-shrink-0">
                        {application.user.profilePicture ? (
                          <img
                            src={application.user.profilePicture}
                            alt={`${application.user.firstName} ${application.user.lastName}`}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {application.user.firstName} {application.user.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(application.appliedAt)}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'SHORTLISTED' ? 'bg-green-100 text-green-800' :
                        application.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status}
                      </div>
                    </div>
                  ))}

                  {totalApplications > 3 && (
                    <div className="text-center pt-2">
                      <Link to={`/jobs/${job.id}/applicants`}>
                        <Button variant="ghost" size="sm" className="text-blue-600">
                          View {totalApplications - 3} more applicants
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {applications.length === 0 && (
                <div className="text-center text-gray-500 text-sm">
                  No applications yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
