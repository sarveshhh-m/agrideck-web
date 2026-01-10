import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://agrideck.com'),
  title: "Agrideck - For Next Generation Farmers",
  description: "Check daily mandi prices, list your produce, negotiate with buyers, and close deals. Agricultural marketplace for modern farmers.",
  keywords: ["agriculture", "marketplace", "farmers", "buyers", "farm products", "agricultural produce"],
  authors: [{ name: "Agrideck" }],
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: "Agrideck - Agricultural Marketplace",
    description: "A marketplace connecting farmers and buyers for agricultural produce",
    type: "website",
    images: ['/icon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
