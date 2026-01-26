// Suppress Ant Design warnings FIRST before any imports
import '@/utils/suppressAntdWarnings';

import { Roboto, Big_Shoulders_Display } from 'next/font/google';
import './globals.scss';
import 'swiper/css/bundle';
import 'react-photo-view/dist/react-photo-view.css';
import 'nouislider/dist/nouislider.css';
import 'react-circular-progressbar/dist/styles.css';
import AppProvider from '@/contextApi/AppProvider';
import { Toaster } from 'sonner';
import ReduxProvider from '@/redux/provider';
import { VideoProvider } from '@/contextApi/VideoProvider';
import GlobalVideoModal from '@/components/common/popup/GlobalVideoModal';
import { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import AntdProvider from '@/components/providers/AntdProvider';
import CartInitializer from '@/components/providers/CartInitializer';
import SystemStatisticsInitializer from '@/components/providers/SystemStatisticsInitializer';

// Load Roboto font
const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700', '900'],
});

// Load Big Shoulders Display font
const bigShoulders = Big_Shoulders_Display({
  variable: '--font-big-shoulders',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Project base App Development Course',
  description:
    'Master app development with hands-on projects! Enroll in our Project-Based App Development Course to build real-world iOS, Android, and cross-platform apps. Gain practical coding skills, create portfolio-ready projects, and learn from industry experts. Perfect for beginners and intermediates—launch your career in tech today!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="index" />
      </head>
      <body
        suppressHydrationWarning
        className={`body-bg ${roboto.variable} ${bigShoulders.variable}`}
      >
        <VideoProvider>
          <ReduxProvider>
            <NextIntlClientProvider>
              <AntdProvider>
                <AppProvider>
                  <CartInitializer />
                  <SystemStatisticsInitializer />
                  {children}
                </AppProvider>
                <Toaster position="top-center" richColors />
                <GlobalVideoModal />
              </AntdProvider>
            </NextIntlClientProvider>
          </ReduxProvider>
        </VideoProvider>
      </body>
    </html>
  );
}
