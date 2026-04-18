import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SlideSource — The Teleprompter, Perfected.",
  description:
    "SlideSource is a premium teleprompter app for Android. Record professional videos with smooth scrolling scripts, 360° Rotation, camera overlay, and more.",
  keywords: ["teleprompter", "android", "video recording", "slidesource", "prompter app"],
  openGraph: {
    title: "SlideSource — The Teleprompter, Perfected.",
    description:
      "Record professional videos with the most powerful teleprompter app for Android.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#06060E] text-[#F1F1F4]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
