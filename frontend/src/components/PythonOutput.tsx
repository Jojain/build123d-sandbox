import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { useEffect, useRef } from "react";

interface PythonOutputProps {
    stdout: string;
    stderr: string;
    isRunning: boolean;
}

function PythonOutput(props: PythonOutputProps) {
    const outputRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new output is added
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [props.stdout, props.stderr]);

    return (
        <Box sx={{ 
            p: 2, 
            height: "100%", 
            display: "flex", 
            flexDirection: "column",
            overflow: "hidden"
        }}>
            <Paper 
                ref={outputRef}
                sx={{ 
                    flex: 1, 
                    minHeight: 0,
                    overflow: "auto",
                    backgroundColor: '#1e1e1e',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    p: 2,
                    '&::-webkit-scrollbar': {
                        width: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: '#2d2d2d',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#555',
                        borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#777',
                    },
                }}
            >
                {props.isRunning && (
                    <Box sx={{ color: '#4CAF50', mb: 1 }}>
                        ▶ Running Python code...
                    </Box>
                )}
                
                {props.stdout && (
                    <Box sx={{ color: '#ffffff', whiteSpace: 'pre-wrap', mb: 1 }}>
                        {props.stdout}
                    </Box>
                )}
                
                {props.stderr && (
                    <Box sx={{ color: '#ff6b6b', whiteSpace: 'pre-wrap', mb: 1 }}>
                        {props.stderr}
                    </Box>
                )}
                
                {!props.stdout && !props.stderr && !props.isRunning && (
                    <Box sx={{ color: '#888', fontStyle: 'italic' }}>
                        No output yet. Run some Python code to see the results here.
                    </Box>
                )}
            </Paper>
        </Box>
    );
}

export default PythonOutput; 