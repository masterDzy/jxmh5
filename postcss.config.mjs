const config = {
  plugins: {
    "postcss-px-to-viewport": {
      viewportWidth: 375, // 设计稿基准宽度 (iPhone 6/7/8)
      viewportHeight: 667,
      unitPrecision: 5,
      viewportUnit: 'vw',
      fontViewportUnit: 'vw',
      selectorBlackList: ['.ignore', '.hairline'],
      minPixelValue: 1,
      mediaQuery: false,
      exclude: [/node_modules/],
    },
    "@tailwindcss/postcss": {},
  },
};

export default config;
