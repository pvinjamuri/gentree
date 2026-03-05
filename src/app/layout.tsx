import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { StoreHydration } from "@/components/StoreHydration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gentree - Family Tree Builder",
  description: "Build, share, and print beautiful family trees. Connect with your roots.",
  openGraph: {
    title: "Gentree - Family Tree Builder",
    description: "Build, share, and print beautiful family trees.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <StoreHydration />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
