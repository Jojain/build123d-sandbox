import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import App from "./App.tsx";
import { createAppTheme, type ThemeMode } from "./theme.ts";

const THEME_STORAGE_KEY = "build123d-sandbox-theme";

function getInitialTheme(): ThemeMode {
    try {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === "light" || storedTheme === "dark") {
            return storedTheme;
        }
    } catch {
        // localStorage can be unavailable in privacy-restricted browsers.
    }

    return "light";
}

function Root() {
    const [mode, setMode] = useState<ThemeMode>(getInitialTheme);
    const theme = useMemo(() => createAppTheme(mode), [mode]);

    useEffect(() => {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch {
            // Keep the current session working if persistence is unavailable.
        }
    }, [mode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App
                mode={mode}
                onToggleMode={() =>
                    setMode((current) =>
                        current === "dark" ? "light" : "dark",
                    )
                }
            />
        </ThemeProvider>
    );
}

createRoot(document.getElementById("root")!).render(<Root />);
