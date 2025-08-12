import { Routes, Route } from 'react-router-dom'
import { useAuth } from './services/authContext'
import { UpgradeProvider } from './contexts/UpgradeContext'
import { Loader2 } from 'lucide-react'

// Pages
import HomePage from './pages/HomePage'
import GeneratorPage from './pages/GeneratorPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import FavoritesPage from './pages/FavoritesPage'
import PricingPage from './pages/PricingPage'
import NewPricingPage from './pages/NewPricingPage'
import ContactSalesPage from './pages/ContactSalesPage'
import SuccessPage from './pages/SuccessPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import BrandSuitePage from './pages/BrandSuitePage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import Navbar from './components/NavBar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-night">
        <div className="text-center">
          <div className="w-16 h-16 bg-grad-surge rounded-xl flex items-center justify-center mx-auto mb-6 shadow-glow-blue">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <p className="text-body text-lg">Loading LaunchZone...</p>
        </div>
      </div>
    )
  }

  return (
    <UpgradeProvider>
      <div className="min-h-screen bg-night flex flex-col">
        <Navbar />
        
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/generate" element={<GeneratorPage />} />
            <Route path="/pricing" element={<NewPricingPage />} />
            <Route path="/contact-sales" element={<ContactSalesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/billing/success" element={<SuccessPage />} />
            
            {/* Private Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } />
            <Route path="/favorites" element={
              <PrivateRoute>
                <FavoritesPage />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/brand-suite" element={
              <PrivateRoute>
                <BrandSuitePage />
              </PrivateRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </UpgradeProvider>
  )
}

export default App