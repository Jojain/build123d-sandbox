interface StatusManager {
    updateStatus: (message: string) => void;
}

const statusManager = {
    updateStatus: (message) => {
        console.log(message);
    },
};

export class PythonRuntime {
    private pyodide: any;
    private isInitialized: boolean;
    private statusManager: StatusManager;
    private onStdoutChange?: (stdout: string) => void;
    private onStderrChange?: (stderr: string) => void;
    private sendDataToJs: (data: any, msg_type: string) => void;

    constructor(sendDataToJs: (data: any, msg_type: string) => void) {
        this.pyodide = null;
        this.isInitialized = false;
        this.statusManager = statusManager;
        this.sendDataToJs = sendDataToJs;
    }

    setStdoutCallback(callback: (stdout: string) => void) {
        this.onStdoutChange = callback;
    }

    setStderrCallback(callback: (stderr: string) => void) {
        this.onStderrChange = callback;
    }

    clearOutput() {
        if (this.onStdoutChange) {
            this.onStdoutChange("");
        }
        if (this.onStderrChange) {
            this.onStderrChange("");
        }
    }

    /**
     * Load a Python file from the filesystem
     */
    private async loadPythonFile(filename: string): Promise<string> {
        try {
            // Use the correct base path for the current environment
            const basePath = import.meta.env.BASE_URL || "/";
            const response = await fetch(`${basePath}python/${filename}`);
            if (!response.ok) {
                throw new Error(
                    `Failed to load Python file: ${response.statusText}`,
                );
            }
            return await response.text();
        } catch (error) {
            throw new Error(
                `Error loading Python file ${filename}: ${error.message}`,
            );
        }
    }

    async initialize() {
        try {
            this.statusManager.updateStatus(
                "🔄 Loading Python WebAssembly runtime...",
            );
            // @ts-ignore
            this.pyodide = await loadPyodide();
            await this.pyodide.loadPackage(["micropip"]);

            // Expose send_data_to_js function to Python
            this.pyodide.registerJsModule("show", {
                send_data_to_js: this.sendDataToJs.bind(this),
            });

            // Load and run the setup file
            const setupCode = await this.loadPythonFile("setup.py");
            await this.pyodide.runPythonAsync(setupCode);

            // Set up stdout and stderr handlers with batched callbacks
            this.pyodide.setStdout({
                batched: (text: string) => {
                    if (this.onStdoutChange) {
                        this.onStdoutChange(text);
                    }
                },
            });

            this.pyodide.setStderr({
                batched: (text: string) => {
                    console.log("STDERR batched called with", text);
                    if (this.onStderrChange) {
                        this.onStderrChange(text);
                    }
                },
            });

            this.isInitialized = true;
            this.statusManager.updateStatus("🚀 Python environment ready!");

            // Set up the Python environment with the send_data_to_js function
            // And inject the brep_export helper function
            const setupCode2 = `
            from show import send_data_to_js
            import builtins
            builtins.send_data_to_js = send_data_to_js
            
            def brep_export(to_export):
                from io import BytesIO
                from build123d import export_brep
                brep = BytesIO()
                export_brep(to_export, brep)
                return brep
            `;
            await this.pyodide.runPythonAsync(setupCode2);
        } catch (error) {
            this.statusManager.updateStatus(
                "❌ Failed to initialize Python environment: " + error.message,
            );
        }
    }

    async runCode(code: string) {
        if (!this.isInitialized) {
            throw new Error("Python environment is not ready yet");
        }
        try {
            // Clear previous output
            this.clearOutput();
            await this.pyodide.runPythonAsync(code);
        } catch (error) {
            if (this.onStderrChange) {
                this.onStderrChange(error.message);
            }
            this.statusManager.updateStatus(
                "❌ Failed to run code: " + error.message,
            );
        }
    }

    getExportedBytes(): Uint8Array | null {
        if (!this.pyodide || !this.isInitialized) return null;
        try {
            const globals = this.pyodide.globals;
            const toExport = globals.get("to_export");
            
            if (toExport) {
                // If it's a BytesIO object, it has a getvalue method
                if (toExport.getvalue) {
                    const bytesProxy = toExport.getvalue();
                    const bytes = bytesProxy.toJs();
                    
                    bytesProxy.destroy();
                    toExport.destroy();
                    
                    return bytes;
                }
                toExport.destroy();
            }
        } catch (error) {
            console.error("Error retrieving export:", error);
        }
        return null;
    }
}