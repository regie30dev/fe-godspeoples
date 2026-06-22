import { useState } from 'react'
import { imageSrc } from '@/features/images/useImages'

export default function ImageCard({ image, onClick }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)
  const src = imageSrc(image)
  const name = image.name ?? 'Untitled'
  const description = image.description ?? ''

  return (
    <figure
      role="button"
      tabIndex={0}
      aria-label={`View ${name}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className="group relative aspect-2/3 cursor-pointer overflow-hidden rounded-md bg-slate-200 shadow-sm transition-transform duration-300 ease-out hover:z-10 hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Skeleton shimmer until the image loads */}
      {!loaded && !errored && (
        <div className="absolute inset-0 animate-pulse bg-slate-200" />
      )}

      {errored || !src ? (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
          <svg
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Gradient + caption overlay */}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-left">
        <h3 className="truncate text-sm font-semibold text-white">{name}</h3>
        {description && (
          <p className="mt-0.5 line-clamp-2 max-h-0 overflow-hidden text-xs leading-snug text-slate-200 opacity-0 transition-all duration-300 group-hover:max-h-16 group-hover:opacity-100">
            {description}
          </p>
        )}
      </figcaption>
    </figure>
  )
}
