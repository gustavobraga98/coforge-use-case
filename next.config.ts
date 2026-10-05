import type { NextConfig } from 'next'

const apiUrl = process.env.FASTAPI_URL ?? 'http://127.0.0.1:8000'

const nextConfig: NextConfig = {
  experimental: { useTypeScriptCli: false },
  async rewrites() {
    return [
      { source: '/api/map/:path*', destination: `${apiUrl}/api/map/:path*` },
      { source: '/api/locations/:path*', destination: `${apiUrl}/api/locations/:path*` },
    ]
  },
}

export default nextConfig
