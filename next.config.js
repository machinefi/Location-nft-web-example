const nextConfig = {
  reactStrictMode: true,
  assetPrefix: "./",
  publicRuntimeConfig: {
    NEXT_PUBLIC_APIURL: process.env.API_URL,
  },
};

module.exports = nextConfig;
