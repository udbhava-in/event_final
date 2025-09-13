import React from "react";
import { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { LoadingProvider } from "@/context/LoadingContext";
import { dark, neobrutalism } from "@clerk/themes";
import ClientLayout from "@/client-layout";
import TopBar from "@/components/TopBar/TopBar";

export const metadata: Metadata = {
  title: "UDHBHAVA — The Emergence | Nipe College Tech Fest",
  description:
    "UDHBHAVA — The Emergence is Nipe College’s annual tech fest featuring cutting-edge hackathons, gaming tournaments, and technology showcases in a cyberpunk-inspired atmosphere.",
  keywords: [
    "UDHBHAVA",
    "Nipe College",
    "Tech Fest",
    "Hackathon",
    "Gaming",
    "Technology",
    "Cyberpunk",
  ],
  authors: [{ name: "Nipe College" }],
  icons: {
    icon: "/favicon.ico", // or '/favicon.png', '/icon.svg', etc.
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden ">
        <ClerkProvider
          appearance={{
            baseTheme: [dark],
          }}
        >
          <ConvexClientProvider>
            <LoadingProvider>
              <ClientLayout>
                <TopBar />
                {children}
              </ClientLayout>
            </LoadingProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
