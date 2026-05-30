'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)
    
    try {
      const response = await api.forgotPassword(email)
      setIsSubmitted(true)
      toast.success('Password reset instructions sent!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
        
        <div className="w-full max-w-md relative">
          <Card className="glass border-0 p-8">
            <CardHeader className="text-center p-0 mb-8">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-accent glow-accent">
                <CheckCircle className="h-10 w-10 text-accent-foreground" />
              </div>
              <CardTitle className="text-2xl font-black text-foreground">
                Check Your Email! 📧
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 text-center space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                We've sent password reset instructions to <span className="font-semibold text-foreground">{email}</span>
              </p>
              
              <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                <p className="text-sm text-accent font-semibold mb-2">
                  ⚡ Quick tip:
                </p>
                <p className="text-sm text-muted-foreground">
                  Check your spam folder if you don't see the email in your inbox within a few minutes.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => setIsSubmitted(false)}
                  variant="outline" 
                  className="w-full rounded-2xl font-semibold"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Another Email
                </Button>
                <Button asChild className="w-full rounded-2xl font-bold gradient-primary">
                  <Link href="/auth/login">
                    Back to Login
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-6">
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-destructive/10 rounded-full blur-3xl float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>
      
      <div className="w-full max-w-md relative">
        <Card className="glass border-0 p-8">
          <CardHeader className="text-center p-0 mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-destructive to-cta glow-accent">
              <Mail className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              Forgot Password? 🔐
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              No worries! We'll send you reset instructions.
            </p>
          </CardHeader>
          
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-2xl border-2 h-12 px-4 font-medium"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full rounded-2xl font-bold h-12 bg-gradient-to-r from-destructive to-cta hover:scale-105 transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-8 text-center">
              <Link 
                href="/auth/login"
                className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
