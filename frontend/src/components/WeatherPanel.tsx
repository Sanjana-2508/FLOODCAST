
import {
  CloudRain,
  Droplets,
  TrendingUp,
  CalendarDays,
} from 'lucide-react'

const rainfallData = [
  { day: 'Mon', value: 12 },
  { day: 'Tue', value: 28 },
  { day: 'Wed', value: 18 },
  { day: 'Thu', value: 46 },
  { day: 'Fri', value: 35 },
  { day: 'Sat', value: 62 },
  { day: 'Sun', value: 42 },
]

const maxRainfall = 80

function getIntensity(value: number) {
  if (value < 15) return 'Low'
  if (value < 35) return 'Moderate'
  if (value < 55) return 'Heavy'
  return 'Very heavy'
}

function WeatherPanel() {
  const totalRainfall = rainfallData.reduce(
    (total, day) => total + day.value,
    0
  )

  const averageRainfall = (
    totalRainfall / rainfallData.length
  ).toFixed(1)

  const highestDay = rainfallData.reduce((highest, day) =>
    day.value > highest.value ? day : highest
  )

  const chartPoints = rainfallData
    .map((day, index) => {
      const x = 35 + index * 65
      const y = 145 - (day.value / maxRainfall) * 115
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
            WEATHER INTELLIGENCE
          </div>

          <h2
            style={{
              fontSize: '18px',
              margin: '9px 0 5px',
            }}
          >
            Rainfall analytics
          </h2>

          <p
            style={{
              color: '#82968c',
              fontSize: '11px',
              margin: 0,
            }}
          >
            Illustrative 7-day rainfall dataset
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
          <CloudRain size={22} />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(115px, 1fr))',
          gap: '10px',
          marginTop: '22px',
        }}
      >
        {[
          {
            label: 'TOTAL RAINFALL',
            value: `${totalRainfall} mm`,
            icon: Droplets,
          },
          {
            label: 'DAILY AVERAGE',
            value: `${averageRainfall} mm`,
            icon: TrendingUp,
          },
          {
            label: 'HIGHEST RAINFALL',
            value: `${highestDay.value} mm`,
            icon: CloudRain,
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
                  color: '#e0eee6',
                }}
              >
                {item.value}
              </strong>
            </div>
          )
        })}
      </div>

      {/* RAINFALL CHART */}
      <div style={{ marginTop: '27px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px',
          }}
        >
          <strong style={{ fontSize: '12px' }}>
            Daily rainfall trend
          </strong>

          <span
            style={{
              color: '#82968c',
              fontSize: '10px',
            }}
          >
            mm / day
          </span>
        </div>

        <svg
          viewBox="0 0 470 180"
          role="img"
          aria-label="Illustrative seven-day rainfall trend chart"
          style={{
            width: '100%',
            height: 'auto',
            overflow: 'visible',
          }}
        >
          {[0, 20, 40, 60, 80].map((value) => {
            const y = 145 - (value / maxRainfall) * 115

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

          {rainfallData.map((day, index) => {
            const x = 35 + index * 65
            const y = 145 - (day.value / maxRainfall) * 115

            return (
              <g key={day.day}>
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
                  {day.day}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* DAILY READINGS */}
      <div style={{ marginTop: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '13px',
          }}
        >
          <CalendarDays size={15} color="#00ff9d" />
          <strong style={{ fontSize: '12px' }}>
            Daily readings
          </strong>
        </div>

        {rainfallData.map((day) => (
          <div
            key={day.day}
            style={{
              display: 'grid',
              gridTemplateColumns: '38px 1fr 55px 75px',
              alignItems: 'center',
              gap: '9px',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                color: '#a9bbb0',
              }}
            >
              {day.day}
            </span>

            <div
              style={{
                height: '6px',
                background: '#15251d',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(day.value / maxRainfall) * 100}%`,
                  height: '100%',
                  background: '#00ff9d',
                  borderRadius: '10px',
                }}
              />
            </div>

            <strong
              style={{
                fontSize: '10px',
                textAlign: 'right',
              }}
            >
              {day.value} mm
            </strong>

            <span
              style={{
                fontSize: '9px',
                textAlign: 'right',
                color:
                  day.value >= 55
                    ? '#ff9c73'
                    : day.value >= 35
                      ? '#e6bd75'
                      : '#91a69a',
              }}
            >
              {getIntensity(day.value)}
            </span>
          </div>
        ))}
      </div>

      {/* DEMO WARNING */}
      <div
        style={{
          marginTop: '22px',
          padding: '12px',
          background: 'rgba(230,189,117,0.07)',
          border: '1px solid rgba(230,189,117,0.15)',
          borderRadius: '8px',
          color: '#e6bd75',
          fontSize: '10px',
          lineHeight: 1.6,
        }}
      >
        DEMO DATA — These rainfall values are illustrative.
        Real weather observations and historical datasets
        have not yet been connected.
      </div>
    </section>
  )
}

export default WeatherPanel
