import type { Metadata } from "next";
import { Source_Sans_3 } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source" });

export const metadata: Metadata = {
  title: "Job-agent",
  description: "Find a job, make a resume for it, and keep track. Nothing is sent unless you say so.",
};

const themeScript = `try{var t=localStorage.getItem('jobagent-theme');if(t==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
