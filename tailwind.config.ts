import type { Config } from 'tailwindcss'

export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                card: 'var(--card)',
                'card-foreground': 'var(--card-foreground)',
                input: 'var(--input)',
                border: 'var(--border)',
                ring: 'var(--ring)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    hard: 'var(--primary-hard)',
                    foreground: 'var(--primary-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive)',
                    foreground: 'var(--destructive-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                chart: {
                    1: 'var(--chart-1)',
                    2: 'var(--chart-2)',
                    3: 'var(--chart-3)',
                    4: 'var(--chart-4)',
                    5: 'var(--chart-5)',
                },
            },
            borderRadius: {
                sm: 'calc(0.625rem - 4px)',
                md: 'calc(0.625rem - 2px)',
                lg: '0.625rem',
                xl: 'calc(0.625rem + 4px)',
            },
            fontFamily: {
                sans: ['Geist', 'Geist Fallback', 'system-ui', 'sans-serif'],
                mono: ['Geist Mono', 'Geist Mono Fallback', 'monospace'],
            },
        },
    },
    plugins: [],
} satisfies Config
