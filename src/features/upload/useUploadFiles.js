import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Uploads one or more files as multipart/form-data to the backend.
// `metadata` is a parallel array of { name, description } per file.
// `onProgress` receives an integer 0–100 as bytes are sent.
async function uploadFiles({ files, metadata = [], onProgress }) {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  // Send per-file metadata as a JSON field aligned by index with `files`.
  formData.append('metadata', JSON.stringify(metadata))

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total) {
        onProgress?.(Math.round((event.loaded * 100) / event.total))
      }
    },
  })

  return data
}

export function useUploadFiles() {
  return useMutation({ mutationFn: uploadFiles })
}
