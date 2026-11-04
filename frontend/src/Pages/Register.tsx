
import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Waves,
  ShieldCheck,
} from 'lucide-react'

import EarthGlobe from '../components/Globe/EarthGlobe'
import './Login.css'
import './Register.css'

interface RegisterProps {
  onSignIn: () => void
}

function Register({ onSignIn }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget

    const password = (
      form.elements.namedItem('password') as HTMLInputElement
    ).value

    const confirmPassword = (
      form.elements.namedItem('confirmPassword') as HTMLInputElement
    ).value

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    setMessage('Registration validated! Backend integration is next.')
  }

  return (
    <main className="login-page">

      <section className="login-left">

        <div className="brand">
          <div className="brand-icon">
            <Waves size={24} />
          </div>
          <span>FLOODCAST</span>
          <span className="brand-dot">.</span>
        </div>

        <div className="login-content">

          <div className="eyebrow">
            <span className="eyebrow-line" />
            JOIN THE NETWORK
          </div>

          <h1>
            Be prepared.
            <br />
            <span>Stay ahead.</span>
          </h1>

          <p className="login-description">
            Create your FLOODCAST account and explore
            predictive intelligence for a safer tomorrow.
          </p>

          <form className="login-form" onSubmit={handleRegister}>

            <div className="form-group">
              <label htmlFor="fullName">FULL NAME</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="registerEmail">EMAIL ADDRESS</label>
              <input
                id="registerEmail"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div className="password-heading">
                <label htmlFor="registerPassword">PASSWORD</label>
                <span>MIN. 6 CHARACTERS</span>
              </div>

              <div className="password-input">
                <input
                  id="registerPassword"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">CONFIRM PASSWORD</label>

              <div className="password-input">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label="Toggle confirmation visibility"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="login-button" type="submit">
              <span>Create account</span>
              <ArrowRight size={19} />
            </button>

            {message && (
              <p className="register-message" role="status">
                {message}
              </p>
            )}

          </form>

          <div className="account-switch">
            Already have an account?{' '}
            <button type="button" onClick={onSignIn}>
              Sign in
            </button>
          </div>

          <div className="security-note">
            <ShieldCheck size={15} />
            <span>Your access. Your intelligence.</span>
          </div>

        </div>

        <footer className="login-footer">
          <span>© 2026 FLOODCAST</span>
          <span>BUILT FOR A SAFER TOMORROW</span>
        </footer>

      </section>

      <section className="login-right">

        <div className="right-overlay" />

        <div className="globe-heading">
          <span className="live-indicator" />
          GLOBAL MONITORING SYSTEM
        </div>

        <div className="globe-container">
          <EarthGlobe />
        </div>

        <div className="globe-data data-top">
          <span>PLANETARY VIEW</span>
          <strong>01 / EARTH</strong>
        </div>

        <div className="globe-data data-bottom">
          <span>NETWORK STATUS</span>
          <strong>DEMO ENVIRONMENT</strong>
        </div>

        <div className="coordinate">
          12.9716° N &nbsp; 77.5946° E
          <span>BENGALURU, INDIA</span>
        </div>

        <div className="right-footer">
          PREDICT · PREPARE · PROTECT
        </div>

      </section>

    </main>
  )
}

export default Register
