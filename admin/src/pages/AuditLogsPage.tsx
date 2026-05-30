import { useState } from 'react'
import { useAuditLogs } from '../hooks/useApi'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Clock, Loader2, Search, Trash2, AlertTriangle } from 'lucide-react'
import { Input } from '../components/ui/input'
import toast from 'react-hot-toast'
import { auditLogsAPI } from '../lib/api'

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  JOB_APPROVED: { label: 'Job Approved', color: 'bg-green-100 text-green-800' },
  JOB_REJECTED: { label: 'Job Rejected', color: 'bg-red-100 text-red-800' },
  JOB_DELETED: { label: 'Job Deleted', color: 'bg-red-100 text-red-800' },
  USER_DELETED: { label: 'User Deleted', color: 'bg-red-100 text-red-800' },
  BLOG_CREATED: { label: 'Blog Created', color: 'bg-blue-100 text-blue-800' },
  BLOG_UPDATED: { label: 'Blog Updated', color: 'bg-blue-100 text-blue-800' },
  BLOG_DELETED: { label: 'Blog Deleted', color: 'bg-red-100 text-red-800' },
  EMPLOYER_JOB_CREATED: { label: 'Job Created (Employer)', color: 'bg-indigo-100 text-indigo-800' },
  EMPLOYER_JOB_UPDATED: { label: 'Job Updated (Employer)', color: 'bg-indigo-100 text-indigo-800' },
  EMPLOYER_JOB_DELETED: { label: 'Job Deleted (Employer)', color: 'bg-red-100 text-red-800' },
  APPLICATION_STATUS_CHANGED: { label: 'Status Changed', color: 'bg-yellow-100 text-yellow-800' },
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAuditLogs({ limit: 100 })

  const logs = data?.logs || []

  const filtered = search
    ? logs.filter((log: any) =>
        JSON.stringify(log).toLowerCase().includes(search.toLowerCase())
      )
    : logs

  const [cleanupDays, setCleanupDays] = useState(15)
  const [showCleanup, setShowCleanup] = useState(false)
  const [cleaning, setCleaning] = useState(false)

  const handleCleanup = async () => {
    if (!confirm(`Delete audit logs older than ${cleanupDays} days? This cannot be undone.`)) return
    setCleaning(true)
    try {
      await auditLogsAPI.cleanupLogs(cleanupDays)
      toast.success(`Deleted audit logs older than ${cleanupDays} days`)
      setShowCleanup(false)
    } catch (err) {
      toast.error('Failed to clean up audit logs')
    } finally {
      setCleaning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-500 mt-1">Track all admin and employer actions</p>
        </div>
        <div className="flex items-center gap-2">
          {showCleanup ? (
            <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700">Retention:</span>
              <Input
                type="number"
                min={1}
                max={365}
                value={cleanupDays}
                onChange={(e) => setCleanupDays(Number(e.target.value))}
                className="w-20 h-8 text-sm"
              />
              <span className="text-xs text-yellow-600">days</span>
              <Button
                variant="destructive"
                size="sm"
                disabled={cleaning}
                onClick={handleCleanup}
              >
                {cleaning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                Delete Old
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCleanup(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCleanup(true)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Cleanup Old Logs
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No audit logs found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((log: any) => {
                const config = ACTION_LABELS[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-800' }
                return (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${config.color} border-0`}>{config.label}</Badge>
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {log.entity}
                            {log.entityId && <> · <span className="text-xs text-gray-500 font-mono">{log.entityId.slice(0, 12)}…</span></>}
                          </span>
                        </div>
                        {log.metadata && (
                          <pre className="text-xs text-gray-500 mt-1 bg-gray-50 rounded p-2 overflow-x-auto max-h-20">
                            {JSON.stringify(log.metadata, null, 1)}
                          </pre>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                          {log.actorId && <span>Actor: {log.actorId.slice(0, 12)}…</span>}
                          {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-center">{filtered.length} log entries</p>
      )}
    </div>
  )
}