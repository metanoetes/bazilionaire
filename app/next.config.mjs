/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@bazilionaire/engine'],
  experimental: {
    extensionAlias: {
      '.js': ['.ts', '.tsx', '.js'],
    },
  },
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
