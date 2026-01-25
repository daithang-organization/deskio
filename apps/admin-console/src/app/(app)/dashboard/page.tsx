import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            App shell ready. Feature implementation starts from Sprint 1.
          </p>
        </div>

        <Link className="text-sm underline" href="/login">
          Login
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Module</div>
          <div className="mt-1 font-medium">Tickets</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Module</div>
          <div className="mt-1 font-medium">Knowledge Base</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-muted-foreground">Module</div>
          <div className="mt-1 font-medium">Settings</div>
        </div>
      </div>
    </main>
  );
}
