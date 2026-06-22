import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Uploads images to POST /images, one request per file.
// Each request is multipart/form-data with fields:
//   image       — the file (required)
//   name        — display name (required)
//   description — optional
//
// `items` is an array of { file, key, name, description }. Each file is
// attempted independently: a failure on one does NOT abort the rest. The result
// is `{ succeeded: [{ key, data }], failed: [{ key, message }] }` so the caller
// can drop the uploaded files and keep the failed ones for retry.
//
// `onProgress` receives an aggregate integer 0–100 across all files.
async function uploadFiles({ items, onProgress }) {
  const totalBytes = items.reduce((sum, it) => sum + it.file.size, 0)
  let completedBytes = 0
  const succeeded = []
  const failed = []

  for (const { file, key, name, description } of items) {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('name', name ?? '')
    if (description) formData.append('description', description)

    try {
      const { data } = await api.post('/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          const loaded = event.loaded ?? 0
          if (totalBytes) {
            const pct = Math.round(
              ((completedBytes + loaded) * 100) / totalBytes,
            )
            onProgress?.(Math.min(pct, 100))
          }
        },
      })
      succeeded.push({ key, data })
    } catch (err) {
      failed.push({ key, message: err.message })
    } finally {
      // Count this file's bytes toward progress whether it succeeded or not,
      // so the bar keeps advancing across the batch.
      completedBytes += file.size
    }
  }

  return { succeeded, failed }
}

export function useUploadFiles() {
  return useMutation({ mutationFn: uploadFiles })
}
