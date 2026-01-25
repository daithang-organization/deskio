export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Placeholder login page. Auth flow will be implemented in Sprint 1.
      </p>

      <div className="mt-6 rounded-lg border p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Email</span>
            <span className="text-muted-foreground">—</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Password</span>
            <span className="text-muted-foreground">—</span>
          </div>
        </div>

        <button className="mt-4 w-full rounded-md bg-black px-4 py-2 text-white" type="button">
          Continue (stub)
        </button>
      </div>
    </main>
  );
}
