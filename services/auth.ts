import { apiFetch } from "./api"

interface LoginResponse {
  data: {
    token: string
    user?: {
      id?: string
      email?: string
      name?: string
      [key: string]: any
    }
  }
}

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiFetch("/v2/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
    })
    return response.data
  },

  getCurrentUser: async () => {
    const response = await apiFetch("/auth/me", {
      method: "GET",
    })
    return response.data
  },
}
