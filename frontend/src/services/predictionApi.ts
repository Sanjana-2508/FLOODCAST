
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface PredictionInput {
  station: string
  rainfall: number
  temperature: number
  catchmentArea: number
  elevation: number
  slope: number
}

export interface PredictionResult {
  predictedDischarge: number
  floodSeverity: 'Low' | 'Moderate' | 'High' | 'Severe'
  expectedPeak: number
  confidence: number
  featureImportance?: {
    rainfall?: number
    temperature?: number
    catchmentArea?: number
    elevation?: number
    slope?: number
  }
}

export async function getPrediction(
  input: PredictionInput,
): Promise<PredictionResult> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
  } catch {
    throw new Error(
      'Cannot connect to the prediction server. Please check whether the backend is running.',
    )
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        data?.message ||
        `Prediction failed. Server returned ${response.status}.`,
    )
  }

  if (!data) {
    throw new Error('The server returned an invalid response.')
  }

  return data as PredictionResult
}
