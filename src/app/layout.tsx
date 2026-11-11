import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { ClerkProvider } from '@clerk/nextjs';
import { shadcn } from '@clerk/ui/themes';
import { ConvexClientProvider } from '@/components/convex-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'TestLab — Learn to think like a tester',
  description:
    'Learn to test real applications, one bug at a time. Interactive lessons, a live playground, and bug hunting challenges.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
          <ClerkProvider appearance={{ theme: shadcn }}>
            {process.env.NEXT_PUBLIC_CONVEX_URL ? (
              <Suspense fallback={<p role="status">Loading your workspace…</p>}>
                <ConvexClientProvider>{children}</ConvexClientProvider>
              </Suspense>
            ) : (
              children
            )}
          </ClerkProvider>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
