import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/downloads/KNEMOS-Setup.exe',
        destination: 'https://github.com/Ahad-Dngwala/KnemOS/releases/download/v1.0.0/KNEMOS-Setup.exe',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
