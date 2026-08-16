import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "sonner"
import { AppProvider } from "@/components/app-provider"
import "./globals.css"

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" })
export const metadata: Metadata = { title: { default: "HireLoop — Recruiting operations", template: "%s | HireLoop" }, description: "A focused recruiting workspace for modern hiring teams.", generator: "v0.app" }
export const viewport: Viewport = { colorScheme: "light", themeColor: "#f5f8ff", width: "device-width", initialScale: 1 }
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className="bg-background"><body className={`${jakarta.variable} font-sans antialiased`}><AppProvider>{children}</AppProvider><Toaster richColors position="top-right"/>{process.env.NODE_ENV==="production"&&<Analytics/>}</body></html>}
