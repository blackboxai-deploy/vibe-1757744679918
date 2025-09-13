"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface PaymentProof {
  id: string
  userId: string
  userName: string
  userEmail: string
  planName: string
  amount: number
  transferAmount: number
  transferDate: string
  senderName: string
  selectedBank: string
  proofImage: string
  status: 'pending' | 'verified' | 'rejected'
  submittedAt: Date
  adminNotes?: string
  processedAt?: Date
}

export default function AdminPage() {
  const [payments, setPayments] = useState<PaymentProof[]>([])
  const [adminPassword, setAdminPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(null)
  const [adminNotes, setAdminNotes] = useState('')

  // Load payments from localStorage (in real app, this would be from database)
  useEffect(() => {
    if (isAuthenticated) {
      const savedPayments = localStorage.getItem('adminPayments') || '[]'
      setPayments(JSON.parse(savedPayments))
    }
  }, [isAuthenticated])

  const handleLogin = () => {
    // Simple admin authentication (in real app, this would be proper auth)
    if (adminPassword === 'admin123') {
      setIsAuthenticated(true)
    } else {
      alert('Password admin salah!')
    }
  }

  const handlePaymentAction = (payment: PaymentProof, action: 'verify' | 'reject') => {
    const updatedPayments = payments.map(p => 
      p.id === payment.id 
        ? {
            ...p,
            status: action === 'verify' ? 'verified' as const : 'rejected' as const,
            adminNotes,
            processedAt: new Date()
          }
        : p
    )
    
    setPayments(updatedPayments)
    localStorage.setItem('adminPayments', JSON.stringify(updatedPayments))
    
    // Update user subscription if verified
    if (action === 'verify') {
      const users = JSON.parse(localStorage.getItem('allUsers') || '[]')
      const updatedUsers = users.map((user: any) => {
        if (user.id === payment.userId) {
          return {
            ...user,
            subscription: {
              ...user.subscription,
              plan: payment.planName === 'Basic Plan' ? 'basic' : 'premium',
              status: 'active',
              paymentStatus: 'confirmed',
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              generationsLimit: payment.planName === 'Basic Plan' ? 50 : 200,
              generationsUsed: 0
            }
          }
        }
        return user
      })
      localStorage.setItem('allUsers', JSON.stringify(updatedUsers))
    }
    
    setSelectedPayment(null)
    setAdminNotes('')
    
    alert(`Pembayaran ${action === 'verify' ? 'diverifikasi' : 'ditolak'}!`)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password Admin</Label>
              <Input
                id="password"
                type="password"
                placeholder="Masukkan password admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Masuk
            </Button>
            <div className="text-center text-sm text-gray-500">
              Demo password: <code className="bg-gray-100 px-1 rounded">admin123</code>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <Button 
              variant="outline" 
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'verified').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {payments.filter(p => p.status === 'rejected').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Pembayaran Berlangganan</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Belum ada pembayaran yang perlu diverifikasi
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">User</th>
                      <th className="text-left p-2">Paket</th>
                      <th className="text-left p-2">Jumlah</th>
                      <th className="text-left p-2">Bank</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Tanggal</th>
                      <th className="text-left p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{payment.userName}</div>
                            <div className="text-gray-500 text-xs">{payment.userEmail}</div>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="secondary">{payment.planName}</Badge>
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{formatPrice(payment.transferAmount)}</div>
                            <div className="text-xs text-gray-500">
                              {payment.senderName}
                            </div>
                          </div>
                        </td>
                        <td className="p-2">{payment.selectedBank}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.status === 'pending' ? 'Pending' :
                             payment.status === 'verified' ? 'Verified' : 'Rejected'}
                          </Badge>
                        </td>
                        <td className="p-2">
                          {new Date(payment.transferDate).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Review Modal */}
        {selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Review Pembayaran</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedPayment(null)}
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Payment Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600">User</Label>
                    <p className="font-medium">{selectedPayment.userName}</p>
                    <p className="text-sm text-gray-500">{selectedPayment.userEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Paket</Label>
                    <p className="font-medium">{selectedPayment.planName}</p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Transfer</Label>
                    <p className="font-medium">{formatPrice(selectedPayment.transferAmount)}</p>
                    <p className="text-sm text-gray-500">dari {selectedPayment.senderName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Bank</Label>
                    <p className="font-medium">{selectedPayment.selectedBank}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedPayment.transferDate).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                {/* Transfer Proof Image */}
                <div>
                  <Label className="text-sm text-gray-600">Bukti Transfer</Label>
                  <div className="mt-2 border rounded-lg p-2">
                    <img 
                      src={selectedPayment.proofImage} 
                      alt="Bukti Transfer"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <Label htmlFor="adminNotes">Catatan Admin</Label>
                  <Textarea
                    id="adminNotes"
                    placeholder="Tambahkan catatan untuk user..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                {selectedPayment.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handlePaymentAction(selectedPayment, 'reject')}
                      variant="destructive"
                      className="flex-1"
                    >
                      Tolak Pembayaran
                    </Button>
                    <Button
                      onClick={() => handlePaymentAction(selectedPayment, 'verify')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      Verifikasi & Aktifkan
                    </Button>
                  </div>
                )}

                {selectedPayment.status !== 'pending' && (
                  <div className="pt-4 text-center text-gray-500">
                    Status: {selectedPayment.status === 'verified' ? 'Sudah Diverifikasi' : 'Sudah Ditolak'}
                    {selectedPayment.adminNotes && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <strong>Catatan:</strong> {selectedPayment.adminNotes}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}