const nextConfig = {
  reactStrictMode: true,
  assetPrefix: "./",
  publicRuntimeConfig: {
    NEXT_PUBLIC_APIURL: process.env.NEXT_PUBLIC_APIURL,
  },
};

module.exports = nextConfig;
