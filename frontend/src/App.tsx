import * as React from "react";
import Editor from "./components/Editor.tsx";
import Viewer from "./components/Viewer.tsx";
import PythonOutput from "./components/PythonOutput.tsx";
import DraggableSeparator from "./components/DraggableSeparator.tsx";
import Box from "@mui/material/Box";
import { usePythonRuntime } from "./utils/usePythonRuntime.ts";

function App() {
    const defaultCode = `from ocp_vscode import show
from build123d import Box
show(Box(1,1,1))`;

    const [code, setCode] = React.useState(defaultCode);
    const [leftPanelWidth, setLeftPanelWidth] = React.useState(35); // percentage
    const [editorHeight, setEditorHeight] = React.useState(70); // percentage

    const {
        modelData,
        stdout,
        stderr,
        isRunning,
        isReady,
        runCode,
        clearOutput,
    } = usePythonRuntime();

    const handleResize = React.useCallback((newLeftPercentage: number) => {
        setLeftPanelWidth(newLeftPercentage);
    }, []);

    const handleVerticalResize = React.useCallback(
        (newEditorPercentage: number) => {
            setEditorHeight(newEditorPercentage);
        },
        []
    );

    return (
        <Box // Horizontal container
            sx={{
                display: "flex",
                flexDirection: "row",
                height: "100vh",
                width: "100vw",
                boxSizing: "border-box",
                overflow: "hidden",
                margin: 0,
                padding: 0,
            }}
        >
            <Box // Left panel
                sx={{
                    width: `${leftPanelWidth}%`,
                    minWidth: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                }}
            >
                <Box // Editor container
                    sx={{
                        height: `${editorHeight}%`,
                        minHeight: 0,
                        flexShrink: 0,
                    }}
                >
                    <Editor
                        value={code}
                        onChange={setCode}
                        isReady={isReady}
                        runCode={(code) => {
                            clearOutput();
                            return runCode(code);
                        }}
                    />
                </Box>

                <DraggableSeparator
                    onResize={handleVerticalResize}
                    currentPercentage={editorHeight}
                    minPercentage={30}
                    maxPercentage={90}
                    orientation="vertical"
                />

                <Box // PythonOutput container
                    sx={{
                        height: `${100 - editorHeight}%`,
                        minHeight: 0,
                        flexShrink: 0,
                    }}
                >
                    <PythonOutput
                        stdout={stdout}
                        stderr={stderr}
                        isRunning={isRunning}
                    />
                </Box>
            </Box>

            <DraggableSeparator
                onResize={handleResize}
                currentPercentage={leftPanelWidth}
                minPercentage={20}
                maxPercentage={80}
                orientation="horizontal"
            />

            <Box // Viewer container
                sx={{
                    width: `${100 - leftPanelWidth}%`,
                    height: "100%",
                    flexShrink: 0,
                }}
            >
                <Viewer modelData={modelData} />
            </Box>
        </Box>
    );
}

export default App;
