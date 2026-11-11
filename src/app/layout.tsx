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
          <ClerkProvider
            appearance={{
              theme: shadcn,
              variables: {
                colorBackground: 'var(--surface)',
                colorForeground: 'var(--text)',
                colorInput: 'var(--surface)',
                colorInputForeground: 'var(--text)',
                colorMuted: 'var(--soft)',
                colorMutedForeground: 'var(--auth-muted)',
                colorNeutral: 'var(--text)',
                colorBorder: 'var(--line)',
                colorPrimary: 'var(--auth-primary)',
                colorPrimaryForeground: 'var(--auth-primary-foreground)',
                colorDanger: 'var(--auth-danger)',
                colorRing: 'var(--auth-primary)',
                colorModalBackdrop: 'rgba(18, 24, 18, 0.64)',
                fontFamily: 'var(--font-geist-sans), Arial, sans-serif',
                fontWeight: { normal: 400, medium: 500, semibold: 600, bold: 700 },
                borderRadius: '0.625rem',
              },
              elements: {
                cardBox: {
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '1rem',
                  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)',
                  overflow: 'hidden',
                },
                card: { backgroundColor: 'var(--surface)' },
                popoverBox: {
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.24)',
                },
                modalBackdrop: { backdropFilter: 'blur(4px)' },
                footer: { backgroundColor: 'var(--soft)', backgroundImage: 'none' },
                socialButtonsBlockButton: {
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--line)',
                  color: 'var(--text)',
                },
              },
            }}
          >
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
