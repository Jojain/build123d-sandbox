import * as React from "react";
import Editor from "./components/Editor.tsx";
import Viewer from "./components/Viewer.tsx";
import Box from "@mui/material/Box";

function App() {
  const [code, setCode] = React.useState("");

  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", gap: 2, p: 2, boxSizing: "border-box" }}>
      <Box sx={{ flex: "0 0 40%", minWidth: 0, height: "100%" }}>
        <Editor value={code} onChange={setCode} />
      </Box>
      <Box sx={{ flex: "0 0 60%", minWidth: 0, height: "100%" }}>
        <Viewer/>
      </Box>
    </Box>
  );
}

export default App;
