import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MonacoEditor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { initPyodideAndPackages, runPython } from "./pyodideRunner.ts";

function Editor(props: { value: string; onChange: (value: string) => void }) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		initPyodideAndPackages().then(() => setReady(true));
	}, []);

	async function handleRunClick() {
		const result = await runPython(props.value);
		alert(result); // Replace with your preferred UI feedback
	}

	return (
		<Box sx={{ p: 2, height: "100%" }}>
			<Typography variant="h6" gutterBottom>
				Editor
			</Typography>
			<button onClick={handleRunClick} disabled={!ready} style={{marginTop: 8}}>
				Run
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
