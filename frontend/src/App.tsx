
import { useEffect, useState, type FormEvent } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  CloudRain,
  Layers,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Waves,
  Wind,
  X,
} from 'lucide-react'

import Login from './pages/Login'
import Register from './pages/Register'
import Prediction from './pages/Prediction'

import WeatherPanel from './components/WeatherPanel'
import DischargePanel from './components/DischargePanel'
import FloodRiskPanel from './components/FloodRiskPanel'
import FloodAlertsPanel from './components/FloodAlertsPanel'
import FeatureImportancePanel from './components/FeatureImportancePanel'
import SystemHealthPanel from './components/SystemHealthPanel'

import EarthGlobe, {
  demoStations,
  type MonitoringStation,
} from './components/Globe/EarthGlobe'

import { checkBackendHealth } from './services/healthApi'

import './styles/dashboard.css'

type Page = 'login' | 'register' | 'dashboard' | 'prediction'
type MapLayer = 'Stations' | 'Rainfall' | 'Risk zones'
type BackendStatus = 'checking' | 'connected' | 'offline'

interface Location {
  latitude: number
  longitude: number
}

interface SearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

function formatCoordinate(
  value: number,
  type: 'latitude' | 'longitude'
) {
  const direction =
    type === 'latitude'
      ? value >= 0 ? 'N' : 'S'
      : value >= 0 ? 'E' : 'W'

  return `${Math.abs(value).toFixed(4)}° ${direction}`
}

function calculateDistance(first: Location, second: Location) {
  const earthRadius = 6371
  const toRadians = (degrees: number) => degrees * Math.PI / 180

  const latitudeDifference = toRadians(
    second.latitude - first.latitude
  )

  const longitudeDifference = toRadians(
    second.longitude - first.longitude
  )

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(first.latitude)) *
      Math.cos(toRadians(second.latitude)) *
      Math.sin(longitudeDifference / 2) ** 2

  return earthRadius * 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  )
}

function formatDistance(distance: number) {
  return distance < 1
    ? `${Math.round(distance * 1000)} m`
    : `${distance.toFixed(1)} km`
}

