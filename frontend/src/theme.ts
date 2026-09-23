import { createTheme, type PaletteMode } from "@mui/material/styles";

export type ThemeMode = PaletteMode;

export function createAppTheme(mode: ThemeMode) {
    const isDark = mode === "dark";

    return createTheme({
        palette: {
            mode,
            primary: {
                main: isDark ? "#a78bfa" : "#7c3aed",
                light: isDark ? "#c4b5fd" : "#9f67f3",
                dark: isDark ? "#7c5ac7" : "#5b21b6",
                contrastText: isDark ? "#1f1538" : "#ffffff",
            },
            secondary: {
                main: isDark ? "#2dd4bf" : "#0f766e",
                light: isDark ? "#6ee7d8" : "#20a095",
                dark: isDark ? "#159e90" : "#0a514c",
                contrastText: isDark ? "#062e2c" : "#ffffff",
            },
            warning: {
                main: isDark ? "#f4b860" : "#b86600",
                light: isDark ? "#ffd18a" : "#d88f2d",
                dark: isDark ? "#c2822d" : "#7c4500",
                contrastText: isDark ? "#2b1a06" : "#ffffff",
            },
            background: {
                default: isDark ? "#151b26" : "#f4f6fa",
                paper: isDark ? "#151b26" : "#f4f6fa",
            },
            text: {
                primary: isDark ? "#edf2fb" : "#172033",
                secondary: isDark ? "#aab7ca" : "#536176",
            },
            divider: isDark ? "#344052" : "#d8deea",
            action: {
                hover: isDark
                    ? "rgba(167, 139, 250, 0.14)"
                    : "rgba(124, 58, 237, 0.08)",
                selected: isDark
                    ? "rgba(167, 139, 250, 0.2)"
                    : "rgba(124, 58, 237, 0.12)",
            },
            success: {
                main: isDark ? "#65c98b" : "#21854d",
            },
            error: {
                main: isDark ? "#ff8585" : "#c63737",
            },
        },
        typography: {
            fontFamily:
                'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            button: {
                fontWeight: 700,
            },
        },
        shape: {
            borderRadius: 8,
        },
        components: {
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: "none",
                    },
                },
            },
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: {
                        transition:
                            "background-color 160ms ease, color 160ms ease",
                    },
                },
            },
        },
    });
}
