import type { Metadata } from "next";
import "./globals.css";
import { fraunces, inter } from "./fonts";

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
      >{children}</body>
    </html>
  );
}
