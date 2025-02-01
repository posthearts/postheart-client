export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      stage: 1,
      features: {
        'nesting-rules': true
      }
    }
  },
}
