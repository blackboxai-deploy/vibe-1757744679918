"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VideoCard } from './VideoCard'
import { GeneratedVideo } from '../video-generator/VideoGenerator'

export function VideoHistory() {
  const [videos, setVideos] = useState<GeneratedVideo[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Load videos from localStorage
    const saved = localStorage.getItem('videoHistory')
    if (saved) {
      const parsedVideos = JSON.parse(saved).map((video: any) => ({
        ...video,
        createdAt: new Date(video.createdAt)
      }))
      setVideos(parsedVideos)
    }
  }, [])

  const filteredVideos = videos.filter(video =>
    video.params.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDeleteVideo = (videoId: string) => {
    const updatedVideos = videos.filter(video => video.id !== videoId)
    setVideos(updatedVideos)
    localStorage.setItem('videoHistory', JSON.stringify(updatedVideos))
    
    // Remove from selection if selected
    const newSelection = new Set(selectedVideos)
    newSelection.delete(videoId)
    setSelectedVideos(newSelection)
  }

  const handleSelectVideo = (videoId: string, selected: boolean) => {
    const newSelection = new Set(selectedVideos)
    if (selected) {
      newSelection.add(videoId)
    } else {
      newSelection.delete(videoId)
    }
    setSelectedVideos(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedVideos.size === filteredVideos.length) {
      setSelectedVideos(new Set())
    } else {
      setSelectedVideos(new Set(filteredVideos.map(v => v.id)))
    }
  }

  const handleBulkDelete = () => {
    const updatedVideos = videos.filter(video => !selectedVideos.has(video.id))
    setVideos(updatedVideos)
    localStorage.setItem('videoHistory', JSON.stringify(updatedVideos))
    setSelectedVideos(new Set())
  }

  const handleBulkDownload = async () => {
    const selectedVideosList = videos.filter(video => selectedVideos.has(video.id) && video.url)
    
    for (const video of selectedVideosList) {
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
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Error downloading video ${video.id}:`, error)
      }
    }
  }

  const clearAllHistory = () => {
    setVideos([])
    localStorage.removeItem('videoHistory')
    setSelectedVideos(new Set())
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Belum Ada Video
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Video yang Anda buat akan muncul di sini. Mulai buat video pertama Anda dengan AI VEO-3!
        </p>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Buat Video Pertama
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cari video berdasarkan prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {selectedVideos.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
                className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Unduh ({selectedVideos.size})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus ({selectedVideos.size})
              </Button>
            </>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedVideos.size === filteredVideos.length ? 'Batalkan Semua' : 'Pilih Semua'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllHistory}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Hapus Semua
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Video</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{videos.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Berhasil</p>
              <p className="text-2xl font-bold text-green-600">
                {videos.filter(v => v.status === 'completed').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Dipilih</p>
              <p className="text-2xl font-bold text-purple-600">{selectedVideos.size}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            Tidak ditemukan video dengan kata kunci "{searchQuery}"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              isSelected={selectedVideos.has(video.id)}
              onSelect={(selected) => handleSelectVideo(video.id, selected)}
              onDelete={() => handleDeleteVideo(video.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}