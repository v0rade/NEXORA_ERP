import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "NEXORA ERP — Modern Enterprise Resource Planning",
  description:
    "Integrated modular enterprise management system for Sales, Purchasing, Inventory, Finance, Human Resources, and Business Intelligence.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50">
      <body className="h-full text-slate-900 antialiased selection:bg-blue-600 selection:text-white font-sans">
        {children}
      </body>
    </html>
  )
}
