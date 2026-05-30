'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Loader2, Building2, Upload, Globe, Users, Tag, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '501-1000', label: '501-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
]

export default function CompanyProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [form, setForm] = useState({
    companyName: '',
    companyDescription: '',
    companyWebsite: '',
    companySize: '',
    industry: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        companyName: user.companyName || '',
        companyDescription: user.companyDescription || '',
        companyWebsite: user.companyWebsite || '',
        companySize: user.companySize || '',
        industry: user.industry || '',
      })
    }
  }, [user])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    try {
      const result = await api.uploadCompanyLogo(file)
      await api.updateEmployerProfile({ companyLogo: result.url })
      updateUserProfile({ companyLogo: result.url })
      toast.success('Company logo updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName) {
      toast.error('Company name is required')
      return
    }

    setLoading(true)
    try {
      const updated = await api.updateEmployerProfile({
        companyName: form.companyName,
        companyDescription: form.companyDescription || undefined,
        companyWebsite: form.companyWebsite || undefined,
        companySize: form.companySize || undefined,
        industry: form.industry || undefined,
      })
      updateUserProfile(updated.user || updated)
      toast.success('Company profile updated')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const initials = form.companyName
    ? form.companyName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'C'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your company information and branding</p>
      </div>

      {/* Logo Section */}
      <Card className="border border-border/60">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar className="h-20 w-20 rounded-2xl shrink-0">
            <AvatarImage src={user?.companyLogo} alt={form.companyName} />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Company Logo</p>
            <p className="text-sm text-muted-foreground mt-0.5">Recommended: 400x400px. PNG or JPG.</p>
            <div className="mt-3">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button variant="outline" type="button" disabled={uploadingLogo} asChild className="rounded-xl">
                  <span>
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload Logo
                  </span>
                </Button>
              </Label>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                    required
                    disabled={loading}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="industry"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    placeholder="e.g. Technology, Healthcare"
                    disabled={loading}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyDescription">Company Description</Label>
              <Textarea
                id="companyDescription"
                value={form.companyDescription}
                onChange={(e) => setForm({ ...form, companyDescription: e.target.value })}
                placeholder="Tell applicants about your company culture, mission, and what makes you unique..."
                rows={4}
                disabled={loading}
                className="rounded-xl"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="companySize">Company Size</Label>
                <Select
                  value={form.companySize}
                  onValueChange={(v) => setForm({ ...form, companySize: v })}
                  disabled={loading}
                >
                  <SelectTrigger className="rounded-xl">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="companyWebsite"
                    value={form.companyWebsite}
                    onChange={(e) => setForm({ ...form, companyWebsite: e.target.value })}
                    placeholder="https://example.com"
                    disabled={loading}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading} className="rounded-xl px-8">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
