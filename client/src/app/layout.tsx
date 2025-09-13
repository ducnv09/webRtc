import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloProvider } from '../providers/ApolloProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { SocketProvider } from '../providers/SocketProvider';
import { NavigationProvider } from '../providers/NavigationProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Video Call',
  description: 'Video calling application like Google Meet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ApolloProvider>
          <AuthProvider>
            <SocketProvider>
              <NavigationProvider>
                {children}
              </NavigationProvider>
            </SocketProvider>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}