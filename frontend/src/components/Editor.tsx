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

export const defaultCode = `from ocp_vscode import show
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
    code: string;
    setCode: (code: string) => void;
    isRunning: boolean;
    isReady: boolean;
    runCode: (code: string) => Promise<void>;
    downloadExport: (format: string) => Promise<boolean>;
}) {
    const [showToast, setShowToast] = useState(false);
    const [exportFormat, setExportFormat] = useState("BREP");
    const [toastMessage, setToastMessage] = useState(
        "URL copied to clipboard!",
    );

    async function handleRunClick() {
        if (!props.isReady || props.isRunning) return;

        await props.runCode(props.code);
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
        const compressedCode = compressCode(props.code);
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

        updateUrlWithCode(props.code);
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
                    p: { xs: 1, sm: 2 },
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        gap: { xs: 1, sm: 2 },
                        mb: { xs: 1, sm: 2 },
                        flexWrap: { xs: "wrap", sm: "nowrap" },
                    }}
                >
                    {!props.isReady ? (
                        <Box
                            sx={{
                                flex: { xs: "1 1 100%", sm: 1 },
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
                            disabled={props.isRunning}
                            sx={{
                                flex: { xs: "1 1 100%", sm: 1 },
                                height: 40,
                                fontWeight: "bold",
                                textTransform: "none",
                                boxShadow: 2,
                                "&:hover": {
                                    boxShadow: 4,
                                },
                            }}
                        >
                            {props.isRunning ? "Running..." : "Run Code"}
                        </Button>
                    )}

                    <Box
                        sx={{
                            display: "flex",
                            gap: 0,
                            bgcolor: "white",
                            borderRadius: 1,
                            flex: { xs: "1 1 auto", sm: "0 0 auto" },
                            minWidth: 0,
                        }}
                    >
                         <FormControl size="small" sx={{ minWidth: 80, flexShrink: 0 }}>
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
                                <MenuItem value="STEP">STEP</MenuItem>
                                <MenuItem value="STL">STL</MenuItem>
                                <MenuItem value="3MF">3MF</MenuItem>
                                <MenuItem value="SVG">SVG</MenuItem>
                                <MenuItem value="DXF">DXF</MenuItem>
                                <MenuItem value="BREP">BREP</MenuItem>
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleDownloadClick}
                            endIcon={<DownloadIcon />}
                            disabled={!props.isReady}
                            sx={{
                                minWidth: { xs: 0, sm: 100 },
                                flex: { xs: 1, sm: "0 0 auto" },
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
                            minWidth: { xs: 0, sm: 100 },
                            flex: { xs: "1 1 96px", sm: "0 0 auto" },
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
                        value={props.code}
                        onChange={(value) => props.setCode(value || "")}
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
