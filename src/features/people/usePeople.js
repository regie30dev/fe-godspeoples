import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

// Example data hook — adjust the endpoint to match the GodsPeoples backend.
async function fetchPeople() {
  const { data } = await api.get('/people')
  return data
}

export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: fetchPeople,
  })
}
