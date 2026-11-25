import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display-family" });
const text = Source_Sans_3({ subsets: ["latin"], variable: "--font-text" });

export const metadata: Metadata = {
  title: { default: "Job-agent", template: "%s · Job-agent" },
  description: "Find a job, make a resume for it, and keep track. Nothing is sent unless you say so.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

const themeScript = `try{var t=localStorage.getItem('jobagent-theme');if(t==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
