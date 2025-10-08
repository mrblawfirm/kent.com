/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['storage.googleapis.com', 'placehold.co'],
    unoptimized: false,
  },
  env: {
    CUSTOM_KEY: 'my-value',
  },
  async redirects() {
    return [
      {
        source: '/signin.html',
        destination: '/appointment',
        permanent: true,
      },
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig