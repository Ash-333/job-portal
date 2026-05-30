import { useParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowLeft, Edit, Calendar, Tag, Eye, Globe } from 'lucide-react'
import { useBlog } from '../hooks/useApi'
import { formatDate } from '../lib/utils'
import { sanitizeHtml } from '../lib/sanitize'

export default function BlogViewPage() {
  const { id } = useParams()
  const { data: blogData, isLoading, error } = useBlog(id || '')

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

  if (error || !blogData?.blog) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/blogs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>Blog post not found or failed to load.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const blog = blogData.blog

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/blogs">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blogs
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{blog.title}</h1>
            <p className="text-gray-600">
              {blog.isPublished ? 'Published' : 'Draft'} • {formatDate(blog.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {blog.isPublished && (
            <Button variant="outline" size="sm">
              <Globe className="h-4 w-4 mr-2" />
              View Live
            </Button>
          )}
          <Link to={`/blogs/${blog.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Image */}
          {blog.featuredImage && (
            <Card>
              <CardContent className="pt-6">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Excerpt */}
          {blog.excerpt && (
            <Card>
              <CardHeader>
                <CardTitle>Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic">{blog.excerpt}</p>
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.content) }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publication Status */}
          <Card>
            <CardHeader>
              <CardTitle>Publication Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  blog.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(blog.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-3 w-3" />
                    <span>Updated: {formatDate(blog.updatedAt)}</span>
                  </div>
                  {blog.publishedAt && (
                    <div className="flex items-center space-x-2">
                      <Globe className="h-3 w-3" />
                      <span>Published: {formatDate(blog.publishedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* SEO Information */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {blog.metaTitle && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Meta Title
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{blog.metaTitle}</p>
                </div>
              )}
              {blog.metaDescription && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Meta Description
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{blog.metaDescription}</p>
                </div>
              )}
              {blog.metaKeywords && blog.metaKeywords.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Meta Keywords
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {blog.metaKeywords.join(', ')}
                  </p>
                </div>
              )}
              {blog.slug && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    URL Slug
                  </label>
                  <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-100 px-2 py-1 rounded">
                    /{blog.slug}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Views:</span>
                </div>
                <span className="text-sm font-medium">{blog.views || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Word Count:</span>
                <span className="text-sm font-medium">
                  {blog.content ? blog.content.replace(/<[^>]*>/g, '').split(' ').length : 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reading Time:</span>
                <span className="text-sm font-medium">
                  {blog.content
                    ? Math.ceil(blog.content.replace(/<[^>]*>/g, '').split(' ').length / 200)
                    : 0
                  } min
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
