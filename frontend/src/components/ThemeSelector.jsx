import { MonitorIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react";
import { THEMES } from "../constants/themes";
import { useThemeStore } from "../store/useThemeStore";

function ThemeSelector() {
    const { theme, setTheme, systemTheme } = useThemeStore();

    // Group themes by type
    const systemThemes = THEMES.filter(t => t.type === 'system' || t.type === 'basic');

    const getThemeIcon = (themeOption) => {
        switch (themeOption.name) {
            case 'system':
                return <MonitorIcon className="size-4" />;
            case 'light':
                return <SunIcon className="size-4" />;
            case 'dark':
                return <MoonIcon className="size-4" />;
            default:
                return <PaletteIcon className="size-4" />;
        }
    };

    const getThemeLabel = (themeOption) => {
        if (themeOption.name === 'system') {
            return `System (${systemTheme})`;
        }
        return themeOption.label;
    };

    return (
        <div className="dropdown dropdown-end">
            {/* DROPDOWN TRIGGER */}
            <button tabIndex={0} className="btn btn-ghost btn-circle">
                <PaletteIcon className="size-5" />
            </button>

            <div
                tabIndex={0}
                className="dropdown-content mt-2 p-1 shadow-2xl bg-base-200 backdrop-blur-lg rounded-2xl
        w-64 border border-base-content/10 z-50 max-h-96 overflow-y-auto
        "
            >
                {/* System & Basic Themes */}
                <div className="px-2 py-1">
                    <div className="text-xs font-semibold text-base-content/60 uppercase tracking-wide mb-1">
                        System & Basic
                    </div>
                    {systemThemes.map((themeOption) => (
                        <button
                            key={themeOption.name}
                            className={`
                w-full px-3 py-2 rounded-lg flex items-center gap-3 transition-colors text-sm
                ${theme === themeOption.name
                                    ? "bg-primary/10 text-primary"
                                    : "hover:bg-base-content/5"
                                }
              `}
                            onClick={() => setTheme(themeOption.name)}
                        >
                            {getThemeIcon(themeOption)}
                            <span className="font-medium">{getThemeLabel(themeOption)}</span>

                            {/* THEME PREVIEW COLORS */}
                            <div className="ml-auto flex gap-1">
                                {themeOption.colors.map((color, i) => (
                                    <span key={i} className="size-2 rounded-full" style={{ backgroundColor: color }} />
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ThemeSelector;