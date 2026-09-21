import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://onlook-style-map.fond-koi-6368.chatgpt.site'),
  title: 'onlook° — Style, where it happens',
  description:
    'Discover street style near you, rate looks, and find the places where personal style comes alive.',
  openGraph: {
    title: 'onlook° — Style, where it happens',
    description:
      'Discover street style near you, rate looks, and find the places where personal style comes alive.',
    images: [{ url: '/og.png', width: 1729, height: 910, alt: 'onlook° — Style, where it happens.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'onlook° — Style, where it happens',
    description: 'Discover street style, rate looks, and pin the places that make the fit.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
