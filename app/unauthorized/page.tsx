import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="rounded-3xl border border-forest/25 bg-black/20 p-8 text-white/70 backdrop-blur">
        <div className="space-y-3">
          <div className="font-display text-2xl font-semibold text-white">Access denied</div>
          <div className="text-sm text-white/60">
            Your account doesn’t have permission to view that page.
          </div>
          <div className="pt-2">
            <Link href="/dashboard" className="font-semibold text-leaf hover:underline">
              Go to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

