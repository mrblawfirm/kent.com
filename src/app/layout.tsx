import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MRB Law Firm - Expert Legal Services',
  description: 'MRB Law Firm provides expert legal representation across corporate law, litigation, estate planning, real estate, family law, and criminal defense. Schedule a consultation today.',
  keywords: 'law firm, legal services, attorney, lawyer, corporate law, litigation, estate planning, real estate law, family law, criminal defense',
  authors: [{ name: 'MRB Law Firm' }],
  creator: 'MRB Law Firm',
  publisher: 'MRB Law Firm',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'MRB Law Firm - Expert Legal Services',
    description: 'Professional legal representation with innovative case management and seamless client communication.',
    url: '/',
    siteName: 'MRB Law Firm',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'MRB Law Firm',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MRB Law Firm - Expert Legal Services',
    description: 'Professional legal representation with innovative case management and seamless client communication.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
      </head>
      <body className={`${inter.className} bg-black text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}