import type { Metadata } from "next";
import "./globals.css";

const analyticsId = "G-MKCPBJSMV2";

export const metadata: Metadata = {
  title: "Stega_What — Signal Lab",
  description: "A private, arcade-inspired image steganography workspace.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${analyticsId}');`,
          }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
