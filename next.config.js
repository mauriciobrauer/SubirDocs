/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para producción
  output: 'standalone',
  
  // Optimizaciones de imágenes
  images: {
    domains: ['dl.dropboxusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },

  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
