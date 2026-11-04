
import { Entity, PolygonGraphics } from 'resium'
import { Cartesian3, Color } from 'cesium'

interface RiskZone {
  name: string
  coordinates: [number, number][]
  risk: 'High' | 'Moderate' | 'Low'
}

const demoZones: RiskZone[] = [
  {
    name: 'High Risk Zone (Demo)',
    risk: 'High',
    coordinates: [
      [77.45, 13.15],
      [77.65, 13.15],
      [77.65, 13.30],
      [77.45, 13.30],
    ],
  },
  {
    name: 'Moderate Risk Zone (Demo)',
    risk: 'Moderate',
    coordinates: [
      [77.65, 13.15],
      [77.85, 13.15],
      [77.85, 13.30],
      [77.65, 13.30],
    ],
  },
  {
    name: 'Low Risk Zone (Demo)',
    risk: 'Low',
    coordinates: [
      [77.45, 13.30],
      [77.65, 13.30],
      [77.65, 13.45],
      [77.45, 13.45],
    ],
  },
]

const riskColors = {
  High: Color.RED.withAlpha(0.35),
  Moderate: Color.ORANGE.withAlpha(0.30),
  Low: Color.LIME.withAlpha(0.25),
}

export default function RiskZones() {
  return (
    <>
      {demoZones.map((zone) => (
        <Entity key={zone.name} name={zone.name}>
          <PolygonGraphics
            hierarchy={Cartesian3.fromDegreesArray(
              zone.coordinates.flatMap(([longitude, latitude]) => [
                longitude,
                latitude,
              ])
            )}
            material={riskColors[zone.risk]}
            outline
            outlineColor={riskColors[zone.risk].withAlpha(0.9)}
            height={0}
          />
        </Entity>
      ))}
    </>
  )
}
