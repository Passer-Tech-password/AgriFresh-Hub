import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgriFresh Hub · Account"
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-10">
      <div className="grid w-full items-stretch gap-6 lg:grid-cols-2">
        <div className="hidden overflow-hidden rounded-3xl border border-forest/25 bg-gradient-to-br from-[#071512] via-[#06110F] to-[#040908] p-10 shadow-lift lg:block">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/25 bg-black/25 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-leaf shadow-[0_0_20px_rgba(74,222,128,0.65)]" />
              Premium Nigerian agri-food marketplace
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
              AgriFresh Hub<span className="text-leaf">.</span>
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-white/70">
              Sign in to manage orders, vendor applications, and your verified freshness
              pipeline.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-forest/25 bg-black/20 p-6 shadow-[0_0_0_1px_rgba(74,222,128,0.10)] backdrop-blur sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

