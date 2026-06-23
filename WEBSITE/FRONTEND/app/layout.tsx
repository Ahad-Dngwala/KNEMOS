import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { CursorSpotlight } from "@/components/ui/CursorSpotlight";
import { ScrollLine } from "@/components/ui/ScrollLine";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KNEMOS - Semantic Workspace OS",
  description: "AI-Powered Semantic Workspace Operating System",
  icons: {
    icon: "/KNEMOS.png"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-black font-sans">
        <CursorSpotlight />
        <ScrollLine />
        {children}
      </body>
    </html>
  );
}
