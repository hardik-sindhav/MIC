import { useId, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { loginRequest } from '../api/auth.js'
import { Button } from '../components/ui/Button.jsx'
import { Card } from '../components/ui/Card.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { Input } from '../components/ui/Input.jsx'
import { Label } from '../components/ui/Label.jsx'

const passwordFieldBase =
  'w-full min-h-[48px] rounded-xl border bg-surface px-4 py-3 pr-12 text-body text-foreground transition-all duration-200 placeholder:text-foreground-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 dark:bg-surface-elevated sm:min-h-[46px]'

function loginErrorMessage(err) {
  if (err?.status === 423) {
    return 'Account temporarily locked. Try again later.'
  }
  if (err?.status === 429) {
    return 'Too many attempts. Please wait and try again.'
  }
  if (err?.status === 401) {
    return err.message || 'Invalid email or password.'
  }
  if (err?.status === 503 && err?.code === 'CORS_NOT_CONFIGURED') {
    return 'Server CORS is not configured. Set CORS_ORIGINS on the API.'
  }
  if (err?.name === 'TypeError' || err?.message?.includes('fetch')) {
    return 'Cannot reach the server. Check that the API is running and VITE_API_URL is correct.'
  }
  return err?.message || 'Something went wrong. Please try again.'
}

/**
 * Admin sign-in — calls backend, toasts errors, redirects to home on success.
 */
export function Login() {
  const formId = useId()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' })

  const passwordId = `${formId}-password`
  const rawFrom = typeof location.state?.from === 'string' ? location.state.from : '/dashboard'
  const redirectTo =
    rawFrom === '/login' || rawFrom === '/' ? '/dashboard' : rawFrom

  function validate() {
    const next = { email: '', password: '' }
    if (!email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Password is required.'
    else if (password.length < 8) next.password = 'Use at least 8 characters.'
    setFieldErrors(next)
    return !next.email && !next.password
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fix the fields below.')
      return
    }

    setLoading(true)
    try {
      const data = await loginRequest({ email, password })
      login(data)
      toast.success('Signed in successfully')
      navigate(redirectTo, { replace: true })
    } catch (err) {
      toast.error(loginErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card accentTop className="w-full">
      <div className="mb-8 text-center lg:text-left">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-accent">access</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-[2rem] sm:leading-tight">
          Sign in to console
        </h1>
        <p className="mt-2 text-body text-foreground-muted">MIC administrator authentication.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Input
          id={`${formId}-email`}
          name="email"
          type="email"
          autoComplete="email"
          label="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="name@organization.com"
        />

        <div className="w-full">
          <Label htmlFor={passwordId} required>
            Password
          </Label>
          <div className="relative mt-2">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={fieldErrors.password ? 'true' : undefined}
              aria-describedby={fieldErrors.password ? `${passwordId}-err` : undefined}
              placeholder="Enter password"
              className={`${passwordFieldBase} ${
                fieldErrors.password
                  ? 'border-error focus-visible:ring-error/40'
                  : 'border-border hover:border-border-strong'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-foreground-muted transition-colors hover:bg-surface-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface dark:hover:bg-surface-muted/80"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p id={`${passwordId}-err`} role="alert" className="mt-2 text-small text-error">
              {fieldErrors.password}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="h-12 w-full rounded-xl text-[15px] font-semibold tracking-wide" loading={loading} disabled={loading}>
          {loading ? 'Authenticating…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-foreground-subtle">
        Authorized access only
      </p>
    </Card>
  )
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path
        d="M10.7 10.7a3 3 0 004.6 4.6M9.88 5.09A10.94 10.94 0 0112 5c6.5 0 10 7 10 7a18.29 18.29 0 01-4.12 5.18M6.61 6.61A18.85 18.85 0 002 12s3.5 7 10 7a9.74 9.74 0 004.39-1M2 2l20 20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
