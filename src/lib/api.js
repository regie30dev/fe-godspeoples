import axios from 'axios'

// Base URL for the GodsPeoples backend API.
// Configure via VITE_API_BASE_URL in your .env file.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach an auth token (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize errors so callers get a predictable shape.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      'Something went wrong'
    return Promise.reject(new Error(message))
  },
)
