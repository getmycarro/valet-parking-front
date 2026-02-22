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
      // Old role-based login pages redirect to unified login
      {
        source: "/login/admin",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/login/attendant",
        destination: "/login",
        permanent: true,
      },
      {
        source: "/login/encargado",
        destination: "/login",
        permanent: true,
      },
      // Redirect old Spanish routes to new English routes
      {
        source: "/encargado/:path*",
        destination: "/attendant/:path*",
        permanent: true,
      },
      {
        source: "/admin/encargados",
        destination: "/admin/employees",
        permanent: true,
      },
      {
        source: "/admin/facturacion",
        destination: "/admin/billing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
