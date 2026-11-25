import type { Metadata } from "next";
import { Newsreader, Outfit } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: "Job-agent",
  description: "Apply for jobs with a tailored resume, a tracker, and messages you approve before they go out.",
};

const themeScript = `try{var t=localStorage.getItem('jobagent-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.dataset.theme='dark'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${newsreader.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
