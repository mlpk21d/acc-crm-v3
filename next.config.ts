import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {"/api/projects/*/rooms/pdf": ["./node_modules/pdfkit/js/data/*.afm"],
    "/api/projects/*/jk-cabinets/pdf": ["./node_modules/pdfkit/js/data/*.afm", "./public/images/acc-logo.svg"]},
  experimental: {serverActions: {bodySizeLimit: "6mb"}},
};

export default nextConfig;
