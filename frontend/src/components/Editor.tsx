import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MonacoEditor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { PythonRuntime } from "../utils/PythonRuntime.ts";

function Editor(props: { 
    value: string; 
    onChange: (value: string) => void;
    pythonRuntime: PythonRuntime;
}) {
	const [ready, setReady] = useState(false);
	const [isRunning, setIsRunning] = useState(false);

	useEffect(() => {
		props.pythonRuntime.initialize().then(() => {
			setReady(true);
		});
	}, [props.pythonRuntime]);

	async function handleRunClick() {
		if (!ready || isRunning) return;
		
		setIsRunning(true);
		
		try {
			await props.pythonRuntime.runCode(props.value);
		} catch (error) {
			console.error('Error running Python code:', error);
		} finally {
			setIsRunning(false);
		}
	}

	return (
		<Box sx={{ p: 2, height: "100%" }}>
			<Typography variant="h6" gutterBottom>
				Editor
			</Typography>
			<button 
				onClick={handleRunClick} 
				disabled={!ready || isRunning} 
				style={{marginTop: 8, marginBottom: 8}}
			>
				{isRunning ? "Running..." : "Run"}
			</button>
			
			<MonacoEditor
				height="100%"
				language="python"
				theme="vs-dark"
				value={props.value}
				onChange={(value) => props.onChange(value || "")}
				options={{
					minimap: { enabled: false },
					fontSize: 14,
					scrollBeyondLastLine: false,
				}}
			/>
		</Box>
	);
}

export default Editor;
