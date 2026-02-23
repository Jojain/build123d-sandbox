import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import MonacoEditor from "@monaco-editor/react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";
import { updateUrlWithCode, compressCode } from "../utils/urlCodec.ts";
import Toast from "./Toast.tsx";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import { useUrlCode } from "../utils/useUrlCode.ts";

const defaultCode = `from ocp_vscode import show
from build123d import *

# Create a shape
b = Box(1,1,1)
show(b)

# To export, assign your shape to __EXPORT__
# 1. Run the code
# 2. Select the format in the dropdown 
# 3. Click Download
__EXPORT__ = b`;

function Editor(props: {
    isReady: boolean;
    runCode: (code: string) => Promise<void>;
    downloadExport: (format: string) => Promise<boolean>;
}) {
    const [code, setCode] = useUrlCode(defaultCode);
    const [isRunning, setIsRunning] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [exportFormat, setExportFormat] = useState("BREP");
    const [toastMessage, setToastMessage] = useState(
        "URL copied to clipboard!",
    );

    async function handleRunClick() {
        if (!props.isReady || isRunning) return;

        setIsRunning(true);
        await props.runCode(code);
        setIsRunning(false);
    }

    async function handleDownloadClick() {
        const success = await props.downloadExport(exportFormat);
        if (!success) {
            setToastMessage("Export failed. Ensure '__EXPORT__' variable is set and you have clicked 'Run Code'.");
            setShowToast(true);
        }
    }

    const handleFormatChange = (event: SelectChangeEvent) => {
        setExportFormat(event.target.value as string);
    };

    function handleShareClick() {
        const compressedCode = compressCode(code);
        const testUrl = new URL(window.location.href);
        testUrl.searchParams.set("code", compressedCode);

        if (testUrl.toString().length > 6000) {
            // Show warning toast instead
            setToastMessage(
                "Code too long for URL sharing. Consider shortening your code.",
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
                    {!props.isReady ? (
                        <Box
                            sx={{
                                flex: 1,
                                height: 40,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 1.5,
                                borderRadius: 1,
                                backgroundColor: "warning.main",
                                color: "warning.contrastText",
                                boxShadow: 2,
                            }}
                        >
                            <CircularProgress
                                size={20}
                                sx={{ color: "warning.contrastText" }}
                            />
                            <Typography
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "0.875rem",
                                    letterSpacing: "0.02857em",
                                    lineHeight: 1.75,
                                }}
                            >
                                Loading Python environment…
                            </Typography>
                        </Box>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleRunClick}
                            disabled={isRunning}
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
                    )}

                    <Box sx={{ display: "flex", gap: 0, bgcolor: "white", borderRadius: 1 }}>
                         <FormControl size="small" sx={{ minWidth: 80 }}>
                            <Select
                                value={exportFormat}
                                onChange={handleFormatChange}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Export Format' }}
                                sx={{ 
                                    height: 40, 
                                    borderTopRightRadius: 0,
                                    borderBottomRightRadius: 0,
                                }}
                            >
                                <MenuItem value="BREP">BREP</MenuItem>
                                <MenuItem value="STL" disabled>STL</MenuItem>
                                <MenuItem value="STEP" disabled>STEP</MenuItem>
                                <MenuItem value="SVG" disabled>SVG</MenuItem>
                                <MenuItem value="DXF" disabled>DXF</MenuItem>
                                <MenuItem value="3MF" disabled>3MF</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleDownloadClick}
                            endIcon={<DownloadIcon />}
                            disabled={!props.isReady}
                            sx={{
                                minWidth: 100,
                                height: 40,
                                fontWeight: "bold",
                                textTransform: "none",
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                                boxShadow: 1,
                                "&:hover": {
                                    boxShadow: 2,
                                },
                            }}
                        >
                            Download
                        </Button>
                    </Box>

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