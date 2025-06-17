let pyodide: any = null;
let pyodideReady: boolean = false;

export async function initPyodideAndPackages() {
    if (pyodideReady) return;
    // @ts-ignore
    pyodide = await loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
    });
    await pyodide.loadPackage("micropip");

    await pyodide.runPythonAsync(`
import micropip
await micropip.install(["https://yeicor.github.io/OCP-wasm/cadquery-ocp-wasm-Release/cadquery_ocp-7.8.1.2-cp313-cp313-pyodide_2025_0_wasm32.whl"])
`);
    // Step 2: Install build123d
    await pyodide.runPythonAsync(`
import micropip
await micropip.install(["build123d"])
`);
    // Step 3: Install sqlite3
    await pyodide.runPythonAsync(`
import micropip
await micropip.install(["sqlite3"])
`);
    pyodideReady = true;
}

export async function runPython(code: string) {
    if (!pyodideReady) return "Pyodide not ready";
    try {
        return await pyodide.runPythonAsync(code);
    } catch (e: any) {
        return e.toString();
    }
}
