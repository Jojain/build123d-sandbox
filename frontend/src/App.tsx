import * as React from "react";
import Editor from "./components/Editor.tsx";
import Viewer from "./components/Viewer.tsx";
import Box from "@mui/material/Box";
import { PythonRuntime } from "./utils/PythonRuntime.ts";

function App() {
    const defaultCode = `from ocp_vscode import show
from build123d import Box
show(Box(1,1,1))`;

    const [code, setCode] = React.useState(defaultCode);
    const [modelData, setModelData] = React.useState();
    const [renderKey, setRenderKey] = React.useState(0);
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
        return runtime;
    });

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                height: "100vh",
                width: "100vw",
                gap: 2,
                p: 2,
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            <Box sx={{ flex: "0 0 40%", minWidth: 0, height: "100%" }}>
                <Editor
                    value={code}
                    onChange={setCode}
                    pythonRuntime={pythonRuntime}
                />
            </Box>
            <Box sx={{ flex: "0 0 60%", minWidth: 0, height: "100%" }}>
                <Viewer key={renderKey} modelData={modelData} />
            </Box>
        </Box>
    );
}

export default App;
