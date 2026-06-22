import { useEffect, useRef, useState } from 'react'
import { useImages, PAGE_SIZE } from '@/features/images/useImages'
import ImageCard from '@/components/ImageCard'
import Lightbox from '@/components/Lightbox'

const gridClass =
  'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

function SkeletonGrid({ count }) {
  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-2/3 animate-pulse rounded-md bg-slate-200" />
      ))}
    </div>
  )
}

export default function People() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useImages()

  const [selected, setSelected] = useState(null)

  // Infinite scroll: load the next page when the sentinel scrolls into view.
  const sentinelRef = useRef(null)
  useEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '400px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const images = data?.pages.flatMap((p) => p.data ?? []) ?? []

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">People</h1>
        <p className="text-sm text-slate-600">
          Browse the GodsPeoples image gallery.
        </p>
      </header>

      {/* Initial loading */}
      {isLoading && <SkeletonGrid count={PAGE_SIZE} />}

      {/* Error */}
      {isError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {/* Empty */}
      {!isLoading && !isError && images.length === 0 && (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No images yet.
        </p>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <div className={gridClass}>
          {images.map((image, i) => (
            <ImageCard
              key={image.id ?? i}
              image={image}
              onClick={() => setSelected(image)}
            />
          ))}
        </div>
      )}

      {/* Sentinel + next-page loading */}
      {hasNextPage && <div ref={sentinelRef} className="h-px" />}
      {isFetchingNextPage && <SkeletonGrid count={6} />}

      {selected && (
        <Lightbox image={selected} onClose={() => setSelected(null)} />
      )}
    </section>
  )
}
