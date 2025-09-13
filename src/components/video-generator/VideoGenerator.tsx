"use client"

import { useState } from 'react'
import { GenerationForm } from './GenerationForm'
import { ProgressIndicator } from './ProgressIndicator'
import { VideoPreview } from './VideoPreview'

export interface VideoGenerationParams {
  prompt: string
  duration: number
  aspectRatio: '16:9' | '9:16' | '1:1'
  quality: 'HD' | '4K'
  style: 'realistic' | 'cinematic' | 'animated' | 'artistic'
  mode: 'text-to-video' | 'image-to-video'
  imageFile?: File
  imageUrl?: string
}

export interface GeneratedVideo {
  id: string
  url: string
  thumbnail?: string
  params: VideoGenerationParams
  createdAt: Date
  status: 'generating' | 'completed' | 'failed'
  progress?: number
}

interface VideoGeneratorProps {
  user: any
  canGenerate: boolean
}

export function VideoGenerator({ user, canGenerate }: VideoGeneratorProps) {
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMode, setGenerationMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video')

    const handleGenerate = async (params: VideoGenerationParams) => {
    if (!canGenerate) {
      alert('Tidak dapat membuat video. Periksa kuota atau API key Anda.')
      return
    }

    setIsGenerating(true)
    
    const videoId = `video_${Date.now()}`
    const newVideo: GeneratedVideo = {
      id: videoId,
      url: '',
      params,
      createdAt: new Date(),
      status: 'generating',
      progress: 0
    }
    
    setCurrentVideo(newVideo)

    try {
      let response: Response

      if (params.mode === 'image-to-video' && params.imageFile) {
        // Handle image-to-video with file upload
        const formData = new FormData()
        formData.append('prompt', params.prompt)
        formData.append('duration', params.duration.toString())
        formData.append('aspectRatio', params.aspectRatio)
        formData.append('quality', params.quality)
        formData.append('style', params.style)
        formData.append('mode', params.mode)
        formData.append('image', params.imageFile)
        formData.append('apiKey', user.veo3ApiKey) // Add user's API key

        response = await fetch('/api/generate-video', {
          method: 'POST',
          body: formData,
        })
      } else {
        // Handle text-to-video or image-to-video with URL
        response = await fetch('/api/generate-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...params,
            apiKey: user.veo3ApiKey // Add user's API key
          }),
        })
      }

      if (!response.ok) {
        throw new Error('Gagal memulai generasi video')
      }

      const result = await response.json()
      
      // Update video with result
      const updatedVideo: GeneratedVideo = {
        ...newVideo,
        url: result.url || '',
        status: 'completed',
        progress: 100
      }
      
      setCurrentVideo(updatedVideo)
      
      // Save to history
      const history = JSON.parse(localStorage.getItem('videoHistory') || '[]')
      history.unshift(updatedVideo)
      localStorage.setItem('videoHistory', JSON.stringify(history))

      // Update user's generation count
      const updatedUser = {
        ...user,
        subscription: {
          ...user.subscription,
          generationsUsed: user.subscription.generationsUsed + 1
        }
      }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      
    } catch (error) {
      console.error('Error generating video:', error)
      setCurrentVideo(prev => prev ? { ...prev, status: 'failed' } : null)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setCurrentVideo(null)
    setIsGenerating(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
            Powered by VEO-3 AI Model
          </span>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl inline-flex">
            <button
              onClick={() => setGenerationMode('text-to-video')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                generationMode === 'text-to-video'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <span>Text to Video</span>
              </div>
            </button>
            <button
              onClick={() => setGenerationMode('image-to-video')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                generationMode === 'image-to-video'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Image to Video</span>
              </div>
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {generationMode === 'text-to-video' ? 'Buat Video dari Teks' : 'Buat Video dari Gambar'}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {generationMode === 'text-to-video' 
            ? 'Deskripsikan video yang Anda inginkan dan biarkan AI VEO-3 menciptakan karya visual yang menakjubkan'
            : 'Upload gambar dan ubah menjadi video animasi dengan AI VEO-3'
          }
        </p>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Parameter Generasi Video
            </h3>
              <GenerationForm 
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              mode={generationMode}
              disabled={!canGenerate}
            />
          </div>

          {/* Progress Indicator */}
          {isGenerating && currentVideo && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
              <ProgressIndicator 
                video={currentVideo}
                onCancel={handleReset}
              />
            </div>
          )}
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Preview Video
              </h3>
              {currentVideo && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Reset
                </button>
              )}
            </div>
            
            <VideoPreview 
              video={currentVideo}
              isGenerating={isGenerating}
            />
          </div>

           {/* Tips Section */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800">
            <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
              💡 Tips untuk Hasil Terbaik
            </h4>
            {generationMode === 'text-to-video' ? (
              <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></span>
                  <span>Gunakan deskripsi yang detail dan spesifik untuk hasil yang akurat</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></span>
                  <span>Sebutkan elemen visual seperti pencahayaan, warna, dan gerakan</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></span>
                  <span>Pilih rasio aspek yang sesuai dengan platform target Anda</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></span>
                  <span>Video berkualitas 4K memerlukan waktu processing lebih lama</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-2 text-sm text-purple-800 dark:text-purple-200">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></span>
                  <span>Gunakan gambar dengan resolusi tinggi untuk kualitas video terbaik</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></span>
                  <span>Deskripsikan gerakan spesifik yang ingin ditambahkan ke gambar</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></span>
                  <span>Gambar dengan subjek jelas akan menghasilkan animasi yang lebih baik</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2"></span>
                  <span>Format JPG/PNG dengan ukuran maksimal 10MB didukung</span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}