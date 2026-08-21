import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MailCheck, UserPlus } from 'lucide-react'
import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/PasswordInput'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export default function Signup() {
  const { t } = useLanguage()
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError(t.auth.passwordMismatch)
      return
    }

    setSubmitting(true)
    const { error: signUpError, needsEmailConfirmation } = await signUp(email, password)
    setSubmitting(false)

    if (signUpError) {
      setError(t.auth.genericError)
      return
    }

    if (needsEmailConfirmation) {
      setCheckEmail(true)
      return
    }

    navigate('/preferences')
  }

  if (checkEmail) {
    return (
      <AuthShell
        title={t.auth.checkEmailTitle}
        subtitle=""
        footer={
          <Link to="/login" className="text-primary font-semibold underline-offset-4 hover:underline">
            {t.auth.logInLink}
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="bg-accent flex size-16 items-center justify-center rounded-full">
            <MailCheck className="text-accent-foreground size-8" />
          </span>
          <p className="text-foreground text-lg leading-relaxed text-balance">
            {t.auth.checkEmailBody}
          </p>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={t.auth.signupTitle}
      subtitle={t.auth.signupSubtitle}
      footer={
        <span className="text-muted-foreground">
          {t.auth.haveAccount}{' '}
          <Link to="/login" className="text-primary font-semibold underline-offset-4 hover:underline">
            {t.auth.logInLink}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="signup-email">{t.auth.emailLabel}</Label>
          <Input
            id="signup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <PasswordInput
          id="signup-password"
          label={t.auth.passwordLabel}
          value={password}
          onChange={setPassword}
          showLabel={t.auth.showPassword}
          hideLabel={t.auth.hidePassword}
          autoComplete="new-password"
        />

        <PasswordInput
          id="signup-confirm-password"
          label={t.auth.confirmPasswordLabel}
          value={confirmPassword}
          onChange={setConfirmPassword}
          showLabel={t.auth.showPassword}
          hideLabel={t.auth.hidePassword}
          autoComplete="new-password"
        />

        {error && (
          <p role="alert" className="text-destructive text-base font-medium">
            {error}
          </p>
        )}

        <Button type="submit" size="xl" className="mt-2 w-full" disabled={submitting}>
          {t.auth.signUpButton}
          <UserPlus data-icon="inline-end" />
        </Button>
      </form>
    </AuthShell>
  )
}
