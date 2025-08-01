import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MonacoEditor from "@monaco-editor/react";
import { useState } from "react";
import { updateUrlWithCode, compressCode } from "../utils/urlCodec.ts";
import Toast from "./Toast.tsx";
import ShareIcon from "@mui/icons-material/Share";
import { useUrlCode } from "../utils/useUrlCode.ts";

const defaultCode = `from ocp_vscode import show
from build123d import *
show(Box(1,1,1))
#show(Sphere(1))`;

function Editor(props: {
    isReady: boolean;
    runCode: (code: string) => Promise<void>;
}) {
    const [code, setCode] = useUrlCode(defaultCode);
    const [isRunning, setIsRunning] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState(
        "URL copied to clipboard!"
    );

    async function handleRunClick() {
        if (!props.isReady || isRunning) return;

        setIsRunning(true);
        await props.runCode(code);
        setIsRunning(false);
    }

    function handleShareClick() {
        const compressedCode = compressCode(code);
        const testUrl = new URL(window.location.href);
        testUrl.searchParams.set("code", compressedCode);

        if (testUrl.toString().length > 6000) {
            // Show warning toast instead
            setToastMessage(
                "Code too long for URL sharing. Consider shortening your code."
            );
            setShowToast(true);
            return;
        }

        updateUrlWithCode(code);
        navigator.clipboard
            .writeText(window.location.href)
            .then(() => {
                setToastMessage("URL copied to clipboard!");
                setShowToast(true);
            })
            .catch((err) => {
                console.error("Failed to copy URL:", err);
            });
    }

    return (
        <>
            <Box
                sx={{
                    p: 2,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleRunClick}
                        disabled={!props.isReady || isRunning}
                        sx={{
                            flex: 1,
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

                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleShareClick}
                        endIcon={<ShareIcon />}
                        sx={{
                            minWidth: 100,
                            height: 40,
                            fontWeight: "bold",
                            textTransform: "none",
                            boxShadow: 1,
                            "&:hover": {
                                boxShadow: 2,
                            },
                        }}
                    >
                        Share
                    </Button>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                    <MonacoEditor
                        height="100%"
                        language="python"
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || "")}
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

            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </>
    );
}

export default Editor;
