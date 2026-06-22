import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="space-y-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight">404</h1>
      <p className="text-slate-600">This page could not be found.</p>
      <Link
        to="/"
        className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Back home
      </Link>
    </section>
  )
}
