
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Waves,
  TrendingUp,
} from 'lucide-react'

const riskLevels = [
  { label: 'Low', value: 42, color: '#00ff9d' },
  { label: 'Moderate', value: 28, color: '#e6bd75' },
  { label: 'High', value: 20, color: '#ff995e' },
  { label: 'Severe', value: 10, color: '#ff5c69' },
]

const riskFactors = [
  { label: 'Rainfall intensity', value: 'High' },
  { label: 'River discharge', value: 'Pending' },
  { label: 'Catchment slope', value: 'Pending' },
  { label: 'Soil saturation', value: 'Pending' },
]

function FloodRiskPanel() {
  const total = riskLevels.reduce(
    (sum, item) => sum + item.value,
    0
  )

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
            FLOOD INTELLIGENCE
          </div>

          <h2 style={{ fontSize: '18px', margin: '9px 0 5px' }}>
            Flood risk assessment
          </h2>

          <p style={{ color: '#82968c', fontSize: '11px', margin: 0 }}>
            Illustrative risk distribution
          </p>
        </div>

        <ShieldAlert size={25} color="#00ff9d" />
      </div>

      {/* OVERALL STATUS */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          padding: '18px',
          marginTop: '23px',
          background: 'rgba(230,189,117,0.07)',
          border: '1px solid rgba(230,189,117,0.17)',
          borderRadius: '10px',
        }}
      >
        <div
          style={{
            display: 'grid',
            placeItems: 'center',
            width: '45px',
            height: '45px',
            flexShrink: 0,
            borderRadius: '50%',
            background: 'rgba(230,189,117,0.12)',
          }}
        >
          <AlertTriangle size={22} color="#e6bd75" />
        </div>

        <div>
          <div
            style={{
              color: '#e6bd75',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
            }}
          >
            CURRENT ASSESSMENT
          </div>

          <strong
            style={{
              display: 'block',
              fontSize: '20px',
              marginTop: '5px',
            }}
          >
            UNASSESSED
          </strong>

          <small style={{ color: '#82968c', fontSize: '10px' }}>
            Waiting for ML model output
          </small>
        </div>
      </div>

      {/* RISK DISTRIBUTION */}
      <div style={{ marginTop: '27px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '13px',
          }}
        >
          <strong style={{ fontSize: '12px' }}>
            Demo risk distribution
          </strong>

          <span style={{ color: '#82968c', fontSize: '10px' }}>
            Illustrative %
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            height: '12px',
            width: '100%',
            overflow: 'hidden',
            borderRadius: '20px',
            background: '#15251d',
          }}
        >
          {riskLevels.map((level) => (
            <div
              key={level.label}
              style={{
                width: `${(level.value / total) * 100}%`,
                background: level.color,
              }}
            />
          ))}
        </div>

        <div style={{ marginTop: '20px' }}>
          {riskLevels.map((level) => (
            <div
              key={level.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  color: '#b7c9be',
                  fontSize: '11px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: level.color,
                  }}
                />
                {level.label} risk
              </span>

              <strong style={{ fontSize: '12px' }}>
                {level.value}%
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* RISK FACTORS */}
      <div style={{ marginTop: '26px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '15px',
          }}
        >
          <Activity size={16} color="#00ff9d" />
          <strong style={{ fontSize: '12px' }}>
            Risk assessment factors
          </strong>
        </div>

        {riskFactors.map((factor, index) => (
          <div
            key={factor.label}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom:
                index === riskFactors.length - 1
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                color: '#a9bbb0',
                fontSize: '11px',
              }}
            >
              {index === 0 ? (
                <TrendingUp size={14} color="#e6bd75" />
              ) : (
                <Waves size={14} color="#82968c" />
              )}
              {factor.label}
            </span>

            <span
              style={{
                color: factor.value === 'High'
                  ? '#e6bd75'
                  : '#82968c',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {factor.value}
            </span>
          </div>
        ))}
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
        DEMO VISUALISATION — Risk percentages are illustrative,
        not calculated predictions. Actual risk assessment
        requires validated model output.
      </div>
    </section>
  )
}

export default FloodRiskPanel
