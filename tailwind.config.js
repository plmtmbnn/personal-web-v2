/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  
  // Enable JIT mode for faster builds
  mode: 'jit',
  
  // Optimize for production
  ...(process.env.NODE_ENV === 'production' ? {
    purge: {
      enabled: true,
      content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./features/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
      ],
      safelist: {
        standard: [
          /^bg-/,
          /^text-/,
          /^border-/,
          /^rounded-/,
          /^p-/,
          /^m-/,
          /^gap-/,
          /^flex-/,
          /^grid-/,
        ],
      },
    },
  } : {}),
  
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
      },
      fontFamily: {
        // Add your custom fonts here
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/typography'),
  ],
};