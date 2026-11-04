
import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import './Globe.css'

interface Location {
  latitude: number
  longitude: number
}

export interface MonitoringStation {
  stationId: string
  name: string
  river: string
  basin: string
  latitude: number
  longitude: number
  status: string
}

type MapLayer = 'Stations' | 'Rainfall' | 'Risk zones'

interface EarthGlobeProps {
  onLocationSelect?: (location: Location) => void
  onStationSelect?: (station: MonitoringStation) => void
  flyToLocation?: Location | null
  activeLayer?: MapLayer
  showStations?: boolean
}

export const demoStations: MonitoringStation[] = [
  {
    stationId: 'DEMO-001',
    name: 'Ganga Demo Station',
    river: 'Ganga',
    basin: 'Ganga Basin',
    latitude: 25.3176,
    longitude: 83.0068,
    status: 'DEMO DATA',
  },
  {
    stationId: 'DEMO-002',
    name: 'Brahmaputra Demo Station',
    river: 'Brahmaputra',
    basin: 'Brahmaputra Basin',
    latitude: 26.1445,
    longitude: 91.7362,
    status: 'DEMO DATA',
  },
  {
    stationId: 'DEMO-003',
    name: 'Cauvery Demo Station',
    river: 'Cauvery',
    basin: 'Cauvery Basin',
    latitude: 11.0168,
    longitude: 76.9558,
    status: 'DEMO DATA',
  },
]

