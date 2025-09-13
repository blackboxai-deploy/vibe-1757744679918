"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { GeneratedVideo } from './VideoGenerator'

interface VideoPreviewProps {
  video: GeneratedVideo | null
  isGenerating: boolean
}

export function VideoPreview({ video, isGenerating }: VideoPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const handleDownload = async () => {
    if (!video?.url) return

    try {
      const response = await fetch(video.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `video_${video.id}.mp4`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading video:', error)
    }
  }

  if (!video && !isGenerating) {
    return (
      <div className="h-80 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Belum Ada Video
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Video yang dibuat akan muncul di sini
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isGenerating && !video?.url) {
    return (
      <div className="h-80 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl flex items-center justify-center border-2 border-dashed border-purple-300 dark:border-purple-700">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div>
            <h4 className="text-lg font-medium text-purple-900 dark:text-purple-100 mb-2">
              Sedang Memproses...
            </h4>
            <p className="text-purple-700 dark:text-purple-300 text-sm">
              AI sedang membuat video Anda
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative bg-black rounded-xl overflow-hidden">
        {video?.url ? (
          <video
            src={video.url}
            controls
            className="w-full h-80 object-contain"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            poster={video.thumbnail}
          >
            Browser Anda tidak mendukung tag video.
          </video>
        ) : (
          <div className="h-80 bg-gray-900 flex items-center justify-center">
            <div className="text-center text-white space-y-2">
              <div className="w-12 h-12 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm">Loading video...</p>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay */}
        {video?.url && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <button className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all">
              <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Video Information */}
      {video && (
        <div className="space-y-4">
          {/* Video Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                  Detail Video
                </h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {video.params.prompt}
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                video.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                video.status === 'generating' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {video.status === 'completed' ? 'Selesai' : 
                 video.status === 'generating' ? 'Proses' : 'Gagal'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Durasi:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {video.params.duration}s
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Kualitas:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {video.params.quality}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Aspek:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {video.params.aspectRatio}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Gaya:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white capitalize">
                  {video.params.style}
                </span>
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-600">
              Dibuat pada: {video.createdAt.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Action Buttons */}
          {video.status === 'completed' && video.url && (
            <div className="flex gap-3">
              <Button
                onClick={handleDownload}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh Video
              </Button>
              
              <Button variant="outline" className="px-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}