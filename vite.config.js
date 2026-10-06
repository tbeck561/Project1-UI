import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// base './' so the build works from any sub-path (e.g. GitHub Pages)
export default defineConfig({ base: './', plugins: [svelte()] });
