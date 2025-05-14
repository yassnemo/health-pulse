/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-background': '#F8F9FA', // Light gray background
        'theme-panel': '#FFFFFF',      // White for cards/panels
        'theme-border': '#E2E8F0',      // Light gray border (Tailwind gray-300)
        
        'theme-primary-accent': '#3B82F6', // A calm blue (Tailwind blue-500)
        'theme-primary-hover': '#2563EB', // Darker blue for hover (Tailwind blue-600)

        'theme-text-primary': '#1A202C',   // Dark gray for main text (Tailwind gray-800)
        'theme-text-secondary': '#4A5568', // Medium gray for secondary text (Tailwind gray-700)
        'theme-text-link': '#3B82F6',       // Link color

        'theme-success': '#10B981',      // Tailwind emerald-500
        'theme-warning': '#F59E0B',      // Tailwind amber-500
        'theme-danger': '#EF4444',       // Tailwind red-500

        // Keeping your original primary/secondary for now, but new theme-* colors will take precedence
        primary: {
          50: '#eef9ff',
          100: '#dcf2ff',
          200: '#b2e8ff',
          300: '#78d9ff',
          400: '#3bc2ff',
          500: '#12a5f1',
          600: '#0284c7',
          700: '#016aa6',
          800: '#055781',
          900: '#0a4a6d',
        },
        secondary: { // Define all shades to avoid Tailwind errors if a shade is called that doesn't exist
          50: '#f6f9fd',
          100: '#edf4fa',
          200: '#dce9f6',
          300: '#c2d9ef',
          400: '#a2c3e7',
          500: '#7daedc',
          600: '#6092c7',
          700: '#4f7ab5',
          800: '#436595',
          900: '#3a5579'
        },
        accent: { // Define all shades
          50: '#f3f1ff',
          100: '#e9e6ff',
          200: '#d8d2ff',
          300: '#bfb6ff',
          400: '#a493ff',
          500: '#8a70ff',
          600: '#7b5bff',
          700: '#6a48ff',
          800: '#5838ff',
          900: '#4f2fff'
        },
        danger: { // Define all shades
          50: '#fff1f2',
          100: '#ffe0e3',
          200: '#ffcdd2',
          300: '#ffb0b9',
          400: '#ff8997',
          500: '#f53a54', // This was your original
          600: '#ef4444', // theme-danger
          700: '#d1203a',
          800: '#b31c31',
          900: '#9b1c2d'
        },
        // Add success, warning if not fully defined from original theme
        success: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e', // theme-success is 10B981 (emerald-500)
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d'
        },
        warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b', // theme-warning
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f'
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px 0 rgba(0, 0, 0, 0.04)', // Softer shadow
        'panel': '0 2px 4px 0 rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
