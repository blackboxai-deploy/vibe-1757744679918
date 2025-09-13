"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/types/subscription'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectPlan: (plan: SubscriptionPlan) => void
  currentPlan?: string
}

export function SubscriptionModal({ isOpen, onClose, onSelectPlan, currentPlan }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('')

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (plan.id === 'free') return // Can't "buy" free plan
    
    setSelectedPlan(plan.id)
    onSelectPlan(plan)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">Pilih Paket Berlangganan</DialogTitle>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Upgrade untuk mendapatkan lebih banyak video generation dan fitur premium
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-6 ${
                currentPlan === plan.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : plan.id === 'basic'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
              } transition-all cursor-pointer`}
              onClick={() => plan.id !== 'free' && handleSelectPlan(plan)}
            >
              {/* Popular Badge */}
              {plan.id === 'basic' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1">
                    Paling Populer
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {currentPlan === plan.id && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    Paket Aktif
                  </Badge>
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  {plan.price === 0 ? (
                    <div className="text-3xl font-bold text-green-600">GRATIS</div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(plan.price)}
                      </div>
                      <div className="text-sm text-gray-500">per bulan</div>
                    </div>
                  )}
                </div>

                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {plan.generations}
                  </div>
                  <div className="text-sm text-gray-500">video generations</div>
                </div>

                <div className="space-y-2 text-left">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6">
                  {plan.id === 'free' ? (
                    <Button
                      disabled
                      className="w-full"
                      variant={currentPlan === plan.id ? "secondary" : "outline"}
                    >
                      {currentPlan === plan.id ? 'Paket Aktif' : 'Free Trial'}
                    </Button>
                  ) : currentPlan === plan.id ? (
                    <Button disabled className="w-full" variant="secondary">
                      Paket Aktif
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full ${
                        plan.id === 'basic'
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                          : ''
                      }`}
                    >
                      Pilih Paket
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Info */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Sistem Pembayaran Manual
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Setelah memilih paket, Anda akan diarahkan ke halaman pembayaran dengan instruksi transfer bank. 
                Upload bukti transfer dan tunggu konfirmasi admin (1-24 jam).
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}