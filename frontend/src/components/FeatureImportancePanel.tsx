
import {
  BrainCircuit,
  CloudRain,
  Thermometer,
  Mountain,
  Droplets,
  TrendingUp,
  Info,
  BarChart3,
} from 'lucide-react'

type Feature = {
  name: string
  description: string
  importance: number
  icon: typeof CloudRain
  color: string
}

const demoFeatures: Feature[] = [
  {
    name: 'Rainfall',
    description: 'Daily precipitation received by the catchment',
    importance: 38,
    icon: CloudRain,
    color: '#00FF9D',
  },
  {
    name: 'Catchment Area',
    description: 'Total drainage area contributing to river flow',
    importance: 27,
    icon: Mountain,
    color: '#60A5FA',
  },
  {
    name: 'Temperature',
    description: 'Temperature conditions affecting runoff processes',
    importance: 16,
    icon: Thermometer,
    color: '#FACC15',
  },
  {
    name: 'Elevation',
    description: 'Elevation characteristics of the catchment',
    importance: 12,
    icon: TrendingUp,
    color: '#C084FC',
  },
  {
    name: 'Catchment Slope',
    description: 'Terrain gradient influencing runoff movement',
    importance: 7,
    icon: Droplets,
    color: '#FB923C',
  },
]

export default function FeatureImportancePanel() {
  return (
    <section
      style={{
        width: '100%',
        padding: '22px',
        borderRadius: '16px',
        background: '#07130F',
        border: '1px solid rgba(0,255,157,0.12)',
        color: '#E8F5EE',
        fontFamily: 'inherit',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
            <BrainCircuit size={20} />
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              Model Explainability
            </h3>
            <p
              style={{
                margin: '5px 0 0',
                fontSize: '11px',
                color: '#789187',
              }}
            >
              Understanding prediction input features
            </p>
          </div>
        </div>

        <span
          style={{
            padding: '7px 10px',
            borderRadius: '6px',
            background: 'rgba(250,204,21,0.08)',
            border: '1px solid rgba(250,204,21,0.2)',
            color: '#FACC15',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.7px',
          }}
        >
          DEMO MODEL
        </span>
      </div>

      {/* Disclaimer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '9px',
          padding: '12px',
          borderRadius: '9px',
          background: 'rgba(250,204,21,0.055)',
          border: '1px solid rgba(250,204,21,0.14)',
          marginBottom: '22px',
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
            color: '#C5C9B5',
            lineHeight: 1.6,
          }}
        >
          Illustrative feature weights for UI demonstration only. These are
          not trained model results or actual SHAP values.
        </p>
      </div>

      {/* Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))',
          gap: '10px',
          marginBottom: '22px',
        }}
      >
        <div
          style={{
            background: '#0B1C15',
            padding: '14px',
            borderRadius: '9px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p style={{ margin: 0, color: '#789187', fontSize: '10px' }}>
            INPUT FEATURES
          </p>
          <h2 style={{ margin: '8px 0 0', fontSize: '23px' }}>05</h2>
        </div>

        <div
          style={{
            background: '#0B1C15',
            padding: '14px',
            borderRadius: '9px',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <p style={{ margin: 0, color: '#789187', fontSize: '10px' }}>
            MODEL EXPLANATION
          </p>
          <h2 style={{ margin: '8px 0 0', fontSize: '15px', color: '#FACC15' }}>
            Pending
          </h2>
        </div>
      </div>

      {/* Feature importance */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>
          Illustrative Feature Weights
        </h4>

        <BarChart3 size={17} color="#00FF9D" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '19px' }}>
        {demoFeatures.map((feature, index) => {
          const FeatureIcon = feature.icon

          return (
            <div key={feature.name}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      display: 'grid',
                      placeItems: 'center',
                      color: feature.color,
                      background: `${feature.color}15`,
                    }}
                  >
                    <FeatureIcon size={15} />
                  </div>

                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {index + 1}. {feature.name}
                    </p>
                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: '10px',
                        color: '#71877C',
                      }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: feature.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {feature.importance}%
                </span>
              </div>

              <div
                style={{
                  height: '7px',
                  width: '100%',
                  borderRadius: '20px',
                  background: '#17251E',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${feature.importance}%`,
                    borderRadius: '20px',
                    background: feature.color,
                    boxShadow: `0 0 10px ${feature.color}35`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Explanation note */}
      <div
        style={{
          marginTop: '23px',
          padding: '14px',
          borderRadius: '9px',
          background: 'rgba(0,255,157,0.045)',
          border: '1px solid rgba(0,255,157,0.10)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '7px',
          }}
        >
          <BrainCircuit size={15} color="#00FF9D" />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#00FF9D' }}>
            WHY THIS MATTERS
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '11px',
            lineHeight: 1.7,
            color: '#9AAEA3',
          }}
        >
          Feature importance helps explain which catchment and weather
          characteristics contribute to discharge estimates. Actual
          explanations will be generated using the trained model after
          backend integration.
        </p>
      </div>

      <p
        style={{
          margin: '15px 0 0',
          fontSize: '10px',
          color: '#71877C',
          textAlign: 'center',
        }}
      >
        Actual feature importance and SHAP explanations: pending ML integration
      </p>
    </section>
  )
}
