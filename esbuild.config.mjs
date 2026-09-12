import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [resolve(here, 'server/server.ts')],
  outfile: resolve(here, 'server.js'),
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  packages: 'external',
  banner: {
    // Substitui import.meta.url pelo caminho real em runtime (Node ESM)
    js: [
      "import { createRequire as __cr } from 'node:module';",
      "import { fileURLToPath as __ftp } from 'node:url';",
      "import { dirname as __dn } from 'node:path';",
      "const require = __cr(import.meta.url);",
      "const __filename = __ftp(import.meta.url);",
      "const __dirname = __dn(__filename);",
    ].join('\n'),
  },
  loader: { '.sql': 'text' },
}).catch((err) => { console.error(err); process.exit(1); });

console.log('server.js gerado');
