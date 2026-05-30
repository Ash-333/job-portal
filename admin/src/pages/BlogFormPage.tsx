import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import RichTextEditor from '../components/RichTextEditor'
import ImageUpload from '../components/ImageUpload'
import { useCreateBlog, useUpdateBlog, useBlog, useUploadBlogImage } from '../hooks/useApi'
import toast from 'react-hot-toast'

export default function BlogFormPage() {
  console.log("Adding new blog post")
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    metaKeywords: '',
    isPublished: false,
  })

  const { data: blogData, isLoading: loadingBlog } = useBlog(id || '')
  const createBlogMutation = useCreateBlog()
  const updateBlogMutation = useUpdateBlog()
  const uploadImageMutation = useUploadBlogImage()

  useEffect(() => {
    if (isEditing && blogData?.blog) {
      const blog = blogData.blog
      setFormData({
        title: blog.title || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featuredImage: blog.featuredImage || '',
        metaKeywords: blog.metaKeywords?.join(', ') || '',
        isPublished: blog.isPublished || false,
      })
    }
  }, [isEditing, blogData])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }))
  }

  const handleImageUpload = async (file: File) => {
    const result = await uploadImageMutation.mutateAsync(file)
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    const blogData = {
      title: formData.title.trim(),
      excerpt: formData.excerpt.trim(),
      content: formData.content,
      featuredImage: formData.featuredImage.trim() || undefined,
      metaKeywords: formData.metaKeywords.split(',').map(keyword => keyword.trim()).filter(Boolean),
      isPublished: formData.isPublished,
    }

    // Debug: Log the data being sent
    console.log('Blog data being sent:', blogData)

    if (isEditing) {
      updateBlogMutation.mutate({ id: id!, data: blogData }, {
        onSuccess: () => {
          navigate('/blogs')
        }
      })
    } else {
      createBlogMutation.mutate(blogData, {
        onSuccess: () => {
          navigate('/blogs')
        }
      })
    }
  }

  const handleSaveAsDraft = () => {
    setFormData(prev => ({ ...prev, isPublished: false }))
    setTimeout(() => {
      document.getElementById('blog-form')?.dispatchEvent(new Event('submit', { bubbles: true }))
    }, 0)
  }

  const handlePublish = () => {
    setFormData(prev => ({ ...prev, isPublished: true }))
    setTimeout(() => {
      document.getElementById('blog-form')?.dispatchEvent(new Event('submit', { bubbles: true }))
    }, 0)
  }



  if (isEditing && loadingBlog) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-32 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update your blog post' : 'Write and publish a new blog post'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleSaveAsDraft}
            disabled={createBlogMutation.isPending || updateBlogMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={createBlogMutation.isPending || updateBlogMutation.isPending}
          >
            <Eye className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Blog Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter blog title..."
                required
              />
            </div>

            {/* Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Brief description of the blog post..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your blog content here..."
                height="400px"
              />
            </div>

            {/* Featured Image */}
            <ImageUpload
              value={formData.featuredImage}
              onChange={(url) => setFormData(prev => ({ ...prev, featuredImage: url }))}
              onUpload={handleImageUpload}
              isUploading={uploadImageMutation.isPending}
              label="Featured Image"
              placeholder="Enter image URL or upload a file"
            />

            {/* Meta Keywords */}
            <div>
              <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Keywords
              </label>
              <Input
                id="metaKeywords"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleInputChange}
                placeholder="technology, programming, web development (comma separated)"
              />
              <p className="text-sm text-gray-500 mt-1">Separate keywords with commas for SEO</p>
            </div>

            {/* Publish Status */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                checked={formData.isPublished}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                Publish immediately
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Link to="/blogs">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={createBlogMutation.isPending || updateBlogMutation.isPending}
              >
                {createBlogMutation.isPending || updateBlogMutation.isPending
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update Blog' : 'Create Blog')
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
