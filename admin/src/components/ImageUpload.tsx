import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from './ui/button'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onUpload: (file: File) => Promise<{ imageUrl?: string; logoUrl?: string }>
  isUploading?: boolean
  accept?: string
  maxSize?: number // in MB
  label?: string
  placeholder?: string
}

export default function ImageUpload({
  value,
  onChange,
  onUpload,
  isUploading = false,
  accept = "image/*",
  maxSize = 5,
  label = "Image",
  placeholder = "Upload an image or enter URL"
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [urlInput, setUrlInput] = useState(value || '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return
    }

    try {
      const result = await onUpload(file)
      const imageUrl = result.imageUrl || result.logoUrl
      if (imageUrl) {
        onChange(imageUrl)
        setUrlInput(imageUrl)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setUrlInput(url)
    onChange(url)
  }

  const clearImage = () => {
    onChange('')
    setUrlInput('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* URL Input */}
      <div className="flex space-x-2">
        <input
          type="url"
          value={urlInput}
          onChange={handleUrlChange}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {value && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearImage}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* OR Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">OR</span>
        </div>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-2">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            or drag and drop an image here
          </p>
          <p className="text-xs text-gray-400">
            PNG, JPG, WebP up to {maxSize}MB
          </p>
        </div>
      </div>

      {/* Image Preview */}
      {value && (
        <div className="mt-4">
          <div className="relative inline-block">
            <img
              src={value}
              alt="Preview"
              className="h-32 w-32 object-cover rounded-lg border border-gray-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearImage}
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 text-red-600 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
