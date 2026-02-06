import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // เพิ่ม Custom Transition ของคุณตรงนี้
      transitionProperty: {
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
};
export default config;