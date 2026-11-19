import type { Metadata } from "next";
import "./globals.css";
import { fraunces, inter } from "./fonts";
import { AnalyticsInit } from "../components/AnalyticsInit";
import { ConsentBanner } from "../components/ConsentBanner";

export const metadata: Metadata = {
  title: "SwipeLearn",
  description: "Learn any topic by swiping through short, Claude-written course cards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body
        className={`${fraunces.variable} ${inter.variable} font-sans min-h-full flex flex-col`}
      >
        <AnalyticsInit />
        {children}
        <ConsentBanner />
      </body>
    </html>
  );
}
