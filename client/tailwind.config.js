import defaultTheme from 'tailwindcss/defaultTheme';

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bgGlobal: 'var(--color-bg-global)',
        bgCard: 'var(--color-bg-card)',
        text: 'var(--color-text)',
        textInverse: 'var(--color-text-inverse)',
        bubbleChat: 'var(--color-bubble-chat)',
        focus: 'var(--color-focus)',
      },
    },
    screens: {
      ...defaultTheme.screens,
    },
  },
  plugins: [],
};
