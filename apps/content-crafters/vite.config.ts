import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// @ts-ignore
declare module '@remix-run/node' {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  root: __dirname,
  ssr: {
    noExternal: ["styled-components", "remix-utils", "react-dropzone"],
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    // @ts-ignore
    nxViteTsPaths(),
  ],
});
