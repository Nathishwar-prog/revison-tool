import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { WelcomeTour } from "@/components/WelcomeTour";

export const metadata: Metadata = {
  title: "KnowGrow",
  description: "KnowGrow AI Tutor",
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 min-h-screen flex flex-col transition-colors duration-300">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <MobileBottomNav />
          <WelcomeTour />
        </AuthProvider>
      </body>
    </html>
  );
}
