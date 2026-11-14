import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["pdfkit", "pdfjs-dist"],
  outputFileTracingIncludes: {"/api/door-orders/import": ["./node_modules/pdfjs-dist/legacy/build/*.mjs"], "/api/door-orders/*/pdf": ["./src/features/door-orders/templates/door-order-form.pdf"],"/api/proposals/*/pdf": ["./node_modules/pdfkit/js/data/*.afm", "./public/images/acc-logo.svg"],"/api/projects/*/report/pdf": ["./node_modules/pdfkit/js/data/*.afm"],
    "/api/projects/*/rooms/pdf": ["./node_modules/pdfkit/js/data/*.afm"],
    "/api/projects/*/jk-cabinets/pdf": ["./node_modules/pdfkit/js/data/*.afm", "./public/images/acc-logo.svg"]},
  experimental: {serverActions: {bodySizeLimit: "27mb"}},
};

export default nextConfig;
