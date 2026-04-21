// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/blobs',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: { limitInputPixels: false },
    },
  },
});
