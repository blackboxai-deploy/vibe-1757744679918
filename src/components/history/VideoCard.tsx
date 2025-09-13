"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { GeneratedVideo } from '../video-generator/VideoGenerator'

interface VideoCardProps {
  video: GeneratedVideo
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onDelete: () => void
}

export function VideoCard({ video, isSelected, onSelect, onDelete }: VideoCardProps) {
  const [showFullPrompt, setShowFullPrompt] = useState(false)

  const handleDownload = async () => {
    if (!video.url) return

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

  const truncatePrompt = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all duration-300">
      {/* Video Thumbnail/Preview */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {video.url ? (
          <>
            <video
              src={video.url}
              className="w-full h-full object-cover"
              muted
              poster={video.thumbnail}
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => {
                e.currentTarget.pause()
                e.currentTarget.currentTime = 0
              }}
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
              <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {video.status === 'generating' ? (
              <div className="text-center text-gray-500">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm">Sedang diproses...</p>
              </div>
            ) : (
              <div className="text-center text-red-500">
                <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-sm">Gagal</p>
              </div>
            )}
          </div>
        )}

        {/* Selection checkbox */}
        <div className="absolute top-3 left-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="bg-white bg-opacity-90"
          />
        </div>

        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            video.status === 'completed' ? 'bg-green-100 text-green-800' :
            video.status === 'generating' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            {video.status === 'completed' ? 'Selesai' : 
             video.status === 'generating' ? 'Proses' : 'Gagal'}
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {video.params.duration}s
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Prompt */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Prompt:</p>
          <p className="text-gray-900 dark:text-white text-sm leading-relaxed">
            {showFullPrompt ? video.params.prompt : truncatePrompt(video.params.prompt)}
            {video.params.prompt.length > 100 && (
              <button
                onClick={() => setShowFullPrompt(!showFullPrompt)}
                className="ml-1 text-purple-600 hover:text-purple-700 text-xs"
              >
                {showFullPrompt ? 'Lebih sedikit' : 'Lihat selengkapnya'}
              </button>
            )}
          </p>
        </div>

        {/* Video Parameters */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
            {video.params.aspectRatio}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
            {video.params.quality}
          </span>
          <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded capitalize">
            {video.params.style}
          </span>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-gray-500">
          {video.createdAt.toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {video.status === 'completed' && video.url && (
            <Button
              size="sm"
              onClick={handleDownload}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Unduh
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            onClick={onDelete}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
          
          {video.url && (
            <Button
              size="sm"
              variant="outline"
              className="px-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}