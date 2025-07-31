import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

interface PythonOutputProps {
    stdout: string;
    stderr: string;
    isRunning: boolean;
    // Configurable colors
    promptColor?: string;
    stdoutColor?: string;
    stderrColor?: string;
    runningColor?: string;
    placeholderColor?: string;
}

function PythonOutput(props: PythonOutputProps) {
    // Default colors
    const {
        promptColor = "#87CEEB", // Light blue for prompt
        stdoutColor = "#ffffff", // White for stdout
        stderrColor = "#ff6b6b", // Red for stderr
        runningColor = "#4CAF50", // Green for running status
        placeholderColor = "#888", // Gray for placeholder
    } = props;

    // Function to render text with colored prompts
    const renderTextWithPrompts = (text: string, textColor: string) => {
        if (!text) return null;
        
        const lines = text.split('\n');
        return lines.map((line, index) => {
            if (line.trim()) {
                return (
                    <Box key={index} sx={{ whiteSpace: "pre", minWidth: "fit-content" }}>
                        <span style={{ color: promptColor }}>{">>> "}</span>
                        <span style={{ color: textColor }}>{line}</span>
                    </Box>
                );
            } else {
                return <Box key={index} sx={{ whiteSpace: "pre", minWidth: "fit-content" }}>{line}</Box>;
            }
        });
    };

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
            <Paper
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: "auto",
                    backgroundColor: "#1e1e1e",
                    color: "#ffffff",
                    fontFamily: "monospace",
                    fontSize: 14,
                    p: 2,
                    "&::-webkit-scrollbar": {
                        width: 8,
                        height: 8,
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "#2d2d2d",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#555",
                        borderRadius: 4,
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#777",
                    },
                }}
            >
                {props.isRunning && (
                    <Box sx={{ color: runningColor, mb: 1 }}>
                        ▶ Running Python code...
                    </Box>
                )}

                {props.stdout && (
                    <Box sx={{ mb: 1 }}>
                        {renderTextWithPrompts(props.stdout, stdoutColor)}
                    </Box>
                )}

                {props.stderr && (
                    <Box sx={{ mb: 1 }}>
                        {renderTextWithPrompts(props.stderr, stderrColor)}
                    </Box>
                )}

                {!props.stdout && !props.stderr && !props.isRunning && (
                    <Box sx={{ color: placeholderColor, fontStyle: "italic" }}>
                        No output yet. Run some Python code to see the results
                        here.
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default PythonOutput;
