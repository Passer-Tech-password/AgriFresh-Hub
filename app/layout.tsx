import type { Metadata } from "next";
import { Toaster } from "sonner";

import { AuthListener } from "@/components/auth-listener";
import { ThemeProvider } from "@/components/theme-provider";
import { ProPlanModal } from "@/components/pro-plan-modal";
import { Footer } from "@/components/footer";

import "./globals.css";

export const metadata: Metadata = {
  title: "AgriFresh Hub",
  description: "Premium Nigerian agri-food marketplace",
  manifest: "/manifest.json"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-dvh font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <AuthListener />
          <ProPlanModal />
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </div>
          <Toaster
            theme="system"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  "border border-forest/30 bg-[#071512]/90 text-white shadow-lift backdrop-blur",
                title: "font-medium",
                description: "text-white/70"
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
