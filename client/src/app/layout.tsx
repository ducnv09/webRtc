import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ApolloProvider } from '../providers/ApolloProvider';
import { AuthProvider } from '../providers/AuthProvider';
import { SocketProvider } from '../providers/SocketProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WebRTC Video Call',
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
              {children}
            </SocketProvider>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}