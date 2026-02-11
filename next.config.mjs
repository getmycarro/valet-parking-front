/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Redirect old Spanish routes to new English routes
      {
        source: '/login/encargado',
        destination: '/login/attendant',
        permanent: true,
      },
      {
        source: '/encargado/:path*',
        destination: '/attendant/:path*',
        permanent: true,
      },
      {
        source: '/admin/encargados',
        destination: '/admin/employees',
        permanent: true,
      },
      {
        source: '/admin/facturacion',
        destination: '/admin/billing',
        permanent: true,
      },
      {
        source: '/admin/historial',
        destination: '/admin/history',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
