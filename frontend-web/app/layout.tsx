import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans, Poppins } from "next/font/google";
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

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "TomTrade - Trading Platform",
  description: "Professional trading platform with real-time data and portfolio management",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${poppins.variable} antialiased`}>
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

