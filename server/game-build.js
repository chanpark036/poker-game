const { build } = require('esbuild')
const esbuildPluginPino = require('esbuild-plugin-pino')

build({
  entryPoints: ['game/server.ts'],
  outdir: 'dist', // MAKE SEPARATE DIST FOR GAME AND SITE
  platform: 'node',
  format: 'cjs',
  bundle: true,
  plugins: [esbuildPluginPino({ transports: ['pino-pretty'] })],
}).catch(() => process.exit(1))