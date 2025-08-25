import { Routes, Route } from 'react-router-dom'
import { useAuth } from './services/authContext'
import { UpgradeProvider } from './contexts/UpgradeContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

// Pages
import HomePage from './pages/HomePage'
import GeneratorPage from './pages/GeneratorPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import FavoritesPage from './pages/FavoritesPage'
import PricingPage from './pages/PricingPage'
import NewPricingPage from './pages/NewPricingPage'
import ContactSalesPage from './pages/ContactSalesPage'
import SuccessPage from './pages/SuccessPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ProfilePage from './pages/ProfilePage'
import BrandSuitePage from './pages/BrandSuitePage'
import SocialMediaPage from './pages/SocialMediaPage'
import TemplateMarketplacePage from './pages/TemplateMarketplacePage'
import AIStrategyToolsPage from './pages/AIStrategyToolsPage'
import BrandWizardPage from './pages/BrandWizardPage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingSpinner fullScreen={true} text="Loading LaunchZone..." />
  }

  return (
    <ErrorBoundary>
      <UpgradeProvider>
        <div className="min-h-screen bg-night flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/generate" element={<GeneratorPage />} />
              <Route path="/templates" element={<TemplateMarketplacePage />} />
              <Route path="/pricing" element={<NewPricingPage />} />
              <Route path="/contact-sales" element={<ContactSalesPage />} />
              <Route path="/brand-wizard" element={<BrandWizardPage />} />
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
              <Route path="/analytics" element={
                <PrivateRoute>
                  <AnalyticsPage />
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
              <Route path="/social-media" element={
                <PrivateRoute>
                  <SocialMediaPage />
                </PrivateRoute>
              } />
              <Route path="/ai-strategy" element={
                <PrivateRoute>
                  <AIStrategyToolsPage />
                </PrivateRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </UpgradeProvider>
    </ErrorBoundary>
  )
}

export default App