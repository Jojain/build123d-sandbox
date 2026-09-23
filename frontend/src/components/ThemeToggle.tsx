import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import type { ThemeMode } from "../theme.ts";

interface ThemeToggleProps {
    mode: ThemeMode;
    onToggle: () => void;
    floating?: boolean;
}

function ThemeToggle({ mode, onToggle, floating = false }: ThemeToggleProps) {
    const nextMode = mode === "dark" ? "light" : "dark";

    return (
        <Tooltip title={`Switch to ${nextMode} mode`} placement="left">
            <IconButton
                aria-label={`Switch to ${nextMode} mode`}
                onClick={onToggle}
                size={floating ? "medium" : "small"}
                sx={{
                    ...(floating && {
                        position: "fixed",
                        top: 12,
                        left: 12,
                        zIndex: (theme) => theme.zIndex.tooltip,
                    }),
                    flexShrink: 0,
                    color: "text.primary",
                    backgroundColor: "background.paper",
                    border: 1,
                    borderColor: "divider",
                    boxShadow: 2,
                    "&:hover": {
                        backgroundColor: "action.hover",
                        color: "primary.main",
                    },
                }}
            >
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
        </Tooltip>
    );
}

export default ThemeToggle;
