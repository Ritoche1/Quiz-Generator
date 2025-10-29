/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Expose the VERSION env var to the browser so client components can read it
  env: {
    VERSION: process.env.VERSION || 'dev',
  },
};

export default nextConfig;
