import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MonacoEditor from "@monaco-editor/react";
import { useState } from "react";

function Editor(props: {
    value: string;
    onChange: (value: string) => void;
    isReady: boolean;
    runCode: (code: string) => Promise<void>;
    onRunStateChange?: (isRunning: boolean) => void;
}) {
    const [isRunning, setIsRunning] = useState(false);

    async function handleRunClick() {
        if (!props.isReady || isRunning) return;

        setIsRunning(true);
        if (props.onRunStateChange) {
            props.onRunStateChange(true);
        }

        await props.runCode(props.value);
        setIsRunning(false);
        if (props.onRunStateChange) {
            props.onRunStateChange(false);
        }
    }

    return (
        <Box
            sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}
        >
            <Button
                variant="contained"
                color="primary"
                onClick={handleRunClick}
                disabled={!props.isReady || isRunning}
                sx={{
                    mb: 2,
                    minWidth: 120,
                    height: 40,
                    fontWeight: "bold",
                    textTransform: "none",
                    boxShadow: 2,
                    "&:hover": {
                        boxShadow: 4,
                    },
                }}
            >
                {isRunning ? "Running..." : "Run Code"}
            </Button>

            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                <MonacoEditor
                    height="100%"
                    language="python"
                    theme="vs-dark"
                    value={props.value}
                    onChange={(value) => props.onChange(value || "")}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        scrollbar: {
                            vertical: "visible",
                            horizontal: "visible",
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                    }}
                />
            </Box>
        </Box>
    );
}

export default Editor;
