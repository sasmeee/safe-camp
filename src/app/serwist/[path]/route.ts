import { createSerwistRoute } from "@serwist/turbopack";

// new id every build so the cache refreshes
const revision = crypto.randomUUID();

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } =
  createSerwistRoute({
    additionalPrecacheEntries: [{ url: "/", revision }],
    swSrc: "src/app/sw.ts",
    useNativeEsbuild: true,
  });
