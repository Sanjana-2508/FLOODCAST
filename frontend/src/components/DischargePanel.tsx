
import {
  Activity,
  Waves,
  TrendingUp,
  Gauge,
} from 'lucide-react'

const dischargeData = [
  { day: 'Mon', value: 120 },
  { day: 'Tue', value: 145 },
  { day: 'Wed', value: 138 },
  { day: 'Thu', value: 190 },
  { day: 'Fri', value: 175 },
  { day: 'Sat', value: 240 },
  { day: 'Sun', value: 210 },
]

const maxDischarge = 300

function DischargePanel() {
  const total = dischargeData.reduce(
    (sum, item) => sum + item.value,
    0
  )

  const average = Math.round(total / dischargeData.length)

  const peak = dischargeData.reduce((highest, item) =>
    item.value > highest.value ? item : highest
  )

  const chartPoints = dischargeData
    .map((item, index) => {
      const x = 38 + index * 65
      const y = 145 - (item.value / maxDischarge) * 115
      return `${x},${y}`
    })
    .join(' ')

  return (
    <section
      style={{
        background: '#07130e',
        border: '1px solid rgba(0,255,157,0.13)',
        borderRadius: '14px',
        padding: '22px',
        color: '#e0eee6',
        minWidth: 0,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              color: '#00ff9d',
              fontSize: '10px',
              letterSpacing: '1.7px',
              fontWeight: 700,
            }}
          >
            HYDROLOGICAL INTELLIGENCE
          </div>

          <h2 style={{ fontSize: '18px', margin: '9px 0 5px' }}>
            River discharge analytics
          </h2>

          <p style={{ color: '#82968c', fontSize: '11px', margin: 0 }}>
            Illustrative 7-day discharge dataset
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(0,255,157,0.09)',
            color: '#00ff9d',
          }}
        >
          <Waves size={22} />
        </div>
      </div>

      {/* METRICS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '10px',
          marginTop: '22px',
        }}
      >
        {[
          {
            label: 'AVERAGE FLOW',
            value: `${average} m³/s`,
            icon: Activity,
          },
          {
            label: 'PEAK FLOW',
            value: `${peak.value} m³/s`,
            icon: TrendingUp,
          },
          {
            label: 'LATEST FLOW',
            value: `${dischargeData[dischargeData.length - 1].value} m³/s`,
            icon: Gauge,
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              style={{
                padding: '14px',
                background: '#0b1913',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '9px',
              }}
            >
              <Icon size={16} color="#00ff9d" />

              <div
                style={{
                  color: '#82968c',
                  fontSize: '9px',
                  letterSpacing: '0.7px',
                  marginTop: '12px',
                }}
              >
                {item.label}
              </div>

              <strong
                style={{
                  display: 'block',
                  fontSize: '19px',
                  marginTop: '6px',
                }}
              >
                {item.value}
              </strong>
            </div>
          )
        })}
      </div>

      {/* CHART */}
      <div style={{ marginTop: '28px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <strong style={{ fontSize: '12px' }}>
            Daily discharge trend
          </strong>

          <span style={{ color: '#82968c', fontSize: '10px' }}>
            m³/s
          </span>
        </div>

        <svg
          viewBox="0 0 470 180"
          role="img"
          aria-label="Illustrative seven-day river discharge trend"
          style={{ width: '100%', height: 'auto' }}
        >
          {[0, 75, 150, 225, 300].map((value) => {
            const y = 145 - (value / maxDischarge) * 115

            return (
              <g key={value}>
                <line
                  x1="30"
                  y1={y}
                  x2="455"
                  y2={y}
                  stroke="rgba(255,255,255,0.09)"
                  strokeDasharray="3 5"
                />

                <text
                  x="22"
                  y={y + 3}
                  fill="#82968c"
                  fontSize="9"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            )
          })}

          <polyline
            points={chartPoints}
            fill="none"
            stroke="#00ff9d"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {dischargeData.map((item, index) => {
            const x = 38 + index * 65
            const y = 145 - (item.value / maxDischarge) * 115

            return (
              <g key={item.day}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#00ff9d"
                  stroke="#07130e"
                  strokeWidth="2"
                />

                <text
                  x={x}
                  y="168"
                  fill="#82968c"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {item.day}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* PEAK FLOW */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '18px',
          padding: '15px',
          background: 'rgba(0,255,157,0.05)',
          border: '1px solid rgba(0,255,157,0.12)',
          borderRadius: '9px',
        }}
      >
        <div>
          <span
            style={{
              color: '#82968c',
              fontSize: '10px',
              letterSpacing: '1px',
            }}
          >
            HIGHEST RECORDED DEMO FLOW
          </span>

          <strong
            style={{
              display: 'block',
              fontSize: '20px',
              marginTop: '6px',
            }}
          >
            {peak.value} m³/s
          </strong>

          <small style={{ color: '#82968c' }}>
            {peak.day}
          </small>
        </div>

        <TrendingUp size={25} color="#00ff9d" />
      </div>

      {/* DISCLAIMER */}
      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          background: 'rgba(230,189,117,0.07)',
          border: '1px solid rgba(230,189,117,0.15)',
          borderRadius: '8px',
          color: '#e6bd75',
          fontSize: '10px',
          lineHeight: 1.6,
        }}
      >
        DEMO DATA — These discharge values are illustrative.
        No live river gauge or ML prediction is connected.
      </div>
    </section>
  )
}

export default DischargePanel
