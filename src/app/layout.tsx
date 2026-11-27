import type { Metadata } from "next";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Job-agent", template: "%s · Job-agent" },
  description: "Find a job, make a resume for it, and keep track. Nothing is sent unless you say so.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

const themeScript = `try{var t=localStorage.getItem('jobagent-theme');var m=document.querySelector('meta[name="color-scheme"]');if(t==='dark'){document.documentElement.dataset.theme='dark';if(m)m.content='dark'}else if(t==='light'&&m){m.content='light'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
