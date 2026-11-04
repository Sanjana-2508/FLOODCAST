
import {
  Activity,
  MapPin,
  Waves,
  Mountain,
  X,
  ArrowUpRight,
  Radio,
} from 'lucide-react'

import type { MonitoringStation } from './Globe/EarthGlobe'

interface StationDetailsPanelProps {
  station: MonitoringStation
  distance?: number | null
  onClose: () => void
  onUseStation: (station: MonitoringStation) => void
}

export default function StationDetailsPanel({
  station,
  distance,
  onClose,
  onUseStation,
}: StationDetailsPanelProps) {
  const status = station.status || 'Unknown'
  const isActive = status.toLowerCase() === 'active'

  const details = [
    { label: 'Station ID', value: station.stationId || 'N/A', icon: Radio },
    { label: 'River', value: station.river || 'N/A', icon: Waves },
    { label: 'Basin', value: station.basin || 'N/A', icon: Mountain },
    {
      label: 'Latitude',
      value: `${station.latitude.toFixed(4)}°`,
      icon: MapPin,
    },
    {
      label: 'Longitude',
      value: `${station.longitude.toFixed(4)}°`,
      icon: MapPin,
    },
    {
      label: 'Distance',
      value:
        distance == null
          ? 'Not calculated'
          : `${distance.toFixed(2)} km`,
      icon: Activity,
    },
  ]

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '390px',
        padding: '22px',
        background: '#07130F',
        border: '1px solid rgba(0,255,157,0.2)',
        borderRadius: '16px',
        color: '#E8F5ED',
        boxShadow: '0 15px 45px rgba(0,0,0,0.35)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <span
            style={{
              color: '#00FF9D',
              fontSize: '10px',
              letterSpacing: '2px',
              fontWeight: 700,
            }}
          >
            MONITORING STATION
          </span>

          <h2 style={{ fontSize: '21px', margin: '9px 0 5px' }}>
            {station.name}
          </h2>

          <span style={{ color: '#82968C', fontSize: '12px' }}>
            Station information
          </span>
        </div>

        <button
          onClick={onClose}
          aria-label="Close station details"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#A9BBB0',
            cursor: 'pointer',
          }}
        >
          <X size={19} />
        </button>
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '20px',
          padding: '8px 12px',
          borderRadius: '30px',
          background: isActive
            ? 'rgba(0,255,157,0.09)'
            : 'rgba(255,190,90,0.09)',
          color: isActive ? '#00FF9D' : '#E6BD75',
          fontSize: '11px',
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isActive ? '#00FF9D' : '#E6BD75',
          }}
        />
        {status}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginTop: '22px',
        }}
      >
        {details.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            style={{
              padding: '13px',
              background: '#0B1913',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '10px',
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#82968C',
                fontSize: '10px',
                marginBottom: '9px',
              }}
            >
              <Icon size={13} />
              {label}
            </div>

            <div
              style={{
                color: '#E8F5ED',
                fontSize: '13px',
                fontWeight: 600,
                overflowWrap: 'anywhere',
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onUseStation(station)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '9px',
          marginTop: '22px',
          padding: '14px',
          background: '#00FF9D',
          color: '#03110A',
          border: 'none',
          borderRadius: '9px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Use station for prediction
        <ArrowUpRight size={17} />
      </button>
    </section>
  )
}
