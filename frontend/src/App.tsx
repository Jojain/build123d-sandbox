import * as React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import DesktopLayout from "./components/layouts/DesktopLayout.tsx";
import MobileLayout from "./components/layouts/MobileLayout.tsx";
import { defaultCode } from "./components/Editor.tsx";
import { usePythonRuntime } from "./utils/usePythonRuntime.ts";
import { useUrlCode } from "./utils/useUrlCode.ts";
import type { ThemeMode } from "./theme.ts";

function App({
    mode,
    onToggleMode,
}: {
    mode: ThemeMode;
    onToggleMode: () => void;
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const {
        modelData,
        stdout,
        stderr,
        isRunning,
        isReady,
        runCode,
        downloadExport,
    } = usePythonRuntime();
    const [code, setCode] = useUrlCode(defaultCode);

    const layout = isMobile ? (
        <MobileLayout
            modelData={modelData}
            stdout={stdout}
            stderr={stderr}
            isRunning={isRunning}
            isReady={isReady}
            code={code}
            setCode={setCode}
            runCode={runCode}
            downloadExport={downloadExport}
            theme={mode}
            onToggleMode={onToggleMode}
        />
    ) : (
        <DesktopLayout
            modelData={modelData}
            stdout={stdout}
            stderr={stderr}
            isRunning={isRunning}
            isReady={isReady}
            code={code}
            setCode={setCode}
            runCode={runCode}
            downloadExport={downloadExport}
            theme={mode}
            onToggleMode={onToggleMode}
        />
    );

    return layout;
}

export default App;
