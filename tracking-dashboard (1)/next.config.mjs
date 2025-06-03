/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization untuk real-time data
  output: 'standalone',
  
  // Allow external images
  images: {
    domains: ['maps.google.com', 'maps.googleapis.com'],
    unoptimized: true,
  },
  
  // Headers untuk CORS jika diperlukan
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
  
  // ESLint dan TypeScript konfigurasi
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
