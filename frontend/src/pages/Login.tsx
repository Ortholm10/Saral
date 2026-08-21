import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { AuthShell } from '@/components/layout/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/PasswordInput'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export default function Login() {
  const { t } = useLanguage()
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await signIn(email, password)

    setSubmitting(false)
    if (signInError) {
      setError(
        signInError.message.toLowerCase().includes('invalid')
          ? t.auth.invalidCredentials
          : t.auth.genericError,
      )
      return
    }

    navigate('/dashboard')
  }

  return (
    <AuthShell
      title={t.auth.loginTitle}
      subtitle={t.auth.loginSubtitle}
      footer={
        <span className="text-muted-foreground">
          {t.auth.noAccount}{' '}
          <Link to="/signup" className="text-primary font-semibold underline-offset-4 hover:underline">
            {t.auth.signUpLink}
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email">{t.auth.emailLabel}</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <PasswordInput
          id="login-password"
          label={t.auth.passwordLabel}
          value={password}
          onChange={setPassword}
          showLabel={t.auth.showPassword}
          hideLabel={t.auth.hidePassword}
          autoComplete="current-password"
        />

        {error && (
          <p role="alert" className="text-destructive text-base font-medium">
            {error}
          </p>
        )}

        <Button type="submit" size="xl" className="mt-2 w-full" disabled={submitting}>
          {t.auth.logInButton}
          <LogIn data-icon="inline-end" />
        </Button>
      </form>
    </AuthShell>
  )
}
