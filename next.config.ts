import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pretalx.com",
        pathname: "/media/avatars/**",
      },
    ],
  },
};

export default nextConfig;
