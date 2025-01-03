import type { Metadata } from "next";
import "./globals.css";
import Layout from "./components/Layout";
import { Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: "TicketFlow",
  description: "AI-Powered Project Management",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} font-sans bg-gray-50/50`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}