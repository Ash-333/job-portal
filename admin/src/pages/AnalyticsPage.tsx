import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  FileText,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock
} from 'lucide-react'
import { useDashboardStats } from '../hooks/useApi'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  const { data: stats, isLoading } = useDashboardStats()

  const analytics = stats ? {
    overview: stats.overview,
    metrics: stats.metrics,
    trends: {
      jobsGrowth: stats.trends?.jobsGrowth ?? 0,
      usersGrowth: stats.trends?.usersGrowth ?? 0,
      applicationsGrowth: stats.trends?.applicationsGrowth ?? 0,
    }
  } : null

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue'
  }: {
    title: string
    value: string | number
    icon: any
    trend?: 'up' | 'down'
    trendValue?: number
    color?: string
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center mt-1 text-sm ${
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                {trendValue}% from last month
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Platform analytics and insights</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Platform analytics and insights</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Failed to load analytics data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Platform analytics and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Jobs"
          value={analytics.overview.totalJobs}
          icon={Briefcase}
          trend="up"
          trendValue={analytics.trends.jobsGrowth}
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={analytics.overview.totalUsers}
          icon={Users}
          trend="up"
          trendValue={analytics.trends.usersGrowth}
          color="green"
        />
        <StatCard
          title="Total Applications"
          value={analytics.overview.totalApplications}
          icon={FileText}
          trend="up"
          trendValue={analytics.trends.applicationsGrowth}
          color="purple"
        />
        <StatCard
          title="Active Jobs"
          value={analytics.overview.activeJobs}
          icon={Activity}
          color="orange"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Application Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {analytics.metrics.applicationRate}
            </div>
            <p className="text-sm text-gray-600">applications per job</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Active Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics.metrics.activeJobsPercentage}%
            </div>
            <p className="text-sm text-gray-600">of total jobs are active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Pending Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {analytics.overview.pendingApplications}
            </div>
            <p className="text-sm text-gray-600">awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Job Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Jobs</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${analytics.metrics.activeJobsPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{analytics.overview.activeJobs}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Inactive Jobs</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-gray-400 h-2 rounded-full"
                      style={{ width: `${100 - analytics.metrics.activeJobsPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {analytics.overview.totalJobs - analytics.overview.activeJobs}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Content Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Published Blogs</span>
                <span className="text-lg font-semibold text-blue-600">
                  {analytics.overview.publishedBlogs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Draft Blogs</span>
                <span className="text-lg font-semibold text-gray-600">
                  {analytics.overview.totalBlogs - analytics.overview.publishedBlogs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Content</span>
                <span className="text-lg font-semibold text-purple-600">
                  {analytics.overview.totalBlogs}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.metrics.averageApplicationsPerJob}
              </div>
              <p className="text-sm text-blue-600 font-medium">Avg Applications per Job</p>
              <p className="text-xs text-gray-600 mt-1">Higher is better</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((analytics.overview.activeJobs / analytics.overview.totalJobs) * 100)}%
              </div>
              <p className="text-sm text-green-600 font-medium">Job Activation Rate</p>
              <p className="text-xs text-gray-600 mt-1">Jobs currently active</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((analytics.overview.publishedBlogs / analytics.overview.totalBlogs) * 100) || 0}%
              </div>
              <p className="text-sm text-purple-600 font-medium">Content Publish Rate</p>
              <p className="text-xs text-gray-600 mt-1">Blogs published vs drafts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
