import {defineConfig} from 'vite';
export default defineConfig({base:'./',build:{target:'es2022',chunkSizeWarningLimit:1600,rollupOptions:{output:{manualChunks(id){if(id.includes('node_modules/three/')||id.includes('@react-three/'))return 'graphics';if(id.includes('node_modules/react'))return 'react';}}}}});
