import { useState, useCallback, useEffect, useRef } from "react";
import { PythonRuntime } from "./PythonRuntime";

interface UsePythonRuntimeReturn {
    modelData: any;
    stdout: string;
    stderr: string;
    isRunning: boolean;
    isReady: boolean;
    runCode: (code: string) => Promise<void>;
    downloadExport: () => boolean;
    clearOutput: () => void;
}

export function usePythonRuntime(): UsePythonRuntimeReturn {
    const [modelData, setModelData] = useState<any>();
    const [stdout, setStdout] = useState("");
    const [stderr, setStderr] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isReady, setIsInitialized] = useState(false);
    const pythonRuntimeRef = useRef<PythonRuntime | null>(null);

    // Initialize Python runtime
    useEffect(() => {
        const runtime = new PythonRuntime((data: any, msg_type: string) => {
            if (msg_type === "DATA") {
                setModelData(data);
                console.log("setting model data");
            }
        });

        // Set up stdout callback to accumulate output
        runtime.setStdoutCallback((newStdout: string) => {
            setStdout((prev) => {
                if (newStdout.length > 0) {
                    return prev + newStdout + "\n";
                }
                return prev;
            });
        });

        // Set up stderr callback to accumulate output
        runtime.setStderrCallback((newStderr: string) => {
            setStderr((prev) => {
                if (newStderr.length > 0) {
                    return prev + newStderr + "\n";
                }
                return prev;
            });
        });

        pythonRuntimeRef.current = runtime;

        // Initialize the runtime
        const initializeRuntime = async () => {
            try {
                await runtime.initialize();
                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to initialize Python runtime:", error);
            }
        };

        initializeRuntime();

        // Cleanup function
        return () => {
            // Add any cleanup logic here if needed
        };
    }, []);

    const runCode = useCallback(
        async (code: string) => {
            if (!pythonRuntimeRef.current || !isReady) {
                throw new Error("Python runtime is not ready yet");
            }
            clearOutput();
            setIsRunning(true);
            await pythonRuntimeRef.current.runCode(code);
            setIsRunning(false);
        },
        [isReady],
    );

    const downloadExport = useCallback(() => {
        if (!pythonRuntimeRef.current) return false;
        
        const bytes = pythonRuntimeRef.current.getExportedBytes();
        if (bytes) {
            const blob = new Blob([bytes], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "model.brep";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        }
        return false;
    }, []);

    const clearOutput = useCallback(() => {
        setStdout("");
        setStderr("");
        if (pythonRuntimeRef.current) {
            pythonRuntimeRef.current.clearOutput();
        }
    }, []);

    return {
        modelData,
        stdout,
        stderr,
        isRunning,
        isReady,
        runCode,
        downloadExport,
        clearOutput,
    };
}