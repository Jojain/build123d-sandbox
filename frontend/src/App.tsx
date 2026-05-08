import * as React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import DesktopLayout from "./components/layouts/DesktopLayout.tsx";
import MobileLayout from "./components/layouts/MobileLayout.tsx";
import { defaultCode } from "./components/Editor.tsx";
import { usePythonRuntime } from "./utils/usePythonRuntime.ts";
import { useUrlCode } from "./utils/useUrlCode.ts";

function App() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { modelData, stdout, stderr, isRunning, isReady, runCode, downloadExport } =
        usePythonRuntime();
    const [code, setCode] = useUrlCode(defaultCode);

    if (isMobile) {
        return (
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
            />
        );
    }

    return (
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
        />
    );
}

export default App;
