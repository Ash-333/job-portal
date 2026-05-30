'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, RefreshCw, CheckCircle, Loader2, Zap } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

// Force dynamic rendering for this page since it uses searchParams
export const dynamic = 'force-dynamic'

function VerifyEmailSentContent() {
  const [isResending, setIsResending] = useState(false)
  const [resent, setResent] = useState(false)
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email address not found')
      return
    }

    setIsResending(true)

    try {
      await api.sendVerificationEmail(email)
      setResent(true)
      toast.success('Verification email sent again!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend email')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl float" style={{animationDelay: '2s'}}></div>

      <div className="w-full max-w-md relative">
        <Card className="glass border-0 p-8">
          <CardHeader className="text-center p-0 mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-lg gradient-primary shadow-lg">
              <Mail className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              Check Your Email!
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              We've sent you a verification link
            </p>
          </CardHeader>

          <CardContent className="p-0 text-center space-y-6">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <p className="text-sm text-primary font-semibold mb-2">
                📬 Email sent to:
              </p>
              <p className="text-foreground font-bold break-all">
                {email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="text-left space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Click the verification link in your email
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Check your spam folder if you don't see it
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    The link expires in 24 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
              <p className="text-sm text-accent font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Pro tip:
              </p>
              <p className="text-sm text-muted-foreground">
                Add our email to your contacts to ensure you receive future notifications!
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleResendEmail}
                disabled={isResending || resent}
                variant="outline"
                className="w-full rounded-2xl font-semibold"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resent ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-accent" />
                    Email Sent Again!
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Email
                  </>
                )}
              </Button>

              <Button asChild className="w-full rounded-2xl font-bold gradient-primary">
                <Link href="/auth/login">
                  Back to Login
                </Link>
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-xs text-muted-foreground">
                Wrong email address?{' '}
                <Link
                  href="/auth/register"
                  className="text-primary font-semibold hover:underline"
                >
                  Try again
                </Link>
              </p>
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

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/10 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailSentContent />
    </Suspense>
  )
}
