
import { useState, type FormEvent, type CSSProperties } from 'react'

import {
  ArrowLeft,
  Activity,
  CloudRain,
  Mountain,
  MapPin,
  Thermometer,
  Waves,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TrendingUp,
  BrainCircuit,
} from 'lucide-react'

import {
  getPrediction,
  type PredictionResult,
} from '../services/predictionApi'

interface PredictionProps {
  onBack: () => void
  initialStation?: string
}

function Prediction({
  onBack,
  initialStation = '',
}: PredictionProps) {
  const [form, setForm] = useState({
    station: initialStation,
    rainfall: '',
    temperature: '',
    catchmentArea: '',
    elevation: '',
    slope: '',
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))

    setMessage('')
    setError(false)
    setResult(null)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (loading) return

    const numericFields = [
      'rainfall',
      'temperature',
      'catchmentArea',
      'elevation',
      'slope',
    ] as const

    for (const field of numericFields) {
      const value = Number(form[field])

      if (
        form[field].trim() === '' ||
        !Number.isFinite(value)
      ) {
        setMessage('Please enter valid values in all fields.')
        setError(true)
        return
      }
    }

    if (
      Number(form.rainfall) < 0 ||
      Number(form.catchmentArea) <= 0 ||
      Number(form.elevation) < 0 ||
      Number(form.slope) < 0
    ) {
      setMessage('Please check the values entered.')
      setError(true)
      return
    }

    if (!form.station.trim()) {
      setMessage('Please enter a monitoring station.')
      setError(true)
      return
    }

    setLoading(true)
    setMessage('')
    setError(false)
    setResult(null)

    try {
      const prediction = await getPrediction({
        station: form.station.trim(),
        rainfall: Number(form.rainfall),
        temperature: Number(form.temperature),
        catchmentArea: Number(form.catchmentArea),
        elevation: Number(form.elevation),
        slope: Number(form.slope),
      })

      setResult(prediction)
      setMessage('Prediction generated successfully.')
      setError(false)
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Something went wrong while generating the prediction.'
      )
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '13px 14px',
    background: '#0b1913',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#e0eee6',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: CSSProperties = {
    display: 'block',
    marginBottom: '9px',
    color: '#b7c9be',
    fontSize: '12px',
    fontWeight: 600,
  }

  const fields = [
    {
      key: 'rainfall' as const,
      label: 'Daily rainfall',
      unit: 'mm',
      placeholder: 'e.g. 45',
      icon: CloudRain,
    },
    {
      key: 'temperature' as const,
      label: 'Temperature',
      unit: '°C',
      placeholder: 'e.g. 28',
      icon: Thermometer,
    },
    {
      key: 'catchmentArea' as const,
      label: 'Catchment area',
      unit: 'km²',
      placeholder: 'e.g. 1250',
      icon: Waves,
    },
    {
      key: 'elevation' as const,
      label: 'Elevation',
      unit: 'm',
      placeholder: 'e.g. 450',
      icon: Mountain,
    },
    {
      key: 'slope' as const,
      label: 'Catchment slope',
      unit: '°',
      placeholder: 'e.g. 12',
      icon: Activity,
    },
  ]

  const resultCards = result
    ? [
        {
          label: 'PREDICTED DISCHARGE',
          value: result.predictedDischarge,
          unit: 'm³/s',
        },
        {
          label: 'FLOOD SEVERITY',
          value: result.floodSeverity,
          unit: 'Model assessment',
        },
        {
          label: 'EXPECTED FLOOD PEAK',
          value: result.expectedPeak,
          unit: 'm³/s',
        },
        {
          label: 'MODEL CONFIDENCE',
          value: result.confidence,
          unit: '%',
        },
      ]
    : []

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#030906',
        color: '#e0eee6',
        padding: '30px 5%',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '25px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            fontSize: '19px',
            fontWeight: 800,
            letterSpacing: '1px',
          }}
        >
          <Waves color="#00ff9d" size={25} />
          FLOODCAST
          <span style={{ color: '#00ff9d' }}>.</span>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 16px',
            background: '#0b1913',
            border: '1px solid rgba(0,255,157,0.2)',
            borderRadius: '8px',
            color: '#d3e1d9',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </header>

      <section
        style={{
          maxWidth: '950px',
          margin: '55px auto',
        }}
      >
        <div
          style={{
            color: '#00ff9d',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '2px',
            marginBottom: '14px',
          }}
        >
          HYDROLOGICAL MODELLING / 02
        </div>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            margin: '0 0 12px',
            color: '#f0f7f2',
          }}
        >
          Flood <span style={{ color: '#00ff9d' }}>prediction.</span>
        </h1>

        <p
          style={{
            color: '#91a69a',
            fontSize: '14px',
            lineHeight: 1.7,
            maxWidth: '650px',
            marginBottom: '35px',
          }}
        >
          Enter weather and catchment characteristics to estimate
          daily river discharge using the FLOODCAST prediction model.
        </p>

        {/* PREDICTION FORM */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: 'clamp(20px, 4vw, 36px)',
            background: '#07130e',
            border: '1px solid rgba(0,255,157,0.13)',
            borderRadius: '16px',
          }}
        >
          {/* STATION INFORMATION */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '17px',
                marginBottom: '22px',
              }}
            >
              <MapPin color="#00ff9d" size={19} />
              Station information
            </h2>

            <label style={labelStyle}>
              Monitoring station / location

              <input
                style={inputStyle}
                type="text"
                placeholder="Enter station name or location"
                value={form.station}
                onChange={(event) =>
                  updateField('station', event.target.value)
                }
                required
              />
            </label>

            {initialStation && form.station === initialStation && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  marginTop: '10px',
                  color: '#00ff9d',
                  fontSize: '11px',
                }}
              >
                <CheckCircle2 size={14} />
                Station selected from dashboard
              </div>
            )}
          </div>

          {/* WEATHER INPUTS */}
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '17px',
                marginBottom: '22px',
              }}
            >
              <CloudRain color="#00ff9d" size={19} />
              Weather inputs
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              {fields.slice(0, 2).map((field) => {
                const Icon = field.icon

                return (
                  <label key={field.key} style={labelStyle}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        marginBottom: '9px',
                      }}
                    >
                      <Icon size={15} color="#00ff9d" />
                      {field.label} ({field.unit})
                    </span>

                    <input
                      style={inputStyle}
                      type="number"
                      step="any"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      required
                    />
                  </label>
                )
              })}
            </div>
          </div>

          {/* CATCHMENT CHARACTERISTICS */}
          <div style={{ marginBottom: '30px' }}>
            <h2
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '17px',
                marginBottom: '22px',
              }}
            >
              <Mountain color="#00ff9d" size={19} />
              Catchment characteristics
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px',
              }}
            >
              {fields.slice(2).map((field) => {
                const Icon = field.icon

                return (
                  <label key={field.key} style={labelStyle}>
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        marginBottom: '9px',
                      }}
                    >
                      <Icon size={15} color="#00ff9d" />
                      {field.label} ({field.unit})
                    </span>

                    <input
                      style={inputStyle}
                      type="number"
                      step="any"
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={(event) =>
                        updateField(field.key, event.target.value)
                      }
                      required
                    />
                  </label>
                )
              })}
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <div
              role="status"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px',
                marginBottom: '20px',
                borderRadius: '8px',
                background: error
                  ? 'rgba(255,100,100,0.08)'
                  : 'rgba(0,255,157,0.08)',
                color: error ? '#ff9999' : '#00ff9d',
                fontSize: '12px',
                lineHeight: 1.6,
              }}
            >
              {error
                ? <AlertCircle size={17} />
                : <CheckCircle2 size={17} />}
              {message}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              border: 'none',
              borderRadius: '8px',
              background: loading ? '#527765' : '#00ff9d',
              color: '#031009',
              fontSize: '13px',
              fontWeight: 800,
              letterSpacing: '0.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                GENERATING PREDICTION...
              </>
            ) : (
              <>
                <Activity size={17} />
                GENERATE FLOOD PREDICTION
              </>
            )}
          </button>

          <p
            style={{
              color: '#72877b',
              fontSize: '11px',
              lineHeight: 1.6,
              textAlign: 'center',
              marginTop: '17px',
            }}
          >
            Results depend on the availability and accuracy of the
            connected ML model.
          </p>
        </form>

        {/* PREDICTION RESULTS */}
        {result && (
          <div
            style={{
              marginTop: '28px',
              padding: 'clamp(20px, 4vw, 28px)',
              background: '#07130e',
              border: '1px solid rgba(0,255,157,0.2)',
              borderRadius: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                color: '#00ff9d',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '2px',
              }}
            >
              <BrainCircuit size={17} />
              MODEL OUTPUT / 03
            </div>

            <h2
              style={{
                fontSize: '22px',
                marginTop: '12px',
              }}
            >
              Prediction results
            </h2>

            <p
              style={{
                color: '#91a69a',
                fontSize: '13px',
              }}
            >
              Model response received for {form.station}.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                marginTop: '25px',
              }}
            >
              {resultCards.map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: '20px',
                    background: '#0b1913',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                  }}
                >
                  <div
                    style={{
                      color: '#82968c',
                      fontSize: '10px',
                      letterSpacing: '1px',
                    }}
                  >
                    {item.label}
                  </div>

                  <div
                    style={{
                      color: '#00ff9d',
                      fontSize: '25px',
                      fontWeight: 700,
                      marginTop: '13px',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.value ?? '—'}
                  </div>

                  <small style={{ color: '#82968c' }}>
                    {item.unit}
                  </small>
                </div>
              ))}
            </div>

            {/* INPUT SUMMARY */}
            <div
              style={{
                marginTop: '20px',
                padding: '17px',
                background: 'rgba(0,255,157,0.05)',
                borderRadius: '9px',
              }}
            >
              <strong style={{ fontSize: '13px' }}>
                Input summary
              </strong>

              <div
                style={{
                  marginTop: '12px',
                  color: '#a9bbb0',
                  fontSize: '12px',
                  lineHeight: 2,
                }}
              >
                <div>Station: {form.station}</div>
                <div>Rainfall: {form.rainfall} mm</div>
                <div>Temperature: {form.temperature} °C</div>
                <div>Catchment area: {form.catchmentArea} km²</div>
                <div>Elevation: {form.elevation} m</div>
                <div>Catchment slope: {form.slope}°</div>
              </div>
            </div>

            {/* FEATURE IMPORTANCE */}
            {result.featureImportance && (
              <div style={{ marginTop: '22px' }}>
                <h3
                  style={{
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                  }}
                >
                  <TrendingUp size={17} color="#00ff9d" />
                  Model feature importance
                </h3>

                {Object.entries(result.featureImportance).map(
                  ([name, value]) => (
                    <div key={name} style={{ marginTop: '13px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          marginBottom: '6px',
                          color: '#a9bbb0',
                        }}
                      >
                        <span>{name}</span>
                        <span>{value}%</span>
                      </div>

                      <div
                        style={{
                          height: '6px',
                          background: '#17251e',
                          borderRadius: '10px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.max(0, Math.min(100, value))}%`,
                            height: '100%',
                            background: '#00ff9d',
                            borderRadius: '10px',
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            <p
              style={{
                color: '#e6bd75',
                fontSize: '11px',
                lineHeight: 1.6,
                marginTop: '20px',
              }}
            >
              This is a model-generated estimate, not an official
              flood warning. Follow relevant local authority advisories.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}

export default Prediction
