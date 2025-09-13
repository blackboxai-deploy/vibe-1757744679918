"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { SubscriptionPlan } from '@/types/subscription'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  plan: SubscriptionPlan
  onPaymentSubmit: (paymentData: any) => void
}

const BANK_ACCOUNTS = [
  {
    bank: 'Bank BCA',
    accountNumber: '1234567890',
    accountName: 'AI Video Generator',
  },
  {
    bank: 'Bank Mandiri', 
    accountNumber: '0987654321',
    accountName: 'AI Video Generator',
  },
  {
    bank: 'Bank BNI',
    accountNumber: '5556667777',
    accountName: 'AI Video Generator',
  }
]

export function PaymentModal({ isOpen, onClose, plan, onPaymentSubmit }: PaymentModalProps) {
  const [selectedBank, setSelectedBank] = useState('')
  const [transferProof, setTransferProof] = useState<File | null>(null)
  const [transferAmount, setTransferAmount] = useState('')
  const [transferDate, setTransferDate] = useState('')
  const [senderName, setSenderName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setTransferProof(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!selectedBank || !transferProof || !transferAmount || !transferDate || !senderName) {
      alert('Harap lengkapi semua data')
      setIsSubmitting(false)
      return
    }

    // Convert image to base64 for storage
    const reader = new FileReader()
    reader.onload = async () => {
      const paymentData = {
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        transferAmount: parseFloat(transferAmount),
        transferDate,
        senderName,
        selectedBank,
        proofImage: reader.result as string,
        submittedAt: new Date(),
        status: 'pending'
      }

      onPaymentSubmit(paymentData)
      setIsSubmitting(false)
      onClose()
    }
    reader.readAsDataURL(transferProof)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Nomor rekening berhasil disalin!')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Pembayaran Manual Transfer</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              Ringkasan Pesanan
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-purple-800 dark:text-purple-200">Paket:</span>
                <Badge variant="secondary">{plan.name}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-800 dark:text-purple-200">Video Generations:</span>
                <span className="font-medium">{plan.generations}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-800 dark:text-purple-200">Durasi:</span>
                <span className="font-medium">{plan.duration} hari</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-purple-200 dark:border-purple-700 pt-2">
                <span className="text-purple-900 dark:text-purple-100">Total:</span>
                <span className="text-purple-900 dark:text-purple-100">{formatPrice(plan.price)}</span>
              </div>
            </div>
          </div>

          {/* Bank Accounts */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              1. Pilih Rekening Tujuan Transfer
            </h3>
            <div className="grid gap-3">
              {BANK_ACCOUNTS.map((bank, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedBank === bank.bank
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedBank(bank.bank)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {bank.bank}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        a.n. {bank.accountName}
                      </div>
                      <div className="text-lg font-mono font-bold text-purple-600">
                        {bank.accountNumber}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(bank.accountNumber)
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transfer Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              📝 Instruksi Transfer
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Transfer tepat sejumlah <strong>{formatPrice(plan.price)}</strong></li>
              <li>Simpan bukti transfer (screenshot atau foto)</li>
              <li>Upload bukti transfer di form di bawah</li>
              <li>Tunggu konfirmasi admin (maksimal 24 jam)</li>
              <li>Paket akan aktif setelah pembayaran dikonfirmasi</li>
            </ol>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              2. Upload Bukti Transfer
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Nama Pengirim *</Label>
                <Input
                  id="senderName"
                  placeholder="Nama sesuai rekening"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferAmount">Jumlah Transfer *</Label>
                <Input
                  id="transferAmount"
                  type="number"
                  placeholder={plan.price.toString()}
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferDate">Tanggal & Waktu Transfer *</Label>
              <Input
                id="transferDate"
                type="datetime-local"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferProof">Bukti Transfer *</Label>
              <Input
                id="transferProof"
                type="file"
                accept="image/*"
                onChange={handleProofUpload}
                required
              />
              {transferProof && (
                <div className="text-sm text-green-600">
                  ✓ File terpilih: {transferProof.name}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Format: JPG, PNG (max 5MB)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !selectedBank || !transferProof}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Transfer'}
              </Button>
            </div>
          </form>

          {/* Contact Info */}
          <div className="text-center text-sm text-gray-500">
            <p>Butuh bantuan? Hubungi customer service:</p>
            <p className="font-medium">WhatsApp: +62-812-3456-7890</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}