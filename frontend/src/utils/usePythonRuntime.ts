import { useState, useCallback, useEffect, useRef } from "react";
import { PythonRuntime } from "./PythonRuntime";

interface UsePythonRuntimeReturn {
    modelData: any;
    stdout: string;
    stderr: string;
    isRunning: boolean;
    isReady: boolean;
    runCode: (code: string) => Promise<void>;
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
        const runtime = new PythonRuntime();

        // Override the sendDataToJs method to update model data
        runtime.sendDataToJs = (data: any, msg_type: string) => {
            console.log("Received data from Python:", data, msg_type);
            if (msg_type === "DATA") {
                setModelData(data);
                // Increment render key to force re-render
            }
        };

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

            setIsRunning(true);
            await pythonRuntimeRef.current.runCode(code);
            setIsRunning(false);
        },
        [isReady]
    );

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
        clearOutput,
    };
}
