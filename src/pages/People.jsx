import { usePeople } from '@/features/people/usePeople'

export default function People() {
  const { data, isLoading, isError, error } = usePeople()

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">People</h1>
      <p className="text-sm text-slate-600">
        Example data view backed by{' '}
        <code className="rounded bg-slate-100 px-1.5 py-0.5">GET /people</code>.
        Update <code className="rounded bg-slate-100 px-1.5 py-0.5">usePeople</code>{' '}
        to match your backend.
      </p>

      {isLoading && <p className="text-slate-500">Loading…</p>}

      {isError && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error.message}
        </p>
      )}

      {data && (
        <pre className="overflow-auto rounded-lg border border-slate-200 bg-white p-4 text-sm">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </section>
  )
}
