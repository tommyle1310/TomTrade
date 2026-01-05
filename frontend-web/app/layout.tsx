import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ApolloProvider } from "@/components/providers/ApolloProvider";
import { I18nProvider } from "@/components/providers/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TomTrade - Trading Platform",
  description: "Professional trading platform with real-time data and portfolio management",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ApolloProvider>
          <AuthProvider>
            <I18nProvider>
              <AppShell>{children}</AppShell>
            </I18nProvider>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}

