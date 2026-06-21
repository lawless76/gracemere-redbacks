import { defineConfig } from 'astro/config';

export default defineConfig({
  // Set to 'static' so Astro outputs plain HTML/CSS/JS
  // that Nginx can serve directly — no Node server needed
  output: 'static',
});
