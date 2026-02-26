import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { Layout } from "./components/Layout"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { ErrorBoundary } from "./components/ErrorBoundary"
import { SignalRProvider } from "./contexts/SignalRContext"

// Pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Setup from "./pages/Setup"
import SessionRoom from "./pages/SessionRoom"
import History from "./pages/History"
import NotFound from "./pages/NotFound"

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            element={
              <ProtectedRoute>
                <SignalRProvider>
                  <Layout />
                </SignalRProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/setup"
              element={<Navigate to="/dashboard" replace />}
            />
            <Route path="/sessions/:sessionId/setup" element={<Setup />} />
            <Route path="/sessions/create" element={<Setup />} />
            <Route path="/sessions/:sessionId" element={<SessionRoom />} />
            <Route path="/history" element={<History />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </ErrorBoundary>
  )
}

export default App
