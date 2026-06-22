import FileUpload from '@/components/FileUpload'

export default function Upload() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Upload files</h1>
        <p className="text-sm text-slate-600">
          Add files to send to the GodsPeoples backend.
        </p>
      </header>
      <FileUpload />
    </section>
  )
}
