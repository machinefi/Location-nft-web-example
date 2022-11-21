const nextConfig = {
  reactStrictMode: true,
  assetPrefix: "./",
  publicRuntimeConfig: {
    API_URL: process.env.API_URL,
  },
};

module.exports = nextConfig;
