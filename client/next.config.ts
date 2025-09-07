import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'example.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Headers for WebRTC
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration for WebRTC
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },

  // Output configuration
  output: 'standalone',
  
  // Compression
  compress: true,
  
  // Power by header
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,
  
  // SWC minification
  swcMinify: true,
};

export default nextConfig;