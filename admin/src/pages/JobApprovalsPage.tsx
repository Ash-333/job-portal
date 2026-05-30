import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePendingApprovals, useApproveJob, useRejectJob } from '../hooks/useApi'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { CheckCircle, XCircle, Building2, MapPin, Clock, ExternalLink } from 'lucide-react'

export default function JobApprovalsPage() {
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const { data, isLoading } = usePendingApprovals()
  const approveJob = useApproveJob()
  const rejectJob = useRejectJob()

  const jobs = data?.data || []

  const handleRejectClick = (jobId: string) => {
    setRejectingId(jobId)
    setRejectionReason('')
    setShowRejectDialog(true)
  }

  const handleRejectConfirm = () => {
    if (!rejectingId || !rejectionReason.trim()) return
    rejectJob.mutate({ jobId: rejectingId, rejectionReason: rejectionReason.trim() }, {
      onSuccess: () => setShowRejectDialog(false)
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review and approve job postings from employers
          </p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
            <p className="text-sm text-gray-500 mt-1">No pending job approvals.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <Card key={job.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.companyName}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>

                    {job.postedBy && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <strong>Posted by:</strong> {job.postedBy.firstName} {job.postedBy.lastName}
                          {job.postedBy.companyName ? ` (${job.postedBy.companyName})` : ''}
                        </p>
                        <p className="text-sm text-gray-500">{job.postedBy.email}</p>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.jobType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {job.workLocationType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {job.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View job details"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <Button
                    onClick={() => approveJob.mutate(job.id)}
                    disabled={approveJob.isPending}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {approveJob.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={() => handleRejectClick(job.id)}
                    disabled={rejectJob.isPending}
                    variant="outline"
                    className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4" />
                    {rejectJob.isPending && rejectingId === job.id ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Reject Job</h2>
            <p className="text-sm text-gray-500 mb-4">Provide a reason for rejection. The employer will be notified.</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectConfirm}
                disabled={!rejectionReason.trim() || rejectJob.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {rejectJob.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
