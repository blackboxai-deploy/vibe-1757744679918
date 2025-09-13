"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { GeneratedVideo } from './VideoGenerator'

interface ProgressIndicatorProps {
  video: GeneratedVideo
  onCancel: () => void
}

export function ProgressIndicator({ video, onCancel }: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentStep, setCurrentStep] = useState('')

  const steps = [
    'Menganalisis prompt...',
    'Mempersiapkan scene...',
    'Rendering frame...',
    'Menambahkan efek...',
    'Optimasi video...',
    'Finalisasi...'
  ]

  useEffect(() => {
    if (video.status === 'generating') {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
        
        // Simulate progressive steps
        const newProgress = Math.min(progress + Math.random() * 5, 95)
        setProgress(newProgress)
        
        const stepIndex = Math.floor(newProgress / 16)
        if (stepIndex < steps.length) {
          setCurrentStep(steps[stepIndex])
        }
      }, 2000)

      const timeInterval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)

      return () => {
        clearInterval(interval)
        clearInterval(timeInterval)
      }
    } else if (video.status === 'completed') {
      setProgress(100)
      setCurrentStep('Video berhasil dibuat!')
    } else if (video.status === 'failed') {
      setCurrentStep('Gagal membuat video')
    }
  }, [video.status, progress, steps])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Progress Generasi Video
        </h4>
        <div className="text-sm text-gray-500">
          {formatTime(timeElapsed)}
        </div>
      </div>

      {/* Video Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Prompt:</span>
          <span className="text-gray-900 dark:text-white font-medium max-w-xs text-right truncate">
            {video.params.prompt}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Durasi:</span>
          <span className="text-gray-900 dark:text-white">{video.params.duration}s</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Kualitas:</span>
          <span className="text-gray-900 dark:text-white">{video.params.quality}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Style:</span>
          <span className="text-gray-900 dark:text-white capitalize">{video.params.style}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentStep}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(progress)}%
          </span>
        </div>
        
        <Progress 
          value={progress} 
          className="h-3"
        />
        
        {video.status === 'generating' && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Sedang memproses dengan AI VEO-3...</span>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {video.status === 'completed' && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium text-green-800 dark:text-green-200">
              Video berhasil dibuat!
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Video Anda telah selesai diproses dan siap untuk diunduh.
          </p>
        </div>
      )}

      {video.status === 'failed' && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="font-medium text-red-800 dark:text-red-200">
              Gagal membuat video
            </span>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Terjadi kesalahan saat memproses video. Silakan coba lagi dengan prompt yang berbeda.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {video.status === 'generating' && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Batalkan
          </Button>
        </div>
      )}

      {/* Estimated Time */}
      {video.status === 'generating' && (
        <div className="text-center text-xs text-gray-500">
          <p>Perkiraan waktu tersisa: {Math.max(0, 300 - timeElapsed)} detik</p>
          <p className="mt-1">Waktu generasi tergantung kompleksitas dan kualitas video</p>
        </div>
      )}
    </div>
  )
}