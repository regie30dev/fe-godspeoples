import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <section className="space-y-4 text-center">
      <h1 className="text-[52px] font-bold tracking-tight">
        Welcome to GodsPeoples
      </h1>
      <p className="mx-auto max-w-prose text-justify text-slate-600">
        This is the frontend for the GodsPeoples project. It is wired up with
        React Router, TanStack Query, Axios, and Tailwind CSS, ready to consume
        the backend APIs.
      </p>
      <p className="mx-auto max-w-prose text-3xl font-bold text-[gold]">
        Enter and be &lsquo;humbled&rsquo; by God
      </p>
      <div className="mt-10">
        <button
          type="button"
          onClick={() => navigate('/upload')}
          className="cursor-pointer rounded-md bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          ENTER
        </button>
      </div>
    </section>
  )
}
