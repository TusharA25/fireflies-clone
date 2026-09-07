import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Firefiles — Meeting Notes & Transcription",
  description: "AI-powered meeting notes, transcripts, and intelligence platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased selection:bg-violet-500/30 selection:text-violet-200">
        <ToastProvider>
          <div className="min-h-screen bg-zinc-950 text-white">
            {children}
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
