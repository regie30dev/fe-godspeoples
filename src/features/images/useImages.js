import { useInfiniteQuery } from '@tanstack/react-query'
import { api, API_BASE_URL } from '@/lib/api'

export const PAGE_SIZE = 24

// Raw-image endpoint for a given record — streamed + cacheable on the backend.
export const imageRawUrl = (id) => `${API_BASE_URL}/images/${id}/raw`

// The picture source for a list item: `url` is the /raw endpoint added below;
// `image` covers a raw API record (base64 data URI) if passed directly.
export const imageSrc = (img) => img.url ?? img.image ?? ''

// GET /images?page=&limit= ->
//   { success, data: [...metadata], pagination: { total, page, limit, totalPages, hasNextPage } }
// The list returns metadata only; each picture is loaded from its /raw URL.
async function fetchImages({ pageParam = 1 }) {
  const { data } = await api.get('/images', {
    params: { page: pageParam, limit: PAGE_SIZE },
  })
  return {
    ...data,
    data: (data.data ?? []).map((img) => ({ ...img, url: imageRawUrl(img.id) })),
  }
}

export function useImages() {
  return useInfiniteQuery({
    queryKey: ['images'],
    queryFn: fetchImages,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const p = lastPage.pagination
      if (!p) return undefined
      // Prefer the explicit flag; fall back to page/total math.
      const more = p.hasNextPage ?? p.page * p.limit < p.total
      return more ? p.page + 1 : undefined
    },
  })
}
