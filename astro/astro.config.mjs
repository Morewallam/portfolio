// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  fonts:[{
    provider: fontProviders.google(),
    name: "Google Sans",
    cssVariable: "--font-google-sans"
  },
  {
    provider: fontProviders.google(),
    name: "Dela Gothic One",
    cssVariable: "--font-dela-gothic"
  }
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [icon()],
});