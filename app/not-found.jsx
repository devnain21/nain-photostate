import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm font-semibold text-slate-500 shadow-sm">
        404
      </span>
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="max-w-xl text-slate-600">
        Jo page aap dhoondh rahe hain woh ab is route par available nahi hai.
      </p>
      <Link
        href="/"
        className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Back to home
      </Link>
    </div>
  )
}