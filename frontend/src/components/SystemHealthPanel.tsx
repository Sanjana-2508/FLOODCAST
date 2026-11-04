
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  BrainCircuit,
} from 'lucide-react'

interface SystemHealthPanelProps {
  backendStatus: 'checking' | 'connected' | 'offline'
}

export default function SystemHealthPanel({
  backendStatus,
}: SystemHealthPanelProps) {
  const items = [
    {
      label: 'Frontend dashboard',
      detail: 'Application interface loaded',
      status: 'connected',
      icon: Activity,
    },
    {
      label: 'Backend API',
      detail:
        backendStatus === 'connected'
          ? 'Health endpoint responding'
          : backendStatus === 'checking'
            ? 'Checking server connection'
            : 'Server unavailable',
      status: backendStatus,
      icon: Database,
    },
    {
      label: 'ML prediction model',
      detail: 'Prediction integration pending',
      status: 'pending',
      icon: BrainCircuit,
    },
    {
      label: 'Real-time datasets',
      detail: 'Rainfall and discharge data pending',
      status: 'pending',
      icon: Database,
    },
  ] as const

  return (
    <section className="system-health-panel">
      <div className="system-health-heading">
        <div>
          <span className="section-eyebrow">
            PLATFORM STATUS
          </span>
          <h2>System health</h2>
        </div>
        <Activity size={20} />
      </div>

      <div className="system-health-list">
        {items.map((item) => {
          const Icon = item.icon

          return (
            <div className="system-health-item" key={item.label}>
              <div className="system-health-icon">
                <Icon size={18} />
              </div>

              <div className="system-health-info">
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </div>

              <span className={`health-status ${item.status}`}>
                {item.status === 'connected' ? (
                  <>
                    <CheckCircle2 size={13} />
                    Connected
                  </>
                ) : item.status === 'checking' ? (
                  <>
                    <Clock size={13} />
                    Checking
                  </>
                ) : item.status === 'offline' ? (
                  <>
                    <AlertCircle size={13} />
                    Offline
                  </>
                ) : (
                  <>
                    <Clock size={13} />
                    Pending
                  </>
                )}
              </span>
            </div>
          )
        })}
      </div>

      <p className="system-health-note">
        System connectivity is separate from model readiness.
        Pending integrations are not represented as live services.
      </p>
    </section>
  )
}
