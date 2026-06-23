import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/downloads/KNEMOS-Setup.exe',
        destination: 'https://github.com/Ahad-Dngwala/KnemOS/releases/download/KNEMOSv1.0.0/KNEMOS_1.0.0_x64-setup.exe',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
