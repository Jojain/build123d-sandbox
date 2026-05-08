import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import CodeIcon from "@mui/icons-material/Code";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import TerminalIcon from "@mui/icons-material/Terminal";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import Editor from "../Editor.tsx";
import PythonOutput from "../PythonOutput.tsx";
import Viewer from "../Viewer.tsx";

type MobileView = "viewer" | "code" | "output";
type MobileAction = MobileView | "run";

interface MobileLayoutProps {
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

function MobileLayout(props: MobileLayoutProps) {
    const [mobileView, setMobileView] = useState<MobileView>("viewer");

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                height: "100dvh",
                width: "100vw",
                overflow: "hidden",
                bgcolor: "background.default",
            }}
        >
            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
                {mobileView === "viewer" && (
                    <Viewer modelData={props.modelData} treeWidth={0} />
                )}

                {mobileView === "code" && (
                    <Editor
                        code={props.code}
                        setCode={props.setCode}
                        isRunning={props.isRunning}
                        isReady={props.isReady}
                        runCode={props.runCode}
                        downloadExport={props.downloadExport}
                    />
                )}

                {mobileView === "output" && (
                    <PythonOutput
                        stdout={props.stdout}
                        stderr={props.stderr}
                        isRunning={props.isRunning}
                    />
                )}
            </Box>

            <Paper
                elevation={8}
                sx={{
                    flexShrink: 0,
                    borderRadius: 0,
                    pb: "env(safe-area-inset-bottom)",
                }}
            >
                <BottomNavigation
                    showLabels
                    value={mobileView}
                    onChange={(_, newValue: MobileAction) => {
                        if (newValue === "run") {
                            if (props.isReady && !props.isRunning) {
                                props.runCode(props.code);
                            }
                            return;
                        }

                        setMobileView(newValue);
                    }}
                >
                    <BottomNavigationAction
                        label="Viewer"
                        value="viewer"
                        icon={<ViewInArIcon />}
                    />
                    <BottomNavigationAction
                        label="Code"
                        value="code"
                        icon={<CodeIcon />}
                    />
                    <BottomNavigationAction
                        label={
                            !props.isReady
                                ? "Loading"
                                : props.isRunning
                                  ? "Running"
                                  : "Run"
                        }
                        value="run"
                        disabled={!props.isReady || props.isRunning}
                        icon={
                            !props.isReady || props.isRunning ? (
                                <CircularProgress size={22} />
                            ) : (
                                <PlayArrowIcon />
                            )
                        }
                    />
                    <BottomNavigationAction
                        label="Output"
                        value="output"
                        icon={<TerminalIcon />}
                    />
                </BottomNavigation>
            </Paper>
        </Box>
    );
}

export default MobileLayout;
