import { useEffect } from 'react'
import { imageSrc } from '@/features/images/useImages'

// Full-size image overlay. Closes on backdrop click, the X button, or Escape.
export default function Lightbox({ image, onClose }) {
  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  if (!image) return null

  const name = image.name ?? 'Untitled'
  const description = image.description ?? ''

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Content — stop propagation so clicks inside don't close */}
      <figure
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-full max-w-5xl flex-col items-center gap-3"
      >
        <img
          src={imageSrc(image)}
          alt={name}
          className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
        <figcaption className="max-w-2xl text-center">
          <h2 className="text-lg font-semibold text-white">{name}</h2>
          {description && (
            <p className="mt-1 text-sm text-slate-300">{description}</p>
          )}
        </figcaption>
      </figure>
    </div>
  )
}
