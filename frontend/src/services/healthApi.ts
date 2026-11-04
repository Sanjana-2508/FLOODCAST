
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export interface HealthStatus {
  status: 'ok' | 'error'
  message: string
}

export async function checkBackendHealth(): Promise<HealthStatus> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`)

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`)
    }

    const data = await response.json()

    return {
      status: 'ok',
      message: data.message || 'Backend connected successfully',
    }
  } catch {
    return {
      status: 'error',
      message: 'Backend unavailable',
    }
  }
}
