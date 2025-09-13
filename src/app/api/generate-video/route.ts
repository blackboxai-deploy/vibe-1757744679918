import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    let prompt: string, duration: number, aspectRatio: string, quality: string, style: string, mode: string
    let imageBase64: string | undefined
    let userApiKey: string | undefined

    if (contentType?.includes('multipart/form-data')) {
      // Handle FormData for image upload
      const formData = await request.formData()
      
      prompt = formData.get('prompt') as string
      duration = parseInt(formData.get('duration') as string)
      aspectRatio = formData.get('aspectRatio') as string
      quality = formData.get('quality') as string
      style = formData.get('style') as string
      mode = formData.get('mode') as string
      userApiKey = formData.get('apiKey') as string

      const imageFile = formData.get('image') as File
      if (imageFile && imageFile.size > 0) {
        // Convert image to base64
        const arrayBuffer = await imageFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        imageBase64 = buffer.toString('base64')
      }
    } else {
      // Handle JSON for text-to-video
      const body = await request.json()
      prompt = body.prompt
      duration = body.duration
      aspectRatio = body.aspectRatio
      quality = body.quality
      style = body.style
      mode = body.mode || 'text-to-video'
      userApiKey = body.apiKey
    }

     // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    if (!userApiKey) {
      return NextResponse.json(
        { error: 'VEO-3 API key is required' },
        { status: 400 }
      )
    }

    let apiBody: any

    if (mode === 'image-to-video' && imageBase64) {
      // Prepare for image-to-video generation
      const enhancedPrompt = `Transform this image into a ${duration}-second video in ${aspectRatio} aspect ratio with ${quality} quality in a ${style} style. Animation description: ${prompt}`
      
      apiBody = {
        model: 'replicate/google/veo-3',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: enhancedPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ]
      }
    } else {
      // Prepare for text-to-video generation
      const enhancedPrompt = `Create a ${duration}-second video in ${aspectRatio} aspect ratio with ${quality} quality in a ${style} style: ${prompt}`
      
      apiBody = {
        model: 'replicate/google/veo-3',
        messages: [
          {
            role: 'user',
            content: enhancedPrompt
          }
        ]
      }
    }

     // Call VEO-3 API directly using user's API key
    const apiResponse = await fetch('https://api.replicate.com/v1/models/google/veo-3/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: mode === 'image-to-video' && imageBase64 
          ? {
              prompt: `Transform this image into a ${duration}-second video in ${aspectRatio} aspect ratio with ${quality} quality in a ${style} style. Animation description: ${prompt}`,
              image: `data:image/jpeg;base64,${imageBase64}`,
              duration: duration,
              aspect_ratio: aspectRatio.replace(':', '_'), // Convert 16:9 to 16_9
              quality: quality.toLowerCase()
            }
          : {
              prompt: `Create a ${duration}-second video in ${aspectRatio} aspect ratio with ${quality} quality in a ${style} style: ${prompt}`,
              duration: duration,
              aspect_ratio: aspectRatio.replace(':', '_'),
              quality: quality.toLowerCase()
            }
      }),
    })

     if (!apiResponse.ok) {
      const errorData = await apiResponse.text()
      console.error('Replicate API Error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate video', details: errorData },
        { status: 500 }
      )
    }

    const result = await apiResponse.json()
    
    // Get prediction ID and wait for completion
    const predictionId = result.id
    let videoUrl = ''
    
    if (result.status === 'succeeded' && result.output) {
      videoUrl = Array.isArray(result.output) ? result.output[0] : result.output
    } else if (predictionId) {
      // Poll for completion (simplified for demo)
      // In production, you'd want to implement proper polling or webhooks
      let attempts = 0
      const maxAttempts = 60 // 5 minutes with 5s intervals
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds
        
        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Bearer ${userApiKey}`,
          },
        })
        
        if (pollResponse.ok) {
          const pollResult = await pollResponse.json()
          
          if (pollResult.status === 'succeeded' && pollResult.output) {
            videoUrl = Array.isArray(pollResult.output) ? pollResult.output[0] : pollResult.output
            break
          } else if (pollResult.status === 'failed') {
            throw new Error('Video generation failed')
          }
        }
        
        attempts++
      }
      
      if (!videoUrl) {
        throw new Error('Video generation timed out')
      }
    }

     // Return the video URL
    return NextResponse.json({
      success: true,
      url: videoUrl,
      message: 'Video generated successfully',
      parameters: {
        prompt,
        duration,
        aspectRatio,
        quality,
        style,
        mode: mode || 'text-to-video'
      }
    })

  } catch (error) {
    console.error('Error generating video:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to generate videos.' },
    { status: 405 }
  )
}