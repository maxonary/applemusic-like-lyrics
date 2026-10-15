import { defineConfig } from 'vite';
// Same-origin proxy permits artwork textures in the WebGL renderer without
// requiring permissive CORS headers on the existing metadata service.
export default defineConfig({
  server: { proxy: { '/metadata': {
    target: process.env.METADATA_TARGET || 'http://127.0.0.1:3600',
    ws: true,
    rewrite: path => path.replace(/^\/metadata/, '') || '/',
  } } },
});
