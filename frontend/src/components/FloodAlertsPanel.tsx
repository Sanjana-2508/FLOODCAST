
import {
  BellRing,
  AlertTriangle,
  Info,
  Clock,
  ShieldAlert,
  Waves,
  CheckCircle2,
} from 'lucide-react'

type Alert = {
  id: number
  severity: 'Advisory' | 'Watch' | 'Warning' | 'Critical'
  title: string
  location: string
  description: string
  time: string
  action: string
}

const demoAlerts: Alert[] = [
  {
    id: 1,
    severity: 'Warning',
    title: 'Elevated river discharge',
    location: 'Demo station · River basin A',
    description:
      'Illustrative scenario showing a possible increase in river discharge following sustained rainfall.',
    time: 'Sample event · 2 hours ago',
    action:
      'Monitor official river-level updates and review local preparedness plans.',
  },
  {
    id: 2,
    severity: 'Watch',
    title: 'Heavy rainfall scenario',
    location: 'Demo station · River basin B',
    description:
      'Sample rainfall conditions indicate a scenario that could increase surface runoff.',
    time: 'Sample event · 6 hours ago',
    action:
      'Keep track of local weather advisories and avoid unnecessary travel during heavy rain.',
  },
  {
    id: 3,
    severity: 'Advisory',
    title: 'Catchment monitoring',
    location: 'Demo station · River basin C',
    description:
      'Illustrative monitoring notice for observing rainfall and catchment conditions.',
    time: 'Sample event · Yesterday',
    action:
      'Review catchment characteristics and monitor updates from relevant authorities.',
  },
]

const severityStyles = {
  Advisory: {
    color: '#60A5FA',
    background: 'rgba(96,165,250,0.10)',
    icon: Info,
  },
  Watch: {
    color: '#FACC15',
    background: 'rgba(250,204,21,0.10)',
    icon: Clock,
  },
  Warning: {
    color: '#FB923C',
    background: 'rgba(251,146,60,0.10)',
    icon: AlertTriangle,
  },
  Critical: {
    color: '#F87171',
    background: 'rgba(248,113,113,0.10)',
    icon: ShieldAlert,
  },
}

export default function FloodAlertsPanel() {
  return (
    <section
      style={{
        background: '#07130F',
        border: '1px solid rgba(0,255,157,0.12)',
        borderRadius: '16px',
        padding: '22px',
        color: '#E8F5EE',
        fontFamily: 'inherit',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(0,255,157,0.10)',
              display: 'grid',
              placeItems: 'center',
              color: '#00FF9D',
            }}
          >
            <BellRing size={19} />
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 700,
              }}
            >
              Flood Alerts & Monitoring
            </h3>
            <p
              style={{
                margin: '5px 0 0',
                fontSize: '11px',
                color: '#789187',
              }}
            >
              Illustrative alert scenarios
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            color: '#FACC15',
            background: 'rgba(250,204,21,0.09)',
            border: '1px solid rgba(250,204,21,0.2)',
            padding: '7px 10px',
            borderRadius: '6px',
          }}
        >
          DEMO MODE
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          padding: '12px',
          background: 'rgba(250,204,21,0.06)',
          border: '1px solid rgba(250,204,21,0.15)',
          borderRadius: '9px',
          marginBottom: '18px',
        }}
      >
        <Info
          size={16}
          color="#FACC15"
          style={{ flexShrink: 0, marginTop: '1px' }}
        />
        <p
          style={{
            margin: 0,
            fontSize: '11px',
            lineHeight: 1.6,
            color: '#C5C9B5',
          }}
        >
          DEMO ALERTS — NOT LIVE WARNINGS. These sample scenarios are
          illustrative and are not generated from real-time river,
          weather, or prediction data.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: '100px',
            background: '#0B1C15',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '9px',
            padding: '13px',
          }}
        >
          <p style={{ margin: 0, fontSize: '10px', color: '#789187' }}>
            SAMPLE ALERTS
          </p>
          <h2 style={{ margin: '7px 0 0', fontSize: '23px' }}>
            03
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: '100px',
            background: '#0B1C15',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '9px',
            padding: '13px',
          }}
        >
          <p style={{ margin: 0, fontSize: '10px', color: '#789187' }}>
            LIVE ALERTS
          </p>
          <h2 style={{ margin: '7px 0 0', fontSize: '23px', color: '#789187' }}>
            --
          </h2>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: '100px',
            background: '#0B1C15',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '9px',
            padding: '13px',
          }}
        >
          <p style={{ margin: 0, fontSize: '10px', color: '#789187' }}>
            SYSTEM STATUS
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '9px',
              fontSize: '12px',
              color: '#FACC15',
            }}
          >
            <Clock size={14} />
            Demo
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {demoAlerts.map((alert) => {
          const style = severityStyles[alert.severity]
          const SeverityIcon = style.icon

          return (
            <article
              key={alert.id}
              style={{
                padding: '15px',
                background: '#0A1912',
                border: '1px solid rgba(255,255,255,0.06)',
                borderLeft: `3px solid ${style.color}`,
                borderRadius: '9px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginBottom: '10px',
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: style.color,
                    background: style.background,
                    padding: '5px 8px',
                    borderRadius: '5px',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  <SeverityIcon size={13} />
                  {alert.severity}
                </span>

                <span
                  style={{
                    fontSize: '10px',
                    color: '#71877C',
                  }}
                >
                  {alert.time}
                </span>
              </div>

              <h4
                style={{
                  margin: '0 0 5px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#E8F5EE',
                }}
              >
                {alert.title}
              </h4>

              <p
                style={{
                  margin: '0 0 8px',
                  fontSize: '10px',
                  color: '#00C982',
                }}
              >
                <MapPinIcon /> {alert.location}
              </p>

              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: '11px',
                  lineHeight: 1.6,
                  color: '#9AAEA3',
                }}
              >
                {alert.description}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '10px',
                  borderRadius: '7px',
                  background: 'rgba(0,255,157,0.045)',
                }}
              >
                <CheckCircle2
                  size={14}
                  color="#00FF9D"
                  style={{ flexShrink: 0, marginTop: '1px' }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: '10px',
                    lineHeight: 1.6,
                    color: '#A8BDB1',
                  }}
                >
                  {alert.action}
                </p>
              </div>
            </article>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '17px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: '#71877C',
          fontSize: '10px',
        }}
      >
        <Waves size={14} color="#00C982" />
        Real alert generation requires verified data and backend integration.
      </div>
    </section>
  )
}

function MapPinIcon() {
  return <span aria-hidden="true">⌖</span>
}