function Dashboard({
  onLogout,
  onNavigate,
  onUseStation,
}: {
  onLogout: () => void
  onNavigate: (page: Page) => void
  onUseStation: (station: MonitoringStation) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  const [activeLayer, setActiveLayer] =
    useState<MapLayer>('Stations')

  const [backendStatus, setBackendStatus] =
    useState<BackendStatus>('checking')

  // Check backend immediately and every 15 seconds.
  useEffect(() => {
    let active = true

    const updateBackendStatus = async () => {
      const result = await checkBackendHealth()

      if (active) {
        setBackendStatus(
          result.status === 'ok' ? 'connected' : 'offline'
        )
      }
    }

    updateBackendStatus()

    const interval = window.setInterval(
      updateBackendStatus,
      15000
    )

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  const [selectedLocation, setSelectedLocation] =
    useState<Location>({
      latitude: 12.9716,
      longitude: 77.5946,
    })

  const [selectedStation, setSelectedStation] =
    useState<MonitoringStation | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] =
    useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [flyToLocation, setFlyToLocation] =
    useState<Location | null>(null)

  const handleSearch = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const query = searchQuery.trim()

    if (!query) {
      setSearchError('Enter a city, river, or location.')
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    setSearchError('')
    setSearchResults([])

    try {
      const url = new URL(
        'https://nominatim.openstreetmap.org/search'
      )

      url.searchParams.set('format', 'jsonv2')
      url.searchParams.set('q', query)
      url.searchParams.set('limit', '5')

      const response = await fetch(url.toString())

      if (!response.ok) {
        throw new Error(
          'Location search is temporarily unavailable.'
        )
      }

      const results: SearchResult[] = await response.json()

      if (results.length === 0) {
        setSearchError(
          'No locations found. Try another search.'
        )
      } else {
        setSearchResults(results)
      }
    } catch (error) {
      console.error('Location search failed:', error)

      setSearchError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchResultSelect = (result: SearchResult) => {
    const location: Location = {
      latitude: Number(result.lat),
      longitude: Number(result.lon),
    }

    setSelectedLocation(location)
    setSelectedStation(null)
    setFlyToLocation(location)
    setSearchQuery(result.display_name)
    setSearchResults([])
    setSearchError('')
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    setSelectedStation(null)
  }

  const handleStationSelect = (
    station: MonitoringStation
  ) => {
    const location: Location = {
      latitude: station.latitude,
      longitude: station.longitude,
    }

    setSelectedStation(station)
    setSelectedLocation(location)
    setFlyToLocation(location)
  }

  const activeStation =
    selectedStation &&
    selectedStation.latitude === selectedLocation.latitude &&
    selectedStation.longitude === selectedLocation.longitude
      ? selectedStation
      : null

  const nearbyStations = demoStations
    .map((station) => ({
      station,
      distance: calculateDistance(selectedLocation, {
        latitude: station.latitude,
        longitude: station.longitude,
      }),
    }))
    .sort((a, b) => a.distance - b.distance)

  const menuItems: {
    label: string
    action: () => void
  }[] = [
    {
      label: 'Dashboard',
      action: () => onNavigate('dashboard'),
    },
    {
      label: 'Flood prediction',
      action: () => onNavigate('prediction'),
    },
    {
      label: 'Monitoring stations',
      action: () => setActiveLayer('Stations'),
    },
    {
      label: 'Rainfall layer',
      action: () => setActiveLayer('Rainfall'),
    },
    {
      label: 'Risk zones',
      action: () => setActiveLayer('Risk zones'),
    },
  ]

  return (
    <main className="dashboard">

      {/* HEADER */}
      <header className="dash-header">
        <div className="dash-brand">
          <div className="dash-brand-icon">
            <Waves size={22} />
          </div>

          <span>
            FLOODCAST<span className="brand-dot">.</span>
          </span>
        </div>

        <div className="header-center">
          <span className="system-dot" />
          GLOBAL FLOOD INTELLIGENCE
        </div>

        <div className="header-actions">
          <div
            className={`backend-status ${backendStatus}`}
            title={
              backendStatus === 'connected'
                ? 'Backend health check successful'
                : backendStatus === 'offline'
                  ? 'Could not reach the backend health endpoint'
                  : 'Checking backend connection'
            }
          >
            <span className="backend-status-dot" />

            <span>
              {backendStatus === 'checking'
                ? 'CHECKING'
                : backendStatus === 'connected'
                  ? 'BACKEND ONLINE'
                  : 'BACKEND OFFLINE'}
            </span>
          </div>

          <button
            className="icon-button"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          <button
            className="icon-button menu-button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen((previous) => !previous)
            }
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            className="logout-button"
            onClick={onLogout}
          >
            Sign out
          </button>
        </div>

        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '65px',
              right: '20px',
              zIndex: 99999,
              width: '240px',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: '5px',
              backgroundColor: '#091812',
              border: '1px solid rgba(0,255,157,0.2)',
              borderRadius: '12px',
              boxShadow: '0 18px 40px rgba(0,0,0,0.5)',
            }}
          >
            {menuItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  item.action()
                  setMenuOpen(false)
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '42px',
                  margin: 0,
                  padding: '0 14px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '7px',
                  color: '#d3e1d9',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor =
                    'rgba(0,255,157,0.1)'

                  event.currentTarget.style.color = '#00ff9d'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor =
                    'transparent'

                  event.currentTarget.style.color = '#d3e1d9'
                }}
              >
                {item.label}
              </button>
            ))}

            <div
              style={{
                width: '100%',
                marginTop: '7px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onLogout()
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '42px',
                  padding: '0 14px',
                  background: 'transparent',
                  border: 'none',
                  color: '#ff8b8b',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* WELCOME */}
      <section className="dash-welcome">
        <div>
          <div className="section-eyebrow">
            MONITORING OVERVIEW / 01
          </div>

          <h1>
            See the surge <span>before it happens.</span>
          </h1>

          <p>
            Global river intelligence. Predictive flood monitoring.
          </p>
        </div>

        <div className="demo-status">
          <span className="system-dot" />
          DEMO ENVIRONMENT
        </div>
      </section>

      {/* METRICS */}
      <section className="metric-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span>MONITORING STATIONS</span>
            <MapPin size={18} />
          </div>

          <strong>03</strong>
          <small>Illustrative demo stations</small>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>RIVER DISCHARGE</span>
            <Waves size={18} />
          </div>

          <strong>—</strong>
          <small>Waiting for model data</small>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>FLOOD RISK</span>
            <AlertTriangle size={18} />
          </div>

          <strong className="neutral-value">
            UNASSESSED
          </strong>

          <small>No prediction available yet</small>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>WEATHER INPUT</span>
            <CloudRain size={18} />
          </div>

          <strong>—</strong>
          <small>Waiting for weather data</small>
        </article>
      </section>

      {/* MAIN DASHBOARD */}
      <section className="dashboard-main">
        <div className="globe-panel">
          <div className="panel-heading">
            <div>
              <div className="section-eyebrow">
                GEOSPATIAL INTELLIGENCE
              </div>

              <h2>Global monitoring map</h2>
            </div>

            <span className="live-tag">
              ● SYSTEM READY
            </span>
          </div>

          {/* MAP TOOLBAR */}
          <div className="map-toolbar">
            <div
              style={{
                position: 'relative',
                flex: 1,
                minWidth: 0,
                zIndex: 20,
              }}
            >
              <form
                className="map-search"
                onSubmit={handleSearch}
              >
                <Search size={16} />

                <input
                  placeholder="Search a city, river, or location..."
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setSearchError('')
                    setSearchResults([])
                  }}
                />

                <button
                  type="submit"
                  disabled={searchLoading}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#00FF9D',
                    cursor: searchLoading ? 'wait' : 'pointer',
                    fontSize: '12px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    padding: '6px 10px',
                  }}
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </button>
              </form>

              {(searchResults.length > 0 || searchError) && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    background: '#07130F',
                    border: '1px solid rgba(0,255,157,0.25)',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 35px rgba(0,0,0,0.45)',
                    zIndex: 100,
                  }}
                >
                  {searchError && (
                    <div
                      style={{
                        padding: '14px',
                        color: '#FF9999',
                        fontSize: '12px',
                      }}
                    >
                      {searchError}
                    </div>
                  )}

                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() =>
                        handleSearchResultSelect(result)
                      }
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '13px 14px',
                        textAlign: 'left',
                        color: '#D8E9E0',
                        background: 'transparent',
                        border: 'none',
                        borderBottom:
                          '1px solid rgba(255,255,255,0.06)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        lineHeight: 1.5,
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.background =
                          'rgba(0,255,157,0.08)'
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.background =
                          'transparent'
                      }}
                    >
                      <MapPin
                        size={15}
                        color="#00FF9D"
                        style={{ flexShrink: 0 }}
                      />

                      <span>{result.display_name}</span>
                    </button>
                  ))}

                  {searchResults.length > 0 && (
                    <div
                      style={{
                        padding: '8px 12px',
                        fontSize: '10px',
                        color: '#789087',
                      }}
                    >
                      Location data © OpenStreetMap contributors
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="layer-controls">
              <Layers size={16} />

              {(
                ['Stations', 'Rainfall', 'Risk zones'] as MapLayer[]
              ).map((layer) => (
                <button
                  key={layer}
                  className={
                    activeLayer === layer ? 'active-layer' : ''
                  }
                  onClick={() => setActiveLayer(layer)}
                >
                  {layer}
                </button>
              ))}
            </div>
          </div>

          {/* CESIUM GLOBE */}
          <div className="dashboard-globe">
            <EarthGlobe
              onLocationSelect={handleLocationSelect}
              onStationSelect={handleStationSelect}
              flyToLocation={flyToLocation}
              activeLayer={activeLayer}
            />

            <div className="map-caption">
              <span>GLOBAL VIEW</span>

              <span>
                {formatCoordinate(
                  selectedLocation.latitude,
                  'latitude'
                )}
                {' · '}
                {formatCoordinate(
                  selectedLocation.longitude,
                  'longitude'
                )}
              </span>
            </div>
          </div>

          {/* MAP LEGEND */}
          <div className="map-legend">
            <span>
              <i className="legend-station" />
              Monitoring station
            </span>

            <span>
              <i className="legend-risk" />
              Risk overlay — demo
            </span>

            <span>
              <i className="legend-selected" />
              Selected location
            </span>
          </div>
        </div>

        {/* RIGHT-SIDE INTELLIGENCE PANEL */}
        <aside className="side-panel">
          <div className="panel-heading">
            <div>
              <div className="section-eyebrow">
                LOCATION INTELLIGENCE
              </div>

              <h2>
                {activeStation
                  ? 'Selected station'
                  : 'Selected location'}
              </h2>
            </div>

            <MapPin size={19} />
          </div>

          {/* LOCATION DETAILS */}
          <div className="location-card">
            <span className="location-country">
              {activeStation
                ? 'INDIA · DEMO STATION'
                : 'SELECTED COORDINATES'}
            </span>

            <h3>
              {activeStation
                ? activeStation.name
                : 'Map location'}
            </h3>

            <p>
              {activeStation
                ? `${activeStation.river} · ${activeStation.basin}`
                : 'No monitoring station selected'}
            </p>

            {activeStation && (
              <div className="coordinate-row">
                <span>STATION ID</span>
                <strong>{activeStation.stationId}</strong>
              </div>
            )}

            <div className="coordinate-row">
              <span>LATITUDE</span>

              <strong>
                {formatCoordinate(
                  selectedLocation.latitude,
                  'latitude'
                )}
              </strong>
            </div>

            <div className="coordinate-row">
              <span>LONGITUDE</span>

              <strong>
                {formatCoordinate(
                  selectedLocation.longitude,
                  'longitude'
                )}
              </strong>
            </div>

            {activeStation && (
              <button
                type="button"
                onClick={() => onUseStation(activeStation)}
                style={{
                  width: '100%',
                  marginTop: '18px',
                  padding: '13px',
                  background: '#00ff9d',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#031009',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                USE STATION FOR PREDICTION →
              </button>
            )}
          </div>

          {/* STATION COVERAGE */}
          <div className="station-status">
            <div className="station-heading">
              <Activity size={17} />
              <strong>Station coverage</strong>
            </div>

            <span className="coverage-badge">
              {activeStation
                ? activeStation.status
                : 'DEMO STATIONS ONLY'}
            </span>

            <p>
              {activeStation
                ? 'Illustrative station marker selected. Live observations and verified coverage are not connected yet.'
                : 'Nearby results below show distances to illustrative demo stations, not verified monitoring coverage.'}
            </p>
          </div>

          {/* NEARBY STATIONS */}
          <div className="prediction-card nearby-stations-card">
            <div className="station-heading">
              <MapPin size={17} />
              <strong>Nearby stations</strong>
            </div>

            <div
              style={{
                margin: '8px 0 14px',
                color: '#82968C',
                fontSize: '11px',
                lineHeight: 1.5,
              }}
            >
              Ranked by distance from the selected coordinates
            </div>

            {nearbyStations.map(({ station, distance }, index) => {
              const isSelected =
                activeStation?.stationId === station.stationId

              return (
                <button
                  key={station.stationId}
                  type="button"
                  onClick={() => handleStationSelect(station)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '12px 10px',
                    marginBottom: '7px',
                    textAlign: 'left',
                    color: '#D8E9E0',
                    background: isSelected
                      ? 'rgba(0,255,157,0.10)'
                      : 'rgba(255,255,255,0.025)',
                    border: isSelected
                      ? '1px solid rgba(0,255,157,0.45)'
                      : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      width: '27px',
                      height: '27px',
                      borderRadius: '50%',
                      background: 'rgba(0,255,157,0.10)',
                      color: '#00FF9D',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </span>

                  <span style={{ flex: 1, minWidth: 0 }}>
                    <strong
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 600,
                        lineHeight: 1.5,
                      }}
                    >
                      {station.name}
                    </strong>

                    <small
                      style={{
                        display: 'block',
                        marginTop: '3px',
                        color: '#82968C',
                        fontSize: '10px',
                      }}
                    >
                      {station.river} · {station.status}
                    </small>
                  </span>

                  <span
                    style={{
                      flexShrink: 0,
                      color: '#00FF9D',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    {formatDistance(distance)}
                  </span>
                </button>
              )
            })}

            <small
              style={{
                display: 'block',
                marginTop: '10px',
                color: '#82968C',
                fontSize: '10px',
                lineHeight: 1.5,
              }}
            >
              Straight-line distance · Illustrative demo dataset
            </small>
          </div>

          {/* CATCHMENT PROFILE */}
          <div className="prediction-card">
            <div className="station-heading">
              <Waves size={17} />
              <strong>Catchment profile</strong>
            </div>

            {activeStation ? (
              <>
                <div className="coordinate-row">
                  <span>RIVER</span>
                  <strong>{activeStation.river}</strong>
                </div>

                <div className="coordinate-row">
                  <span>BASIN</span>
                  <strong>{activeStation.basin}</strong>
                </div>

                <div className="coordinate-row">
                  <span>CATCHMENT AREA</span>
                  <strong>Awaiting dataset</strong>
                </div>

                <div className="coordinate-row">
                  <span>ELEVATION</span>
                  <strong>Awaiting dataset</strong>
                </div>

                <div className="coordinate-row">
                  <span>LAND COVER</span>
                  <strong>Awaiting dataset</strong>
                </div>

                <div className="coordinate-row">
                  <span>SOIL CHARACTERISTICS</span>
                  <strong>Awaiting dataset</strong>
                </div>

                <small
                  style={{
                    display: 'block',
                    marginTop: '12px',
                    color: '#82968C',
                    fontSize: '11px',
                    lineHeight: 1.6,
                  }}
                >
                  Catchment attributes will be populated from the
                  connected geospatial dataset.
                </small>
              </>
            ) : (
              <div className="prediction-empty">
                <MapPin size={23} />

                <span>No catchment selected</span>

                <small>
                  Select a monitoring station to inspect its
                  catchment characteristics.
                </small>
              </div>
            )}
          </div>

          {/* PREDICTION STATUS */}
          <div className="prediction-card">
            <div className="station-heading">
              <ShieldCheck size={17} />
              <strong>Prediction status</strong>
            </div>

            <div className="prediction-empty">
              <Wind size={23} />

              <span>Awaiting model output</span>

              <small>
                Discharge and flood severity will appear here when
                the prediction API is connected.
              </small>
            </div>
          </div>
        </aside>
      </section>

      {/* BOTTOM ANALYTICS */}
      <section className="bottom-grid">
        <DischargePanel />
        <FloodAlertsPanel />
        <WeatherPanel />
        <FloodRiskPanel />
        <FeatureImportancePanel />
        <SystemHealthPanel backendStatus={backendStatus} />
      </section>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <span>FLOODCAST © 2026</span>
        <span>PREDICT · PREPARE · PROTECT</span>
        <span>DEMO DATA — NOT FOR EMERGENCY USE</span>
      </footer>
    </main>
  )
}

function App() {
  const [page, setPage] = useState<Page>('login')

  const [stationForPrediction, setStationForPrediction] =
    useState<MonitoringStation | null>(null)

  if (page === 'register') {
    return <Register onSignIn={() => setPage('login')} />
  }

  if (page === 'prediction') {
    return (
      <Prediction
        onBack={() => setPage('dashboard')}
        initialStation={stationForPrediction?.name ?? ''}
      />
    )
  }

  if (page === 'dashboard') {
    return (
      <Dashboard
        onLogout={() => {
          setStationForPrediction(null)
          setPage('login')
        }}
        onNavigate={setPage}
        onUseStation={(station) => {
          setStationForPrediction(station)
          setPage('prediction')
        }}
      />
    )
  }

  return (
    <Login
      onAccess={() => setPage('dashboard')}
      onCreateAccount={() => setPage('register')}
    />
  )
}

export default App
