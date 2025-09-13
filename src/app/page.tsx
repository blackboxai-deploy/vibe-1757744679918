"use client"

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { VideoGenerator } from '@/components/video-generator/VideoGenerator'
import { VideoHistory } from '@/components/history/VideoHistory'
import { AuthModal } from '@/components/auth/AuthModal'
import { SubscriptionModal } from '@/components/subscription/SubscriptionModal'
import { PaymentModal } from '@/components/subscription/PaymentModal'
import { UserProfile } from '@/components/user/UserProfile'
import type { User, SubscriptionPlan } from '@/types/subscription'

export default function Home() {
  const [activeView, setActiveView] = useState<'generator' | 'history' | 'profile'>('generator')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    } else {
      setShowAuthModal(true)
    }
  }, [])

  const handleAuth = (user: User) => {
    setCurrentUser(user)
    setShowAuthModal(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
    setShowAuthModal(true)
  }

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setShowSubscriptionModal(false)
    setShowPaymentModal(true)
  }

  const handlePaymentSubmit = (paymentData: any) => {
    // In a real app, send this to your backend
    console.log('Payment submitted:', paymentData)
    
    // For demo, update user subscription to pending
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        subscription: {
          ...currentUser.subscription,
          status: 'pending' as const,
          paymentStatus: 'pending' as const
        }
      }
      
      setCurrentUser(updatedUser)
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    }

    alert('Bukti pembayaran berhasil dikirim! Tunggu konfirmasi admin dalam 1-24 jam.')
  }

  const handleUpdateApiKey = (apiKey: string) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        veo3ApiKey: apiKey
      }
      
      setCurrentUser(updatedUser)
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      alert('API Key berhasil diperbarui!')
    }
  }

   const canUseGenerator = Boolean(
    currentUser && 
    currentUser.veo3ApiKey && 
    currentUser.subscription.generationsUsed < currentUser.subscription.generationsLimit
  )

  // Show auth modal if no user
  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Video Generator VEO-3
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Masuk atau daftar untuk mulai membuat video AI berkualitas tinggi
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium"
            >
              Mulai Sekarang
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {}} // Can't close if no user
          onAuth={handleAuth}
        />
      </>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
       {/* Sidebar */}
      <AppSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
        user={currentUser}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AppHeader 
          onMenuClick={() => setSidebarOpen(true)}
          activeView={activeView}
          user={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {activeView === 'generator' ? (
              <div className="space-y-8">
                {/* Usage Warning */}
                {!canUseGenerator && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 19.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h3 className="font-medium text-red-800 dark:text-red-200">
                          {!currentUser.veo3ApiKey 
                            ? 'VEO-3 API Key Belum Diatur'
                            : 'Kuota Generation Habis'
                          }
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300">
                          {!currentUser.veo3ApiKey 
                            ? 'Silakan atur VEO-3 API Key di halaman profil untuk mulai membuat video.'
                            : `Anda telah menggunakan ${currentUser.subscription.generationsUsed}/${currentUser.subscription.generationsLimit} video generation. Upgrade paket untuk melanjutkan.`
                          }
                        </p>
                        <div className="mt-2">
                          <button
                            onClick={() => setActiveView(!currentUser.veo3ApiKey ? 'profile' : 'generator')}
                            className="text-sm bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded"
                          >
                            {!currentUser.veo3ApiKey ? 'Atur API Key' : 'Upgrade Paket'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                    AI Video Generator
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Buat video menakjubkan dengan kualitas profesional menggunakan teknologi AI VEO-3
                  </p>
                </div>
                <VideoGenerator user={currentUser} canGenerate={canUseGenerator} />
              </div>
            ) : activeView === 'history' ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Riwayat Video
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Kelola dan unduh video yang telah dibuat
                  </p>
                </div>
                <VideoHistory />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Profil & Pengaturan
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">
                    Kelola akun dan pengaturan API Anda
                  </p>
                </div>
                <UserProfile
                  user={currentUser}
                  onUpdateApiKey={handleUpdateApiKey}
                  onUpgrade={() => setShowSubscriptionModal(true)}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSelectPlan={handleSelectPlan}
        currentPlan={currentUser.subscription.plan}
      />

      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          plan={selectedPlan}
          onPaymentSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  )
}