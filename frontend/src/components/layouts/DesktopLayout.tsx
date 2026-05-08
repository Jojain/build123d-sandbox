import * as React from "react";
import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import DraggableSeparator from "../DraggableSeparator.tsx";
import Editor from "../Editor.tsx";
import PythonOutput from "../PythonOutput.tsx";
import Viewer from "../Viewer.tsx";

interface DesktopLayoutProps {
    modelData?: string;
    stdout: string;
    stderr: string;
    isRunning: boolean;
    isReady: boolean;
    code: string;
    setCode: (code: string) => void;
    runCode: (code: string) => Promise<void>;
    downloadExport: (format: string) => Promise<boolean>;
}

function DesktopLayout(props: DesktopLayoutProps) {
    const [leftPanelWidth, setLeftPanelWidth] = useState(35);
    const [editorHeight, setEditorHeight] = useState(70);

    const handleResize = useCallback((newLeftPercentage: number) => {
        setLeftPanelWidth(newLeftPercentage);
    }, []);

    const handleVerticalResize = useCallback((newEditorPercentage: number) => {
        setEditorHeight(newEditorPercentage);
    }, []);

    return (
        <Box
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
            <Box
                sx={{
                    width: `${leftPanelWidth}%`,
                    minWidth: 0,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                }}
            >
                <Box
                    sx={{
                        height: `${editorHeight}%`,
                        minHeight: 0,
                        flexShrink: 0,
                    }}
                >
                    <Editor
                        code={props.code}
                        setCode={props.setCode}
                        isRunning={props.isRunning}
                        isReady={props.isReady}
                        runCode={props.runCode}
                        downloadExport={props.downloadExport}
                    />
                </Box>

                <DraggableSeparator
                    onResize={handleVerticalResize}
                    currentPercentage={editorHeight}
                    minPercentage={30}
                    maxPercentage={90}
                    orientation="vertical"
                />

                <Box
                    sx={{
                        height: `${100 - editorHeight}%`,
                        minHeight: 0,
                        flexShrink: 0,
                    }}
                >
                    <PythonOutput
                        stdout={props.stdout}
                        stderr={props.stderr}
                        isRunning={props.isRunning}
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

            <Box
                sx={{
                    width: `${100 - leftPanelWidth}%`,
                    height: "100%",
                    flexShrink: 0,
                    position: "relative", 
                    overflow: "hidden", 
                    minWidth: 0,
                }}
            >
                <Viewer modelData={props.modelData} />
            </Box>
        </Box>
    );
}

export default DesktopLayout;
