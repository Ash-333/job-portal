import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Building2,
  Briefcase,
  Calendar,
  UserCheck,
  UserX,
  Shield,
  BookOpen,
  Award,
  ExternalLink,
} from 'lucide-react'
import { useUser, useDeleteUser } from '../hooks/useApi'
import { formatDate } from '../lib/utils'
import toast from 'react-hot-toast'

export default function UserViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useUser(id || '')
  const deleteUserMutation = useDeleteUser()

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

  if (error || !data?.user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>User not found or failed to load.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = data.user
  const recentApplications = data.recentApplications || []
  const isEmployer = user.role === 'EMPLOYER'

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    deleteUserMutation.mutate(user.id, {
      onSuccess: () => navigate(isEmployer ? '/employers' : '/job-seekers'),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate(isEmployer ? '/employers' : '/job-seekers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {isEmployer ? 'Employers' : 'Job Seekers'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEmployer ? user.companyName || user.email : `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
            </h1>
            <p className="text-gray-600">{isEmployer ? 'Employer Account' : 'Job Seeker Account'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleDelete} className="text-red-600">
            Delete User
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {isEmployer ? (
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-medium text-white">
                      {user.companyName?.charAt(0) || user.email?.charAt(0) || 'E'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.companyName || 'N/A'}</h3>
                    {user.companySlug && (
                      <p className="text-sm text-gray-500">@{user.companySlug}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Industry:</span>
                    <span className="text-sm font-medium">{user.industry || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Company Size:</span>
                    <span className="text-sm font-medium">{user.companySize || 'Not specified'}</span>
                  </div>
                </div>

                {user.companyDescription && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">About</h4>
                    <p className="text-sm text-gray-600">{user.companyDescription}</p>
                  </div>
                )}

                {user.companyWebsite && (
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a href={user.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {user.companyWebsite}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-medium text-white">
                      {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : 'N/A'}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      {user.profileCompleted ? (
                        <span className="inline-flex items-center text-xs text-green-600"><UserCheck className="h-3 w-3 mr-1" /> Profile Complete</span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-red-600"><UserX className="h-3 w-3 mr-1" /> Profile Incomplete</span>
                      )}
                      {user.emailVerified ? (
                        <span className="inline-flex items-center text-xs text-green-600"><Shield className="h-3 w-3 mr-1" /> Email Verified</span>
                      ) : (
                        <span className="inline-flex items-center text-xs text-yellow-600"><Shield className="h-3 w-3 mr-1" /> Email Unverified</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{user.phone}</span>
                    </div>
                  )}
                  {user.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{user.location}</span>
                    </div>
                  )}
                  {user.experienceLevel && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{user.experienceLevel.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>

                {user.bio && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Bio</h4>
                    <p className="text-sm text-gray-600">{user.bio}</p>
                  </div>
                )}

                {user.skills && user.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {user.experience && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Experience</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{user.experience}</p>
                  </div>
                )}

                {user.education && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Education</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{user.education}</p>
                  </div>
                )}

                <div className="flex items-center space-x-4 pt-2">
                  {user.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {user.linkedin && (
                    <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {user.github && (
                    <a href={user.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900">
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isEmployer ? (
            <Card>
              <CardHeader>
                <CardTitle>Posted Jobs ({user._count?.postedJobs || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {recentApplications.length > 0 ? (
                  <div className="space-y-3">
                    {recentApplications.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{app.job?.title || 'Unknown Job'}</p>
                          <p className="text-xs text-gray-500">{app.job?.companyName}</p>
                        </div>
                        <Link to={`/jobs/${app.job?.id}`} className="text-blue-600 hover:text-blue-800">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications ({recentApplications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {recentApplications.length > 0 ? (
                  <div className="space-y-3">
                    {recentApplications.map((app: any) => (
                      <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">{app.job?.title || 'Unknown Job'}</p>
                          <p className="text-xs text-gray-500">{app.job?.companyName}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          app.status === 'HIRED' ? 'bg-green-100 text-green-800' :
                          app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No applications yet</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {!isEmployer && (user.resume || user.profilePicture) && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.resume && (
                    <a
                      href={user.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                    >
                      <BookOpen className="h-4 w-4" />
                      <span>View Resume</span>
                    </a>
                  )}
                  {user.profilePicture && (
                    <a
                      href={user.profilePicture}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:underline"
                    >
                      <Award className="h-4 w-4" />
                      <span>View Profile Picture</span>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {/* Account Info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Role</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href={`mailto:${user.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </a>
              </Button>
              {user.resume && (
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href={user.resume} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Resume
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
