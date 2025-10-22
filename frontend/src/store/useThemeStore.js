import { create } from 'zustand';

// Helper function to detect system theme
const getSystemTheme = () => {
	return window.matchMedia('(prefers-color-scheme: dark)').matches
		? 'dark'
		: 'light';
};

// Helper function to get effective theme (resolves 'system' to actual theme)
const getEffectiveTheme = (theme, systemTheme) => {
	if (theme === 'system') {
		return systemTheme;
	}
	return theme;
};

export const useThemeStore = create((set, get) => ({
	theme: localStorage.getItem('cafe-theme') || 'system',
	systemTheme: getSystemTheme(),
	effectiveTheme: getEffectiveTheme(
		localStorage.getItem('cafe-theme') || 'system',
		getSystemTheme(),
	),

	setTheme: theme => {
		const { systemTheme } = get();
		const newEffectiveTheme = getEffectiveTheme(theme, systemTheme);
		localStorage.setItem('cafe-theme', theme);
		set({ theme, effectiveTheme: newEffectiveTheme });
	},

	setSystemTheme: systemTheme => {
		const { theme } = get();
		const newEffectiveTheme = getEffectiveTheme(theme, systemTheme);
		set({ systemTheme, effectiveTheme: newEffectiveTheme });
	},

	// Get the actual theme that should be applied
	getEffectiveTheme: () => {
		const { effectiveTheme } = get();
		return effectiveTheme;
	},

	// Initialize system theme listener
	initSystemThemeListener: () => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const handleChange = e => {
			const newSystemTheme = e.matches ? 'dark' : 'light';
			get().setSystemTheme(newSystemTheme);
		};

		// Listen for changes
		mediaQuery.addEventListener('change', handleChange);

		// Return cleanup function
		return () => {
			mediaQuery.removeEventListener('change', handleChange);
		};
	},
}));
