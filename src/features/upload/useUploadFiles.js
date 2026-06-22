import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Uploads images to POST /images, one request per file.
// Each request is multipart/form-data with fields:
//   image       — the file (required)
//   name        — display name (required)
//   description — optional
// `metadata` is a parallel array of { name, description } aligned with `files`.
// `onProgress` receives an aggregate integer 0–100 across all files.
async function uploadFiles({ files, metadata = [], onProgress }) {
  const totalBytes = files.reduce((sum, f) => sum + f.size, 0)
  let completedBytes = 0
  const results = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const meta = metadata[i] ?? {}

    const formData = new FormData()
    formData.append('image', file)
    formData.append('name', meta.name ?? '')
    if (meta.description) formData.append('description', meta.description)

    const { data } = await api.post('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        const loaded = event.loaded ?? 0
        if (totalBytes) {
          const pct = Math.round(((completedBytes + loaded) * 100) / totalBytes)
          onProgress?.(Math.min(pct, 100))
        }
      },
    })

    completedBytes += file.size
    results.push(data)
  }

  return results
}

export function useUploadFiles() {
  return useMutation({ mutationFn: uploadFiles })
}
