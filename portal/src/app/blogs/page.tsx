'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar, User, ArrowRight, Loader2 } from 'lucide-react'

export default function BlogsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['blogs', currentPage],
    queryFn: () => api.getBlogs(currentPage, 12),
  })

  const blogs = data?.blogs || [] // ✅ fix: get blogs from `data.blogs`
  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-background via-background to-muted/30 py-20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Career{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Insights
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover career advice, industry insights, and tips to advance your professional journey.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">Loading articles...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">Failed to load articles. Please try again.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : !filteredBlogs.length ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-6">
              {searchQuery ? 'No articles found matching your search.' : 'No articles available.'}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {filteredBlogs.length > 0 && !searchQuery && (
              <section className="mb-16">
                <h2 className="text-2xl font-bold text-foreground mb-8">Featured Article</h2>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="md:flex">
                    {filteredBlogs[0].featuredImage && (
                      <div className="md:w-1/2">
                        <img
                          src={filteredBlogs[0].featuredImage}
                          alt={filteredBlogs[0].title}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`${filteredBlogs[0].featuredImage ? 'md:w-1/2' : 'w-full'} p-8`}>
                      <Badge variant="secondary" className="mb-4">Featured</Badge>
                      <CardTitle className="text-2xl mb-4 line-clamp-2">
                        {filteredBlogs[0].title}
                      </CardTitle>
                      <CardDescription className="text-base mb-6 line-clamp-3">
                        {filteredBlogs[0].excerpt}
                      </CardDescription>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          <span>{filteredBlogs[0].author || 'Admin'}</span>
                          <Calendar className="h-4 w-4 ml-4 mr-2" />
                          <span>{new Date(filteredBlogs[0].publishedAt || filteredBlogs[0].createdAt).toLocaleDateString()}</span>
                        </div>
                        <Button asChild>
                          <Link href={`/blogs/${filteredBlogs[0].slug}`}>
                            Read More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}

            {/* Articles Grid */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                  {searchQuery ? 'Search Results' : 'Latest Articles'}
                </h2>
                {data && (
                  <p className="text-muted-foreground">
                    {filteredBlogs.length} of {data.pagination.total} articles
                  </p>
                )}
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredBlogs.slice(searchQuery ? 0 : 1).map((blog) => (
                  <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                    {blog.featuredImage && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="flex-1">
                      <CardTitle className="text-lg line-clamp-2 mb-2">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {blog.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          <span>{blog.author || 'Admin'}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/blogs/${blog.slug}`}>
                          Read Article
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && !searchQuery && (
              <div className="mt-12 flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!data.pagination.hasPrev}
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
                    const page = i + 1
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!data.pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Newsletter Signup */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stay Updated
            </h2>
            <p className="text-muted-foreground mb-8">
              Get the latest career insights and job market trends delivered to your inbox.
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <Input placeholder="Enter your email" type="email" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
