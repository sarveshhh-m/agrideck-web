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
  title: "Agrideck - Agricultural Marketplace",
  description: "A marketplace connecting farmers and buyers for agricultural produce. Buy and sell farm products directly.",
  keywords: ["agriculture", "marketplace", "farmers", "buyers", "farm products", "agricultural produce"],
  authors: [{ name: "Agrideck" }],
  openGraph: {
    title: "Agrideck - Agricultural Marketplace",
    description: "A marketplace connecting farmers and buyers for agricultural produce",
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
