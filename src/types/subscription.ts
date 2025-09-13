export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  subscription: Subscription
  apiKey?: string
  veo3ApiKey?: string
}

export interface Subscription {
  id: string
  userId: string
  plan: 'free' | 'basic' | 'premium'
  status: 'active' | 'inactive' | 'pending' | 'expired'
  startDate: Date
  endDate: Date
  paymentMethod: 'manual_transfer'
  paymentStatus: 'pending' | 'confirmed' | 'failed'
  transferProof?: string
  generationsUsed: number
  generationsLimit: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  currency: string
  generations: number
  duration: number // days
  features: string[]
}

export interface PaymentProof {
  id: string
  subscriptionId: string
  userId: string
  amount: number
  bankAccount: string
  transferDate: Date
  proofImage: string
  status: 'pending' | 'verified' | 'rejected'
  adminNotes?: string
  processedAt?: Date
  processedBy?: string
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free Trial',
    price: 0,
    currency: 'IDR',
    generations: 3,
    duration: 7,
    features: [
      '3 video generations',
      'HD quality only',
      'Max 5 seconds duration',
      'Basic support'
    ]
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 99000,
    currency: 'IDR',
    generations: 50,
    duration: 30,
    features: [
      '50 video generations',
      'HD & 4K quality',
      'Up to 10 seconds duration',
      'Priority support',
      'Download without watermark'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 299000,
    currency: 'IDR',
    generations: 200,
    duration: 30,
    features: [
      '200 video generations',
      'HD & 4K quality',
      'Up to 10 seconds duration',
      'Priority support',
      'Download without watermark',
      'Early access to new features',
      'API access'
    ]
  }
]