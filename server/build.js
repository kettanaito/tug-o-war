import { fileURLToPath } from 'node:url'
import { buildSync } from 'esbuild'
import pkgJson from '../package.json' with { type: "json" };

buildSync({
  entryPoints: [fileURLToPath(new URL('./index.ts', import.meta.url))],
  outdir: fileURLToPath(new URL('./build', import.meta.url)),
  platform: 'node',
  format: 'esm',
  bundle: true,
  external: Object.keys({
    ...(pkgJson.dependencies || {}),
    ...(pkgJson.devDependencies || {}),
  }),
  define: {
    'process.env.BUILD_PATH': JSON.stringify('../../build/index.js'),
    'process.env.WATCH_PATH': JSON.stringify('../../build/version.txt'),
  }
})
