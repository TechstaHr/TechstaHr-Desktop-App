/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./templates/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: '#f8f9fa',
  			foreground: '#212529',
  			card: {
  				DEFAULT: '#ffffff',
  				foreground: '#495057'
  			},
  			popover: {
  				DEFAULT: '#e9ecef',
  				foreground: '#343a40'
  			},
  			primary: {
  				'200': '#99cfff',
  				'300': '#66b2ff',
  				'400': '#3399ff',
  				DEFAULT: '#0d6efd',
  				foreground: '#ffffff'
  			},
  			secondary: {
  				'200': '#d6d8db',
  				'300': '#adb5bd',
  				'400': '#868e96',
  				DEFAULT: '#6c757d',
  				foreground: '#ffffff'
  			},
  			muted: {
  				'200': '#e9ecef',
  				'300': '#dee2e6',
  				'400': '#ced4da',
  				DEFAULT: '#f8f9fa',
  				foreground: '#6c757d'
  			},
  			accent: {
  				'200': '#ffe082',
  				'300': '#ffd54f',
  				'400': '#ffca28',
  				DEFAULT: '#bdbdbd',
  				foreground: '#212529'
  			},
  			destructive: {
  				'200': '#f5b5ba',
  				'300': '#f08086',
  				'400': '#e55361',
  				DEFAULT: '#dc3545',
  				foreground: '#ffffff'
  			},
  			border: '#dee2e6',
  			input: '#ced4da',
  			ring: '#0d6efd',
  			chart: {
  				'1': '#ff6384',
  				'2': '#36a2eb',
  				'3': '#ffcd56',
  				'4': '#4bc0c0',
  				'5': '#9966ff'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			inter: [
  				'var(--font-inter)',
  				'sans-serif'
  			],
  			heading: [
  				'var(--font-heading)',
  				'sans-serif'
  			]
  		},
  		borderRadius: {
  			lg: '16px',
  			md: '12px',
  			sm: '8px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
