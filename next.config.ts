import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Permite builds de verificação numa pasta separada
  // (NEXT_DIST_DIR=.next-verify) sem quebrar um `npm run dev` rodando
  distDir: process.env.NEXT_DIST_DIR || '.next',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
}

export default nextConfig
