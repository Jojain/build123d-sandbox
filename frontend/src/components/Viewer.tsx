import "../assets/three-cad-viewer.css";
import * as TCV from "../assets/three-cad-viewer.esm.js";
import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect } from "react";
import  box  from "./boxData";

function Viewer(props: any) {
    const viewerRef = React.useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (viewerRef.current) {
            const options = {
                theme: "light",
                cadWidth: 800,
                height: 600,
                treeWidth: 240,
            };

            const notifyCallback = () => {};
            const display = new TCV.Display(viewerRef.current, options);
            const viewer = new TCV.Viewer(display, options, notifyCallback);

            const renderOptions = {};

            const viewerOptions = {
                ortho: true,
                ticks: 10,
                transparent: false,
                axes: true,
                grid: [false, false, false],
                timeit: false,
                rotateSpeed: 1,
                up: "Z",
                control: "trackball",
            };
            viewer.render(box, renderOptions, viewerOptions);

        }
    }, [props.modelData]);

    return (
        <Box
            sx={{
                p: 2,
                border: "1px solid #ccc",
                borderRadius: 2,
                minHeight: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Typography variant="h6" gutterBottom>
                Viewer
            </Typography>
            <Box sx={{ mt: 2, flex: 1, minHeight: 0 }}>
                <div
                    ref={viewerRef}
                    style={{
                        backgroundColor: "white",
                        width: "100%",
                        height: "100%",
                    }}
                />
            </Box>
        </Box>
    );
}

export default Viewer;
