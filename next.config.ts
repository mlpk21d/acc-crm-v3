import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["pdfkit"],
  outputFileTracingIncludes: {"/api/proposals/*/pdf": ["./node_modules/pdfkit/js/data/*.afm", "./public/images/acc-logo.svg"],"/api/projects/*/report/pdf": ["./node_modules/pdfkit/js/data/*.afm"],
    "/api/projects/*/rooms/pdf": ["./node_modules/pdfkit/js/data/*.afm"],
    "/api/projects/*/jk-cabinets/pdf": ["./node_modules/pdfkit/js/data/*.afm", "./public/images/acc-logo.svg"]},
  experimental: {serverActions: {bodySizeLimit: "27mb"}},
};

export default nextConfig;
