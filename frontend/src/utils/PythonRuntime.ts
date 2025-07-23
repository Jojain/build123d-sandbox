
interface StatusManager {
    updateStatus: (message: string) => void;
}

const statusManager = {updateStatus: (message) => {
    console.log(message);
}}

export class PythonRuntime {
    private pyodide: any;
    private isInitialized: boolean;
    private statusManager: StatusManager;

    constructor() {
        this.pyodide = null;
        this.isInitialized = false;
        this.statusManager = statusManager;
    }
    
    sendDataToJs(data: any, msg_type: string) {
        console.log("Sending data to JS:", data, msg_type);
    }

    /**
     * Load a Python file from the filesystem
     */
    private async loadPythonFile(filename: string): Promise<string> {
        try {
            // Use the correct base path for the current environment
            const basePath = import.meta.env.BASE_URL || '/';
            const response = await fetch(`${basePath}python/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load Python file: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            throw new Error(`Error loading Python file ${filename}: ${error.message}`);
        }
    }

    async initialize() {
        try {
            this.statusManager.updateStatus('🔄 Loading Python WebAssembly runtime...');
            // @ts-ignore
            this.pyodide = await loadPyodide();
            await this.pyodide.loadPackage(['micropip']);
            
            // Expose send_data_to_js function to Python
            this.pyodide.registerJsModule('show', {send_data_to_js: this.sendDataToJs.bind(this)});
            
            // Load and run the setup file
            const setupCode = await this.loadPythonFile('setup.py');
            await this.pyodide.runPythonAsync(setupCode);
            
            this.pyodide.setStdout();
            this.pyodide.setStderr();
            this.isInitialized = true;
            this.statusManager.updateStatus('🚀 Python environment ready!');

            // Set up the Python environment with the send_data_to_js function
            const setupCode2 = `
            from show import send_data_to_js
            import builtins
            builtins.send_data_to_js = send_data_to_js`;
            await this.pyodide.runPythonAsync(setupCode2);
            
        } catch (error) {
            this.statusManager.updateStatus('❌ Failed to initialize Python environment: ' + error.message);
        }
    }

    async runCode(code: string) {
        if (!this.isInitialized) {
            throw new Error('Python environment is not ready yet');
        }
        try {
            await this.pyodide.runPythonAsync(code);
        } catch (error) {
            this.statusManager.updateStatus('❌ Failed to run code: ' + error.message);
        }
    }

    /**
     * Load and run a Python file
     */
    async runPythonFile(filename: string) {
        if (!this.isInitialized) {
            throw new Error('Python environment is not ready yet');
        }
        try {
            const pythonCode = await this.loadPythonFile(filename);
            return await this.pyodide.runPythonAsync(pythonCode);
        } catch (error) {
            this.statusManager.updateStatus('❌ Failed to run Python file: ' + error.message);
            throw error;
        }
    }

    /**
     * Process a viewer message through the Python viewer server
     */
    async processViewerMessage(message: string): Promise<string> {
        if (!this.isInitialized) {
            throw new Error('Python environment is not ready yet');
        }
        try {
            return await this.pyodide.runPythonAsync(`process_viewer_message("${message}")`);
        } catch (error) {
            this.statusManager.updateStatus('❌ Failed to process viewer message: ' + error.message);
            throw error;
        }
    }

    isReady() {
        return this.isInitialized;
    }
} 