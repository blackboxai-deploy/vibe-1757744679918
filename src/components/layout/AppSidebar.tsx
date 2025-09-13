"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { User } from '@/types/subscription'

interface AppSidebarProps {
  isOpen: boolean
  onClose: () => void
  activeView: 'generator' | 'history' | 'profile'
  onViewChange: (view: 'generator' | 'history' | 'profile') => void
  user: User | null
}

export function AppSidebar({ isOpen, onClose, activeView, onViewChange, user }: AppSidebarProps) {
  const menuItems = [
    {
      id: 'generator' as const,
      label: 'Generator Video',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Buat video AI baru'
    },
    {
      id: 'history' as const,
      label: 'Riwayat Video',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Lihat video yang telah dibuat'
    },
    {
      id: 'profile' as const,
      label: 'Profil & Pengaturan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Kelola akun dan API key'
    }
  ]

  const getUsagePercentage = () => {
    if (!user) return 0
    return (user.subscription.generationsUsed / user.subscription.generationsLimit) * 100
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'basic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'  
      case 'premium': return 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-80 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  VEO-3 Generator
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI Video Creator
                </p>
              </div>
            </div>
            
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id)
                onClose()
              }}
              className={cn(
                "w-full flex items-start space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group",
                activeView === item.id
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.02]"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                activeView === item.id
                  ? "bg-white/20"
                  : "bg-gray-100 dark:bg-gray-600 group-hover:bg-gray-200 dark:group-hover:bg-gray-500"
              )}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-1">
                  {item.label}
                </p>
                <p className={cn(
                  "text-sm opacity-80",
                  activeView === item.id ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                )}>
                  {item.description}
                </p>
              </div>
            </button>
          ))}
        </nav>

         {/* User Stats Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {user && (
            <div className="space-y-3">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <Badge className={`text-xs ${getPlanColor(user.subscription.plan)}`}>
                    {user.subscription.plan.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-purple-800 dark:text-purple-200">
                    Video Generations
                  </span>
                  <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                    {user.subscription.generationsUsed}/{user.subscription.generationsLimit}
                  </span>
                </div>
                <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${getUsagePercentage()}%` }}
                  ></div>
                </div>
                {!user.veo3ApiKey && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    ⚠ API Key belum diatur
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Model Info */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-blue-600 rounded flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">
                  AI Model: VEO-3
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Video generation terdepan
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}