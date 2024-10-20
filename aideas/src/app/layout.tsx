import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import QueryClientProvider from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import NextAuthProvider from "@/components/session-provider";
import CSPostHogProvider from "@/lib/posthog-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AIdeas",
  description: "AIdeas is a chatbot that helps you generate ideas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CSPostHogProvider>
          <QueryClientProvider>
            <NextAuthProvider>
              {children}
              <Toaster />
            </NextAuthProvider>
          </QueryClientProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
