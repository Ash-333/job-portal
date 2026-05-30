import type { Metadata } from "next";
import { Inter, Urbanist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { SiteLayout } from "@/components/layout/site-layout";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/hooks/use-auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "JobPortal - Find Your Dream Job",
  description: "Connecting talented professionals with amazing opportunities. Find your dream job or discover your next great hire.",
  keywords: ["jobs", "careers", "employment", "hiring", "recruitment"],
  authors: [{ name: "JobPortal Team" }],
  openGraph: {
    title: "JobPortal - Find Your Dream Job",
    description: "Connecting talented professionals with amazing opportunities.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobPortal - Find Your Dream Job",
    description: "Connecting talented professionals with amazing opportunities.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${urbanist.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <ErrorBoundary>
                <SiteLayout>
                  {children}
                </SiteLayout>
              </ErrorBoundary>
            </AuthProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
