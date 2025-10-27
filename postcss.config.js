export default {
  plugins: {
    "postcss-preset-env": {
      stage: 1, // Enables @property support
      features: {
        "custom-properties": true,
      },
    },
    tailwindcss: {},
    autoprefixer: {},
  },
};
