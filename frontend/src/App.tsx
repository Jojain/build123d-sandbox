import * as React from "react";
import Editor from "./components/Editor.tsx";
import Viewer from "./components/Viewer.tsx";
import PythonOutput from "./components/PythonOutput.tsx";
import DraggableSeparator from "./components/DraggableSeparator.tsx";
import Box from "@mui/material/Box";
import { PythonRuntime } from "./utils/PythonRuntime.ts";

function App() {
    const defaultCode = `from ocp_vscode import show
from build123d import Box
show(Box(1,1,1))`;

    const [code, setCode] = React.useState(defaultCode);
    const [modelData, setModelData] = React.useState();
    const [renderKey, setRenderKey] = React.useState(0);
    const [stdout, setStdout] = React.useState("");
    const [stderr, setStderr] = React.useState("");
    const [isRunning, setIsRunning] = React.useState(false);
    const [leftPanelWidth, setLeftPanelWidth] = React.useState(35); // percentage

    const [pythonRuntime] = React.useState(() => {
        const runtime = new PythonRuntime();
        // Override the sendDataToJs method to update model data
        runtime.sendDataToJs = (data: any, msg_type: string) => {
            console.log("Received data from Python:", data, msg_type);
            if (msg_type === "DATA") {
                setModelData(data);
                // Increment render key to force re-render
                setRenderKey((prev) => prev + 1);
            }
        };

        // Set up output callback to accumulate output
        runtime.setOutputCallback((newStdout: string, newStderr: string) => {
            setStdout(newStdout);
            setStderr(newStderr);
            console.log(newStdout, newStderr);
        });

        return runtime;
    });

    const handleResize = React.useCallback((newLeftPercentage: number) => {
        setLeftPanelWidth(newLeftPercentage);
    }, []);



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
                <Editor
                    value={code}
                    onChange={setCode}
                    pythonRuntime={pythonRuntime}
                    onRunStateChange={setIsRunning}
                />
                <PythonOutput
                    stdout={stdout}
                    stderr={stderr}
                    isRunning={isRunning}
                />
            </Box>

            <DraggableSeparator
                onResize={handleResize}
                currentLeftPercentage={leftPanelWidth}
                minLeftPercentage={20}
                maxLeftPercentage={80}
            />

            <Box // Viewer container
                sx={{
                    width: `${100 - leftPanelWidth}%`,
                    height: "100%",
                    flexShrink: 0,
                }}
            >
                <Viewer 
                    key={renderKey} 
                    modelData={modelData} 
                />
            </Box>
        </Box>
    );
}

export default App;
