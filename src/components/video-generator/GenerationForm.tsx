"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { VideoGenerationParams } from './VideoGenerator'

interface GenerationFormProps {
  onGenerate: (params: VideoGenerationParams) => void
  isGenerating: boolean
  mode: 'text-to-video' | 'image-to-video'
  disabled?: boolean
}

export function GenerationForm({ onGenerate, isGenerating, mode, disabled = false }: GenerationFormProps) {
  const [params, setParams] = useState<VideoGenerationParams>({
    prompt: '',
    duration: 5,
    aspectRatio: '16:9',
    quality: 'HD',
    style: 'realistic',
    mode: 'text-to-video'
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

   // Update mode when prop changes
  React.useEffect(() => {
    setParams(prev => ({ ...prev, mode }))
    if (mode === 'text-to-video') {
      setSelectedImage(null)
      setImagePreview('')
    }
  }, [mode])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const isTextToVideoValid = mode === 'text-to-video' && params.prompt.trim()
    const isImageToVideoValid = mode === 'image-to-video' && selectedImage && params.prompt.trim()
    
     if (isTextToVideoValid || isImageToVideoValid) {
      const submitParams = {
        ...params,
        imageFile: mode === 'image-to-video' && selectedImage ? selectedImage : undefined
      }
      onGenerate(submitParams)
    }
  }

  const isFormValid = mode === 'text-to-video' 
    ? params.prompt.trim().length > 0
    : params.prompt.trim().length > 0 && selectedImage !== null

  return (
     <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section - Only for Image to Video */}
      {mode === 'image-to-video' && (
        <div className="space-y-3">
          <Label className="text-base font-medium">
            Upload Gambar *
          </Label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={isGenerating}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      Klik untuk upload gambar
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG, GIF (max 10MB)
                    </p>
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                disabled={isGenerating}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                {selectedImage?.name}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prompt Input */}
      <div className="space-y-3">
        <Label htmlFor="prompt" className="text-base font-medium">
          {mode === 'text-to-video' ? 'Deskripsi Video *' : 'Deskripsi Animasi *'}
        </Label>
        <Textarea
          id="prompt"
          placeholder={mode === 'text-to-video' 
            ? "Deskripsikan video yang ingin Anda buat...\n\nContoh: 'Seorang wanita muda berjalan di pantai saat matahari terbenam, dengan ombak laut yang tenang dan cahaya emas yang memantul di air. Kamera mengikuti dari belakang dengan gerakan yang halus.'"
            : "Deskripsikan bagaimana gambar harus beranimasi...\n\nContoh: 'Buat gerakan halus seperti angin bertiup, daun-daun bergoyang pelan, dan cahaya yang berkedip lembut. Tambahkan efek parallax pada background.'"
          }
          value={params.prompt}
          onChange={(e) => setParams(prev => ({ ...prev, prompt: e.target.value }))}
          className="min-h-[120px] resize-none"
          disabled={isGenerating}
        />
        <div className="text-right text-sm text-gray-500">
          {params.prompt.length}/1000 karakter
        </div>
      </div>

      {/* Duration Slider */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Durasi Video: {params.duration} detik
        </Label>
        <div className="px-2">
          <Slider
            value={[params.duration]}
            onValueChange={(value) => setParams(prev => ({ ...prev, duration: value[0] }))}
            min={2}
            max={10}
            step={1}
            disabled={isGenerating}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>2s</span>
            <span>5s</span>
            <span>10s</span>
          </div>
        </div>
      </div>

      {/* Aspect Ratio */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Rasio Aspek
        </Label>
        <Select
          value={params.aspectRatio}
          onValueChange={(value: '16:9' | '9:16' | '1:1') => 
            setParams(prev => ({ ...prev, aspectRatio: value }))}
          disabled={isGenerating}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="16:9">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-3 bg-gray-300 rounded"></div>
                <span>16:9 (Landscape) - YouTube, TV</span>
              </div>
            </SelectItem>
            <SelectItem value="9:16">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-6 bg-gray-300 rounded"></div>
                <span>9:16 (Portrait) - TikTok, Instagram</span>
              </div>
            </SelectItem>
            <SelectItem value="1:1">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>1:1 (Square) - Instagram Post</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quality */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Kualitas Video
        </Label>
        <Select
          value={params.quality}
          onValueChange={(value: 'HD' | '4K') => 
            setParams(prev => ({ ...prev, quality: value }))}
          disabled={isGenerating}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HD">
              <div className="space-y-1">
                <div className="font-medium">HD (1080p)</div>
                <div className="text-xs text-gray-500">Cepat, cocok untuk preview</div>
              </div>
            </SelectItem>
            <SelectItem value="4K">
              <div className="space-y-1">
                <div className="font-medium">4K (Ultra HD)</div>
                <div className="text-xs text-gray-500">Kualitas terbaik, lebih lama</div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Style */}
      <div className="space-y-3">
        <Label className="text-base font-medium">
          Gaya Visual
        </Label>
        <Select
          value={params.style}
          onValueChange={(value: 'realistic' | 'cinematic' | 'animated' | 'artistic') => 
            setParams(prev => ({ ...prev, style: value }))}
          disabled={isGenerating}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="realistic">
              <div className="space-y-1">
                <div className="font-medium">Realistis</div>
                <div className="text-xs text-gray-500">Natural, seperti rekaman nyata</div>
              </div>
            </SelectItem>
            <SelectItem value="cinematic">
              <div className="space-y-1">
                <div className="font-medium">Sinematik</div>
                <div className="text-xs text-gray-500">Dramatic, movie-style</div>
              </div>
            </SelectItem>
            <SelectItem value="animated">
              <div className="space-y-1">
                <div className="font-medium">Animasi</div>
                <div className="text-xs text-gray-500">Gaya kartun atau 3D</div>
              </div>
            </SelectItem>
            <SelectItem value="artistic">
              <div className="space-y-1">
                <div className="font-medium">Artistik</div>
                <div className="text-xs text-gray-500">Creative, abstract style</div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Generate Button */}
       <Button
        type="submit"
        disabled={!isFormValid || isGenerating || disabled}
        className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50"
      >
        {isGenerating ? (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Sedang Membuat Video...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Buat Video AI</span>
          </div>
        )}
      </Button>

       {/* Form Info */}
      <div className="text-xs text-gray-500 text-center">
        {mode === 'text-to-video' 
          ? 'Video akan diproses menggunakan model VEO-3. Waktu generasi: 2-5 menit tergantung kompleksitas.'
          : 'Gambar akan diubah menjadi video dengan AI VEO-3. Waktu generasi: 3-7 menit untuk kualitas terbaik.'
        }
      </div>
    </form>
  )
}