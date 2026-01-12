// This module provides a centralized fetch wrapper with automatic header injection

const API_BASE_URL = "https://staging-nextshop-backend.prospectbdltd.com/api"
const TENANT_ID = "nextshop"

interface FetchOptions extends RequestInit {
  body?: any
}

export const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const url = `${API_BASE_URL}${endpoint}`

  // Get auth token from localStorage
  const token = localStorage.getItem("authToken")

  // Build headers with required X-Tenant and optional Authorization
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Tenant": TENANT_ID,
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Serialize body if it's an object
  const config: RequestInit = {
    ...options,
    headers,
  }

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, config)

  // Handle 401 errors by clearing auth and redirecting to login
  if (response.status === 401) {
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  // Parse response
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || "API request failed")
    throw error
  }

  return data
}

export const apiClient = apiFetch
export default apiFetch
