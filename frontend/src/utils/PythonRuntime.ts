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

            // 1. Expose send_data_to_js function to Python
            this.pyodide.registerJsModule("show", {
                send_data_to_js: this.sendDataToJs.bind(this),
            });

            // 2. Inject send_data_to_js into builtins IMMEDIATELY
            // This ensures it is available before setup.py runs
            await this.pyodide.runPythonAsync(`
                from show import send_data_to_js
                import builtins
                builtins.send_data_to_js = send_data_to_js
            `);

            // 3. Load and run the setup file
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

            // 4. Inject the export helper function
            const exportHelperCode = `
            import io
            import build123d as b3d
            
            def _get_export_bytes(format_type):
                if "__EXPORT__" not in globals():
                    return None
                
                shape = globals()["__EXPORT__"]
                bio = io.BytesIO()
                
                try:
                    # Scaffolding for future export formats
                    if format_type == "BREP":
                        b3d.export_brep(shape, bio)
                    elif format_type == "STL":
                        # TODO: add lib3mf STL export workaround via Mesher (shape, bio)
                        pass
                    elif format_type == "STEP":
                        b3d.export_step(shape, bio)
                    elif format_type == "SVG":
                        # TODO: add SVG export via ExportSVG (shape, bio)
                        pass
                    elif format_type == "DXF":
                        # TODO: add DXF export via ExportDXF (shape, bio)
                        pass
                    elif format_type == "3MF":
                        # TODO: add lib3mf 3MF export via Mesher (shape, bio)
                        pass
                    else:
                        print(f"Unknown format: {format_type}")
                        return None
                    return bio
                except Exception as e:
                    print(f"Export error for {format_type}: {e}")
                    return None
            `;
            await this.pyodide.runPythonAsync(exportHelperCode);
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

    async exportShape(format: string): Promise<Uint8Array | null> {
        if (!this.pyodide || !this.isInitialized) return null;
        try {
            const globals = this.pyodide.globals;
            const getExportBytes = globals.get("_get_export_bytes");
            
            if (getExportBytes) {
                const resultProxy = getExportBytes(format);
                
                // Check if we got a valid BytesIO object back
                if (resultProxy && resultProxy.getvalue) {
                    const bytesProxy = resultProxy.getvalue();
                    const bytes = bytesProxy.toJs();
                    
                    bytesProxy.destroy();
                    resultProxy.destroy();
                    getExportBytes.destroy();
                    
                    return bytes;
                }
                
                if (resultProxy) resultProxy.destroy();
                getExportBytes.destroy();
            }
        } catch (error) {
            console.error("Error exporting shape:", error);
        }
        return null;
    }
}