function EarthGlobe({
  onLocationSelect,
  onStationSelect,
  flyToLocation,
  activeLayer = 'Stations',
  showStations = true,
}: EarthGlobeProps) {
  const globeRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Cesium.Viewer | null>(null)

  const selectedMarkerRef = useRef<Cesium.Entity | null>(null)
  const stationEntitiesRef = useRef<Cesium.Entity[]>([])
  const riskZoneEntitiesRef = useRef<Cesium.Entity[]>([])

  const locationCallbackRef = useRef(onLocationSelect)
  const stationCallbackRef = useRef(onStationSelect)
  const showStationsRef = useRef(showStations)

  // Keep callbacks and visibility settings updated.
  useEffect(() => {
    locationCallbackRef.current = onLocationSelect
    stationCallbackRef.current = onStationSelect
    showStationsRef.current = showStations
  }, [onLocationSelect, onStationSelect, showStations])

  // Fly to searched location.
  useEffect(() => {
    const viewer = viewerRef.current
    const marker = selectedMarkerRef.current

    if (!viewer || viewer.isDestroyed() || !flyToLocation) {
      return
    }

    if (marker) {
      marker.position = Cesium.Cartesian3.fromDegrees(
        flyToLocation.longitude,
        flyToLocation.latitude,
      )
    }

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        flyToLocation.longitude,
        flyToLocation.latitude,
        1500000,
      ),
      duration: 2,
    })
  }, [flyToLocation])

  // Show and hide map layers and station markers.
  useEffect(() => {
    stationEntitiesRef.current.forEach((entity) => {
      entity.show = showStations && activeLayer === 'Stations'
    })

    riskZoneEntitiesRef.current.forEach((entity) => {
      entity.show = activeLayer === 'Risk zones'
    })
  }, [activeLayer, showStations])

  // Initialize globe.
  useEffect(() => {
    if (!globeRef.current) return

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN

    if (token) {
      Cesium.Ion.defaultAccessToken = token
    }

    const viewer = new Cesium.Viewer(globeRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      shouldAnimate: true,
    })

    viewerRef.current = viewer

    let isMounted = true
    let isDragging = false

    const canvas = viewer.scene.canvas

    // Keyboard navigation.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        [
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
        ].includes(event.key)
      ) {
        event.preventDefault()
      }

      switch (event.key) {
        case 'ArrowLeft':
          viewer.camera.rotateLeft(0.08)
          break
        case 'ArrowRight':
          viewer.camera.rotateRight(0.08)
          break
        case 'ArrowUp':
          viewer.camera.rotateUp(0.08)
          break
        case 'ArrowDown':
          viewer.camera.rotateDown(0.08)
          break
        case '+':
        case '=':
          viewer.camera.zoomIn(500000)
          break
        case '-':
          viewer.camera.zoomOut(500000)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Globe appearance.
    viewer.scene.backgroundColor =
      Cesium.Color.fromCssColorString('#020806')

    viewer.scene.globe.enableLighting = true
    viewer.scene.globe.showGroundAtmosphere = true
    viewer.scene.skyAtmosphere.show = true

    // Load Earth imagery.
    const loadEarth = async () => {
      try {
        const imagery =
          await Cesium.IonImageryProvider.fromAssetId(3845)

        if (isMounted && !viewer.isDestroyed()) {
          viewer.imageryLayers.removeAll()

          const layer =
            viewer.imageryLayers.addImageryProvider(imagery)

          layer.brightness = 1.08
          layer.contrast = 1.12
          layer.saturation = 1.25
          layer.gamma = 0.95
        }
      } catch (error) {
        console.error('Earth imagery failed to load:', error)
      }
    }

    void loadEarth()

    // Initial globe position.
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        15,
        20,
        18000000,
      ),
    })

    // Selected location marker.
    const selectedMarker = viewer.entities.add({
      name: 'Selected location',
      point: {
        pixelSize: 13,
        color: Cesium.Color.fromCssColorString('#00FF9D'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    })

    selectedMarkerRef.current = selectedMarker

    // Add demo monitoring stations.
    const stationEntities = demoStations.map((station) => {
      return viewer.entities.add({
        id: `floodcast-station-${station.stationId}`,
        name: station.name,

        position: Cesium.Cartesian3.fromDegrees(
          station.longitude,
          station.latitude,
        ),

        show: showStationsRef.current && activeLayer === 'Stations',

        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#00FF9D'),
          outlineColor: Cesium.Color.fromCssColorString('#C8FFE3'),
          outlineWidth: 3,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },

        label: {
          text: station.name,
          font: '11px DM Sans',
          fillColor: Cesium.Color.fromCssColorString('#C8FFE3'),
          outlineColor: Cesium.Color.fromCssColorString('#020806'),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -22),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          distanceDisplayCondition:
            new Cesium.DistanceDisplayCondition(0, 20000000),
        },
      })
    })

    stationEntitiesRef.current = stationEntities

    // Illustrative flood risk zones - demo data only.
    const demoRiskZones = [
      {
        id: 'risk-high',
        name: 'High Risk Zone (Demo)',
        coordinates: [
          [77.45, 13.15],
          [77.65, 13.15],
          [77.65, 13.30],
          [77.45, 13.30],
        ],
        color: Cesium.Color.RED.withAlpha(0.35),
      },
      {
        id: 'risk-moderate',
        name: 'Moderate Risk Zone (Demo)',
        coordinates: [
          [77.65, 13.15],
          [77.85, 13.15],
          [77.85, 13.30],
          [77.65, 13.30],
        ],
        color: Cesium.Color.ORANGE.withAlpha(0.30),
      },
      {
        id: 'risk-low',
        name: 'Low Risk Zone (Demo)',
        coordinates: [
          [77.45, 13.30],
          [77.65, 13.30],
          [77.65, 13.45],
          [77.45, 13.45],
        ],
        color: Cesium.Color.LIME.withAlpha(0.25),
      },
    ]

    const riskZoneEntities = demoRiskZones.map((zone) => {
      const positions = zone.coordinates.flatMap(
        ([longitude, latitude]) => [longitude, latitude],
      )

      return viewer.entities.add({
        id: zone.id,
        name: zone.name,

        show: activeLayer === 'Risk zones',

        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
          material: zone.color,
          outline: true,
          outlineColor: zone.color.withAlpha(0.9),
          height: 0,
        },
      })
    })

    riskZoneEntitiesRef.current = riskZoneEntities

    // Extract entity ID from Cesium pick results.
    const getPickedId = (value: unknown): string | undefined => {
      if (typeof value === 'string') {
        return value
      }

      if (
        value !== null &&
        typeof value === 'object' &&
        'id' in value &&
        typeof value.id === 'string'
      ) {
        return value.id
      }

      return undefined
    }

    // Handle globe and station clicks.
    const handler = new Cesium.ScreenSpaceEventHandler(canvas)

    handler.setInputAction(
      (movement: { position: Cesium.Cartesian2 }) => {
        const pickedObjects = viewer.scene.drillPick(
          movement.position,
        ) as Array<{
          id?: unknown
          primitive?: { id?: unknown }
        }>

        let clickedStation: MonitoringStation | undefined

        if (showStationsRef.current) {
          for (const picked of pickedObjects) {
            const entityId =
              getPickedId(picked.id) ??
              getPickedId(picked.primitive?.id)

            if (!entityId) continue

            const stationId = entityId.startsWith(
              'floodcast-station-',
            )
              ? entityId.replace('floodcast-station-', '')
              : null

            if (!stationId) continue

            clickedStation = demoStations.find(
              (station) => station.stationId === stationId,
            )

            if (clickedStation) break
          }
        }

        if (clickedStation) {
          const station = clickedStation

          selectedMarker.position =
            Cesium.Cartesian3.fromDegrees(
              station.longitude,
              station.latitude,
            )

          stationCallbackRef.current?.(station)

          locationCallbackRef.current?.({
            latitude: station.latitude,
            longitude: station.longitude,
          })

          return
        }

        // Select ordinary globe coordinates.
        const position = viewer.camera.pickEllipsoid(
          movement.position,
          viewer.scene.globe.ellipsoid,
        )

        if (!position) return

        const coordinates =
          Cesium.Cartographic.fromCartesian(position)

        const latitude = Cesium.Math.toDegrees(
          coordinates.latitude,
        )

        const longitude = Cesium.Math.toDegrees(
          coordinates.longitude,
        )

        selectedMarker.position = position

        locationCallbackRef.current?.({
          latitude,
          longitude,
        })
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK,
    )

    // Pause rotation during mouse interaction.
    const startDrag = () => {
      isDragging = true
    }

    const endDrag = () => {
      isDragging = false
    }

    canvas.addEventListener('pointerdown', startDrag)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)

    // Automatic globe rotation.
    let previousTime = Cesium.JulianDate.clone(
      viewer.clock.currentTime,
    )

    const removeRotation =
      viewer.clock.onTick.addEventListener((clock) => {
        const currentTime = clock.currentTime

        const delta = Cesium.JulianDate.secondsDifference(
          currentTime,
          previousTime,
        )

        previousTime = Cesium.JulianDate.clone(currentTime)

        if (!isDragging && delta > 0 && delta < 1) {
          viewer.camera.rotate(
            Cesium.Cartesian3.UNIT_Z,
            -delta * 0.002,
          )
        }
      })

    viewer.clock.shouldAnimate = true

    // Cleanup.
    return () => {
      isMounted = false

      window.removeEventListener('keydown', handleKeyDown)
      canvas.removeEventListener('pointerdown', startDrag)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)

      handler.destroy()
      removeRotation()

      if (viewerRef.current === viewer) {
        viewerRef.current = null
        selectedMarkerRef.current = null
        stationEntitiesRef.current = []
        riskZoneEntitiesRef.current = []
      }

      if (!viewer.isDestroyed()) {
        viewer.destroy()
      }
    }
  }, [])

  const layerMessage =
    activeLayer === 'Rainfall'
      ? 'RAINFALL DATA NOT CONNECTED'
      : activeLayer === 'Risk zones'
        ? 'ILLUSTRATIVE RISK ZONES — DEMO DATA'
        : null

  return (
    <div className="globe-stage">
      <div className="orbit orbit-one">
        <span className="orbit-dot" />
      </div>

      <div className="orbit orbit-two">
        <span className="orbit-dot" />
      </div>

      <div className="earth-globe" ref={globeRef} />

      {layerMessage && (
        <div
          style={{
            position: 'absolute',
            top: 18,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid rgba(0,255,157,0.25)',
            background: 'rgba(2,12,8,0.88)',
            color: '#A8C7B7',
            fontSize: 10,
            letterSpacing: '1.2px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          {layerMessage}
        </div>
      )}
    </div>
  )
}

export default EarthGlobe
