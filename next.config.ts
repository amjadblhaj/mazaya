import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Excel uploads (F7) are capped at 5MB — the server action body limit
      // has to cover that plus the rest of the multipart form data.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
