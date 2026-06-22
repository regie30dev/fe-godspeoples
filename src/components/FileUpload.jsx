import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { useUploadFiles } from '@/features/upload/useUploadFiles'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100 MB per file
const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
]
const ACCEPT_ATTR = ACCEPTED_TYPES.join(',')

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

const fileKey = (file) => `${file.name}:${file.size}`

// Default the Name field to the file's base name (without extension).
const baseName = (filename) => filename.replace(/\.[^.]+$/, '')

function validateFile(file) {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `${file.name}: unsupported file type`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: exceeds ${formatBytes(MAX_FILE_SIZE)} limit`
  }
  return null
}

export default function FileUpload() {
  const inputId = useId()
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const prevCountRef = useRef(0)
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isPicking, setIsPicking] = useState(false)
  const [progress, setProgress] = useState(0)
  // Per-file metadata keyed by fileKey: { name, description }.
  const [meta, setMeta] = useState({})
  // Per-file Name validation errors keyed by fileKey.
  const [nameErrors, setNameErrors] = useState({})
  // Per-file server upload errors keyed by fileKey (set after a failed attempt).
  const [uploadErrors, setUploadErrors] = useState({})

  const { mutate, isPending, isError, error, data: result, reset } =
    useUploadFiles()

  const addFiles = useCallback((fileList) => {
    const incoming = Array.from(fileList)
    const nextErrors = []
    const valid = []

    incoming.forEach((file) => {
      const err = validateFile(file)
      if (err) nextErrors.push(err)
      else valid.push(file)
    })

    setErrors(nextErrors)
    setFiles((prev) => {
      // De-duplicate by name + size.
      const seen = new Set(prev.map(fileKey))
      const merged = [...prev]
      valid.forEach((f) => {
        const key = fileKey(f)
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(f)
        }
      })
      return merged
    })
    // Seed metadata for newly added files (default Name to base file name).
    setMeta((prev) => {
      const next = { ...prev }
      valid.forEach((f) => {
        const key = fileKey(f)
        if (!next[key]) next[key] = { name: baseName(f.name), description: '' }
      })
      return next
    })
  }, [])

  const updateMeta = (key, field, value) => {
    setMeta((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
    if (field === 'name') {
      // Clear the error as soon as a non-blank value is typed.
      setNameErrors((prev) => {
        if (!prev[key]) return prev
        if (value.trim()) {
          const next = { ...prev }
          delete next[key]
          return next
        }
        return prev
      })
    }
  }

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      setIsDragging(false)
      if (event.dataTransfer.files?.length) {
        addFiles(event.dataTransfer.files)
      }
    },
    [addFiles],
  )

  const onInputChange = (event) => {
    setIsPicking(false)
    if (event.target.files?.length) addFiles(event.target.files)
    // Reset so selecting the same file again re-triggers change.
    event.target.value = ''
  }

  const openPicker = () => {
    setIsPicking(true)
    inputRef.current?.click()
  }

  // Build square thumbnail previews for image files.
  const previews = useMemo(() => {
    const urls = {}
    files.forEach((f) => {
      if (f.type.startsWith('image/')) urls[fileKey(f)] = URL.createObjectURL(f)
    })
    return urls
  }, [files])

  // Revoke object URLs when previews change or on unmount (avoids leaks).
  useEffect(() => {
    return () => Object.values(previews).forEach((u) => URL.revokeObjectURL(u))
  }, [previews])

  // Auto-scroll the list to the newest entry when files are added.
  useEffect(() => {
    if (files.length > prevCountRef.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
    prevCountRef.current = files.length
  }, [files.length])

  // The native file dialog is modal: when it closes (whether the user picks a
  // file or cancels), focus returns to the window. Use that to clear the
  // spinner — onInputChange handles the "picked a file" case first.
  useEffect(() => {
    if (!isPicking) return
    const clear = () => setIsPicking(false)
    window.addEventListener('focus', clear)
    return () => window.removeEventListener('focus', clear)
  }, [isPicking])

  // Drop a key from each per-file map (meta + both error maps).
  const forgetKey = (key) => {
    const without = (obj) => {
      const next = { ...obj }
      delete next[key]
      return next
    }
    setMeta(without)
    setNameErrors(without)
    setUploadErrors(without)
  }

  const removeFile = (index) => {
    const removed = files[index]
    setFiles((prev) => prev.filter((_, i) => i !== index))
    if (removed) forgetKey(fileKey(removed))
  }

  const clearAll = () => {
    setFiles([])
    setErrors([])
    setMeta({})
    setNameErrors({})
    setUploadErrors({})
    setProgress(0)
    reset()
  }

  const handleUpload = () => {
    if (!files.length) return

    // Name is required for every file — flag any missing/blank entries.
    const nextNameErrors = {}
    files.forEach((f) => {
      const key = fileKey(f)
      if (!meta[key]?.name?.trim()) {
        nextNameErrors[key] = 'Name is required'
      }
    })
    setNameErrors(nextNameErrors)
    if (Object.keys(nextNameErrors).length > 0) return

    setProgress(0)
    setUploadErrors({})
    const items = files.map((f) => {
      const key = fileKey(f)
      const m = meta[key]
      return { file: f, key, name: m.name.trim(), description: m.description.trim() }
    })

    mutate(
      { items, onProgress: setProgress },
      {
        onSuccess: ({ succeeded, failed }) => {
          // Remove uploaded files (and their metadata) from the list…
          const doneKeys = new Set(succeeded.map((s) => s.key))
          setFiles((prev) => prev.filter((f) => !doneKeys.has(fileKey(f))))
          doneKeys.forEach((key) => forgetKey(key))
          // …and surface a per-file error for any that failed, so they remain
          // in the list for the user to retry.
          setUploadErrors(
            Object.fromEntries(failed.map((x) => [x.key, x.message])),
          )
        },
      },
    )
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files. Click to browse or drag and drop."
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openPicker()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        {isPicking ? (
          <>
            <svg
              className="h-10 w-10 animate-spin text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm font-medium text-slate-700">
              Waiting for file selection…
            </p>
          </>
        ) : (
          <>
            <svg
              className="h-10 w-10 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-slate-700">
              <span className="text-blue-600">Click to browse</span> or drag and
              drop
            </p>
            <p className="text-xs text-slate-500">
              PNG, JPG, GIF, WEBP or PDF — up to {formatBytes(MAX_FILE_SIZE)}{' '}
              each
            </p>
          </>
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT_ATTR}
          onChange={onInputChange}
          className="sr-only"
        />
      </div>

      {/* Validation errors */}
      {errors.length > 0 && (
        <ul className="space-y-1 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {errors.map((err) => (
            <li key={err}>{err}</li>
          ))}
        </ul>
      )}

      {/* Selected files */}
      {files.length > 0 && (
        <ul
          ref={listRef}
          className="max-h-96 scroll-smooth divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 bg-white"
        >
          {files.map((file, index) => {
            const key = fileKey(file)
            const entry = meta[key] ?? { name: '', description: '' }
            const nameError = nameErrors[key]
            const uploadError = uploadErrors[key]
            return (
              <li key={key} className="space-y-3 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {/* Square inset preview */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                      {previews[key] ? (
                        <img
                          src={previews[key]}
                          alt={file.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-6 w-6 text-slate-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={isPending}
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50"
                    aria-label={`Remove ${file.name}`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor={`${inputId}-name-${index}`}
                      className="mb-1 block text-xs font-medium text-slate-700"
                    >
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`${inputId}-name-${index}`}
                      type="text"
                      value={entry.name}
                      onChange={(e) => updateMeta(key, 'name', e.target.value)}
                      disabled={isPending}
                      required
                      aria-invalid={Boolean(nameError)}
                      placeholder="Enter a name"
                      className={`w-full rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2 disabled:bg-slate-50 ${
                        nameError
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:border-blue-400 focus:ring-blue-200'
                      }`}
                    />
                    {nameError && (
                      <p className="mt-1 text-xs text-red-600">{nameError}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor={`${inputId}-desc-${index}`}
                      className="mb-1 block text-xs font-medium text-slate-700"
                    >
                      Description
                    </label>
                    <textarea
                      id={`${inputId}-desc-${index}`}
                      rows={3}
                      value={entry.description}
                      onChange={(e) =>
                        updateMeta(key, 'description', e.target.value)
                      }
                      disabled={isPending}
                      placeholder="Optional"
                      className="w-full resize-y rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {uploadError && (
                  <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                    Upload failed: {uploadError}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Progress */}
      {isPending && (
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Batch result summary */}
      {result && result.succeeded.length > 0 && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          Uploaded {result.succeeded.length} image
          {result.succeeded.length === 1 ? '' : 's'}.
          {result.failed.length > 0 &&
            ` ${result.failed.length} failed — see the errors above and retry.`}
        </p>
      )}
      {result && result.succeeded.length === 0 && result.failed.length > 0 && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          All {result.failed.length} upload
          {result.failed.length === 1 ? '' : 's'} failed — see the errors above
          and retry.
        </p>
      )}
      {/* Unexpected (non per-file) error */}
      {isError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!files.length || isPending}
          className="cursor-pointer rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? `Uploading… ${progress}%` : 'Upload'}
        </button>
        {files.length > 0 && !isPending && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
