"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { User } from '@/types/subscription'

interface UserProfileProps {
  user: User
  onUpdateApiKey: (apiKey: string) => void
  onUpgrade: () => void
}

export function UserProfile({ user, onUpdateApiKey, onUpgrade }: UserProfileProps) {
  const [isEditingApiKey, setIsEditingApiKey] = useState(false)
  const [newApiKey, setNewApiKey] = useState(user.veo3ApiKey || '')
  const [isTestingApiKey, setIsTestingApiKey] = useState(false)
  const [apiKeyStatus, setApiKeyStatus] = useState<'unknown' | 'valid' | 'invalid'>('unknown')

   const handleSaveApiKey = () => {
    if (!newApiKey.trim()) {
      alert('API Key tidak boleh kosong')
      return
    }
    
    onUpdateApiKey(newApiKey)
    setIsEditingApiKey(false)
    setApiKeyStatus('unknown')
    alert('API Key berhasil diperbarui!')
  }

  const handleTestApiKey = async () => {
    if (!newApiKey.trim()) {
      alert('Masukkan API key terlebih dahulu')
      return
    }

    setIsTestingApiKey(true)
    setApiKeyStatus('unknown')

    try {
      // Test API key with a simple request to Replicate
      const response = await fetch('https://api.replicate.com/v1/account', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newApiKey}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setApiKeyStatus('valid')
        alert('✅ API Key valid! Anda bisa menggunakannya untuk generate video.')
      } else {
        setApiKeyStatus('invalid')
        alert('❌ API Key tidak valid. Periksa kembali API key Anda.')
      }
    } catch (error) {
      setApiKeyStatus('invalid')
      alert('❌ Gagal memverifikasi API Key. Periksa koneksi internet Anda.')
    } finally {
      setIsTestingApiKey(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date))
  }

  const getUsagePercentage = () => {
    return (user.subscription.generationsUsed / user.subscription.generationsLimit) * 100
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
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
    <div className="space-y-6">
      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Profil Pengguna</span>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(user.subscription.status)}>
                {user.subscription.status === 'active' ? 'Aktif' : 
                 user.subscription.status === 'pending' ? 'Pending' : 
                 user.subscription.status === 'expired' ? 'Expired' : 'Tidak Aktif'}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">Nama</Label>
              <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">Email</Label>
              <p className="font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">Bergabung</Label>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(user.createdAt)}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">User ID</Label>
              <p className="font-mono text-sm text-gray-600 dark:text-gray-400">{user.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Paket Berlangganan</span>
            <Badge className={getPlanColor(user.subscription.plan)}>
              {user.subscription.plan.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Usage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Penggunaan Video Generation</span>
              <span className="font-medium">
                {user.subscription.generationsUsed} / {user.subscription.generationsLimit}
              </span>
            </div>
            <Progress value={getUsagePercentage()} className="h-3" />
            <div className="text-xs text-gray-500 text-center">
              {user.subscription.generationsLimit - user.subscription.generationsUsed} generasi tersisa
            </div>
          </div>

          {/* Subscription Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">Mulai Berlangganan</Label>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(user.subscription.startDate)}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-600 dark:text-gray-400">Berakhir</Label>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(user.subscription.endDate)}
              </p>
            </div>
          </div>

          {/* Upgrade Button */}
          {user.subscription.plan === 'free' && (
            <div className="pt-4">
              <Button 
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Upgrade ke Paket Premium
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Key Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>VEO-3 API Key</span>
            {user.veo3ApiKey && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                ✓ Terkonfigurasi
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user.veo3ApiKey && (
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L1.732 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 dark:text-red-200 font-medium">
                  API Key belum dikonfigurasi
                </span>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Anda perlu mengisi VEO-3 API Key untuk menggunakan layanan video generation.
              </p>
            </div>
          )}

           {isEditingApiKey ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apikey">VEO-3 API Key</Label>
                <div className="relative">
                  <Input
                    id="apikey"
                    type="password"
                    placeholder="r8_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={newApiKey}
                    onChange={(e) => {
                      setNewApiKey(e.target.value)
                      setApiKeyStatus('unknown')
                    }}
                    className={
                      apiKeyStatus === 'valid' ? 'border-green-500 focus:border-green-500' :
                      apiKeyStatus === 'invalid' ? 'border-red-500 focus:border-red-500' :
                      ''
                    }
                  />
                  {apiKeyStatus === 'valid' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {apiKeyStatus === 'invalid' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    Format: r8_... • Dapatkan dari{' '}
                    <a href="https://replicate.com/account/api-tokens" target="_blank" className="text-blue-600 hover:underline">
                      replicate.com
                    </a>
                  </p>
                  {apiKeyStatus === 'valid' && (
                    <span className="text-xs text-green-600 font-medium">✓ Valid</span>
                  )}
                  {apiKeyStatus === 'invalid' && (
                    <span className="text-xs text-red-600 font-medium">✗ Invalid</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleTestApiKey} 
                  size="sm" 
                  variant="outline"
                  disabled={!newApiKey.trim() || isTestingApiKey}
                  className="flex items-center space-x-1"
                >
                  {isTestingApiKey ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Test Key</span>
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleSaveApiKey} 
                  size="sm"
                  disabled={isTestingApiKey}
                  className="flex-1"
                >
                  Simpan API Key
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsEditingApiKey(false)
                    setNewApiKey(user.veo3ApiKey || '')
                    setApiKeyStatus('unknown')
                  }}
                  disabled={isTestingApiKey}
                >
                  Batal
                </Button>
              </div>

              {/* Status Messages */}
              {apiKeyStatus === 'valid' && (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 dark:text-green-200 font-medium text-sm">
                      API Key valid dan siap digunakan!
                    </span>
                  </div>
                </div>
              )}

              {apiKeyStatus === 'invalid' && (
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <span className="text-red-800 dark:text-red-200 font-medium text-sm block">
                        API Key tidak valid
                      </span>
                      <span className="text-red-700 dark:text-red-300 text-xs">
                        Periksa kembali API key atau buat yang baru di Replicate.com
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Current API Key</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={user.veo3ApiKey ? '••••••••••••••••••••••••••••' : 'Belum diatur'}
                    disabled
                    className="flex-1"
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditingApiKey(true)}
                  >
                    {user.veo3ApiKey ? 'Edit' : 'Tambah'}
                  </Button>
                </div>
              </div>

               <div className="space-y-3">
                {/* API Key Benefits */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    💡 Mengapa perlu API Key pribadi?
                  </h4>
                  <ul className="text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Kualitas video terjamin langsung dari VEO-3</li>
                    <li>• Tidak ada batasan tambahan dari layanan pihak ketiga</li>
                    <li>• Anda memiliki kontrol penuh atas usage dan billing</li>
                    <li>• Privacy data terjaga dengan baik</li>
                  </ul>
                </div>

                {/* API Key Update Guide */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-sm border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                    🔄 Update API Key Kapan Saja
                  </h4>
                  <div className="text-yellow-800 dark:text-yellow-200 space-y-1">
                    <p><strong>Kapan perlu update API key?</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-0.5">
                      <li>API key lama sudah expired/kedaluwarsa</li>
                      <li>Mencapai limit billing di Replicate</li>
                      <li>Ingin pakai API key yang berbeda</li>
                      <li>Error authentication saat generate video</li>
                    </ul>
                    <p className="mt-2 text-xs">
                      <strong>Cara:</strong> Klik tombol "Edit" → Masukkan API key baru → Simpan. 
                      Video generation akan langsung menggunakan API key yang baru!
                    </p>
                  </div>
                </div>

                {/* Get API Key Guide */}
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-sm border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                    🔑 Cara Mendapatkan API Key Baru
                  </h4>
                  <div className="text-green-800 dark:text-green-200 space-y-2">
                    <div>
                      <strong>1. Buka Replicate.com</strong>
                      <br />
                      <a 
                        href="https://replicate.com/account/api-tokens" 
                        target="_blank" 
                        className="text-green-600 hover:underline text-xs"
                      >
                        → replicate.com/account/api-tokens
                      </a>
                    </div>
                    <div>
                      <strong>2. Login / Daftar</strong>
                      <br />
                      <span className="text-xs">Buat akun jika belum punya</span>
                    </div>
                    <div>
                      <strong>3. Create New Token</strong>
                      <br />
                      <span className="text-xs">Klik "Create token" → Copy API key</span>
                    </div>
                    <div>
                      <strong>4. Paste ke sini</strong>
                      <br />
                      <span className="text-xs">Format: r8_... (dimulai dengan r8_)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}