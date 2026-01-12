"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useEffect, useState } from "react"
import { apiFetch } from "@/services/api"

interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  [key: string]: any
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchClients = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiFetch("/clients", { method: "GET" })
        setClients(response.data || response || [])
      } catch (err: any) {
        setError(err.message || "Failed to load clients")
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <header
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "20px",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "28px" }}>Dashboard</h1>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "white",
              color: "#007bff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "4px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "40px 20px", width: "100%" }}>
        {/* User Info Section */}
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            marginBottom: "30px",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#333" }}>Welcome!</h2>
          {user && (
            <div style={{ marginTop: "20px" }}>
              <p style={{ margin: "10px 0", color: "#666" }}>
                <strong>Name:</strong> {(user as any).name || "N/A"}
              </p>
              <p style={{ margin: "10px 0", color: "#666" }}>
                <strong>Email:</strong> {(user as any).email || "N/A"}
              </p>
            </div>
          )}
        </div>

        {/* Clients Data Section */}
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#333" }}>Clients</h3>

          {isLoading && <p style={{ color: "#666", fontSize: "14px" }}>Loading clients...</p>}

          {error && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "20px",
                fontSize: "14px",
                border: "1px solid #f5c6cb",
              }}
            >
              {error}
            </div>
          )}

          {!isLoading && clients.length === 0 && !error && (
            <p style={{ color: "#999", fontSize: "14px" }}>No clients found.</p>
          )}

          {/* Clients Table */}
          {!isLoading && clients.length > 0 && (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "2px solid #ddd" }}>
                  <th style={{ textAlign: "left", padding: "12px", color: "#333", fontWeight: 600 }}>Name</th>
                  <th style={{ textAlign: "left", padding: "12px", color: "#333", fontWeight: 600 }}>Email</th>
                  <th style={{ textAlign: "left", padding: "12px", color: "#333", fontWeight: 600 }}>Phone</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px", color: "#666", fontSize: "14px" }}>{client.name}</td>
                    <td style={{ padding: "12px", color: "#666", fontSize: "14px" }}>{client.email || "N/A"}</td>
                    <td style={{ padding: "12px", color: "#666", fontSize: "14px" }}>{client.phone || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
