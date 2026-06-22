import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import Spinner from '@/components/Spinner'

const navLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-white text-blue-700'
      : 'text-blue-50 hover:bg-blue-500 hover:text-white'
  }`

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-blue-700 bg-blue-600">
        <div className="flex w-full items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-lg font-semibold tracking-tight text-white">
            Gods<span className="text-blue-200">Peoples</span>
          </span>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/people" className={navLinkClass}>
              People
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Suspense
          fallback={
            <div
              role="status"
              aria-label="Loading"
              className="flex justify-center py-20"
            >
              <Spinner className="h-10 w-10 text-blue-600" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  )
}
