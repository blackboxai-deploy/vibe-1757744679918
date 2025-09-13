"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onAuth: (user: any) => void
}

export function AuthModal({ isOpen, onClose, onAuth }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    veo3ApiKey: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate login - in real app, call your auth API
      const mockUser = {
        id: 'user_' + Date.now(),
        email: loginForm.email,
        name: loginForm.email.split('@')[0],
        subscription: {
          plan: 'free',
          status: 'active',
          generationsUsed: 0,
          generationsLimit: 3
        },
        veo3ApiKey: null
      }
      
      localStorage.setItem('currentUser', JSON.stringify(mockUser))
      onAuth(mockUser)
      onClose()
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (registerForm.password !== registerForm.confirmPassword) {
      alert('Password tidak cocok')
      setIsLoading(false)
      return
    }

    if (!registerForm.veo3ApiKey.trim()) {
      alert('VEO-3 API Key wajib diisi')
      setIsLoading(false)
      return
    }

    try {
      // Create new user with free trial
      const newUser = {
        id: 'user_' + Date.now(),
        email: registerForm.email,
        name: registerForm.name,
        createdAt: new Date(),
        subscription: {
          id: 'sub_' + Date.now(),
          plan: 'free',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          generationsUsed: 0,
          generationsLimit: 3,
          paymentStatus: 'confirmed'
        },
        veo3ApiKey: registerForm.veo3ApiKey
      }
      
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      onAuth(newUser)
      onClose()
    } catch (error) {
      console.error('Register error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Masuk ke AI Video Generator</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Masuk</TabsTrigger>
            <TabsTrigger value="register">Daftar</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sedang Masuk...' : 'Masuk'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your@email.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="veo3-api-key">VEO-3 API Key *</Label>
                <Input
                  id="veo3-api-key"
                  type="password"
                  placeholder="Masukkan VEO-3 API Key Anda"
                  value={registerForm.veo3ApiKey}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, veo3ApiKey: e.target.value }))}
                  required
                />
                <p className="text-xs text-gray-500">
                  Dapatkan API key dari{' '}
                  <a href="https://replicate.com" target="_blank" className="text-blue-600 hover:underline">
                    Replicate.com
                  </a>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium mb-1">
                  🎁 Free Trial Included!
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-xs">
                  Daftar sekarang dan dapatkan 3 video generation gratis selama 7 hari
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sedang Mendaftar...' : 'Daftar & Mulai Free Trial'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}