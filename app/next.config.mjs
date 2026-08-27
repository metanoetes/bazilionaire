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
  // Dev server uses its own dist dir so a production build never clobbers
  // a running dev server (they otherwise share .next and corrupt each other).
  // BAZILIONAIRE_DIST_DIR names it explicitly (dev servers use .next-local so
  // that builds — which may rm -rf .next and .next-dev — can't touch it);
  // BAZILIONAIRE_DEV_DIST is the legacy alias for isolated builds (.next-dev).
  ...(process.env.BAZILIONAIRE_DIST_DIR
    ? { distDir: process.env.BAZILIONAIRE_DIST_DIR }
    : process.env.BAZILIONAIRE_DEV_DIST
      ? { distDir: '.next-dev' }
      : {}),
};

export default nextConfig;
