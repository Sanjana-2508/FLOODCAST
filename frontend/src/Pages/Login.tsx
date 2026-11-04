
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

interface LoginProps {
  onAccess: () => void
  onCreateAccount: () => void
}

function Login({ onAccess, onCreateAccount }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onAccess()
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
            GLOBAL FLOOD INTELLIGENCE
          </div>

          <h1>
            Predict the
            <br />
            <span>unpredictable.</span>
          </h1>

          <p className="login-description">
            Understand river behaviour before it becomes
            a crisis. Harness predictive intelligence to
            anticipate flood risks and protect communities.
          </p>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">EMAIL ADDRESS</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div className="password-heading">
                <label htmlFor="password">PASSWORD</label>
                <span>SECURE ACCESS</span>
              </div>

              <div className="password-input">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword
                    ? <EyeOff size={18} />
                    : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button className="login-button" type="submit">
              <span>Access platform</span>
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="account-switch">
            New to FLOODCAST?{' '}
            <button type="button" onClick={onCreateAccount}>
              Create account
            </button>
          </div>

          <div className="security-note">
            <ShieldCheck size={15} />
            <span>Secure access to flood intelligence</span>
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
          <EarthGlobe showStations={false} />
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

export default Login
