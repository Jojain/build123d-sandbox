import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useRef } from "react";
import * as TCV from "../assets/three-cad-viewer.esm.js";
import "../assets/three-cad-viewer.css";
import useResizeObserver from "../utils/useResizeObserver";
import useInitialSize from "../utils/useInitialSize.js";

// Helper functions for decoding model data
const MAP_HEX = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    a: 10,
    b: 11,
    c: 12,
    d: 13,
    e: 14,
    f: 15,
    A: 10,
    B: 11,
    C: 12,
    D: 13,
    E: 14,
    F: 15,
};

function fromHex(hexString: string) {
    const bytes = new Uint8Array(Math.floor((hexString || "").length / 2));
    let i;
    for (i = 0; i < bytes.length; i++) {
        const a = MAP_HEX[hexString[i * 2] as keyof typeof MAP_HEX];
        const b = MAP_HEX[hexString[i * 2 + 1] as keyof typeof MAP_HEX];
        if (a === undefined || b === undefined) {
            break;
        }
        bytes[i] = (a << 4) | b;
    }
    return i === bytes.length ? bytes : bytes.slice(0, i);
}

function fromB64(s: string) {
    let bytes = atob(s);
    let uint = new Uint8Array(bytes.length);
    for (var i = 0; i < bytes.length; i++) uint[i] = bytes[i].charCodeAt(0);
    return uint;
}

function decode(data: any) {
    function convert(obj: any): any {
        var result;
        if (typeof obj.buffer == "string") {
            var buffer;
            if (obj.codec === "b64") {
                buffer = fromB64(obj.buffer);
            } else {
                buffer = fromHex(obj.buffer);
            }
            if (obj.dtype === "float32") {
                result = new Float32Array(buffer.buffer);
            } else if (obj.dtype === "int32") {
                result = new Uint32Array(buffer.buffer);
            } else if (obj.dtype === "uint32") {
                result = new Uint32Array(buffer.buffer);
            } else {
                console.error("Error: unknown dtype", obj.dtype);
            }
        } else if (Array.isArray(obj)) {
            result = [];
            for (var arr of obj) {
                result.push(convert(arr));
            }
            return result;
        } else {
            console.error("Error: unknown buffer type", obj.buffer);
        }
        return result;
    }

    function walk(obj: any) {
        var type = null;
        for (var attr in obj) {
            if (attr === "parts") {
                for (var i in obj.parts) {
                    walk(obj.parts[i]);
                }
            } else if (attr === "type") {
                type = obj.type;
            } else if (attr === "shape") {
                if (type === "shapes") {
                    if (obj.shape.ref === undefined) {
                        obj.shape.vertices = convert(obj.shape.vertices);
                        obj.shape.obj_vertices = convert(
                            obj.shape.obj_vertices,
                        );
                        obj.shape.normals = convert(obj.shape.normals);
                        obj.shape.edge_types = convert(obj.shape.edge_types);
                        obj.shape.face_types = convert(obj.shape.face_types);
                        obj.shape.triangles = convert(obj.shape.triangles);
                        obj.shape.triangles_per_face = convert(
                            obj.shape.triangles_per_face,
                        );
                        obj.shape.edges = convert(obj.shape.edges);
                        obj.shape.segments_per_edge = convert(
                            obj.shape.segments_per_edge,
                        );
                    } else {
                        const ind = obj.shape.ref;
                        if (ind !== undefined) {
                            obj.shape = instances[ind];
                        }
                    }
                } else if (type === "edges") {
                    obj.shape.edges = convert(obj.shape.edges);
                    obj.shape.segments_per_edge = convert(
                        obj.shape.segments_per_edge,
                    );
                    obj.shape.obj_vertices = convert(obj.shape.obj_vertices);
                } else {
                    obj.shape.obj_vertices = convert(obj.shape.obj_vertices);
                }
            }
        }
    }

    const instances = data.data.instances;

    data.data.instances.forEach((instance: any) => {
        instance.vertices = convert(instance.vertices);
        instance.obj_vertices = convert(instance.obj_vertices);
        instance.normals = convert(instance.normals);
        instance.edge_types = convert(instance.edge_types);
        instance.face_types = convert(instance.face_types);
        instance.triangles = convert(instance.triangles);
        instance.triangles_per_face = convert(instance.triangles_per_face);
        instance.edges = convert(instance.edges);
        instance.segments_per_edge = convert(instance.segments_per_edge);
    });

    walk(data.data.shapes);

    data.data.instances = [];
}

const renderOptions = {
    ambientIntensity: 1.0,
    directIntensity: 1.1,
    metalness: 0.3,
    roughness: 0.65,
    edgeColor: 0x707070,
    defaultOpacity: 0.5,
    normalLen: 0,
    angularTolerance: 0.2,
    deviation: 0.1,
    defaultColor: "#e8b024",
};

const baseViewerOptions = {
    axes: true,
    axes0: false,
    blackEdges: false,
    grid: [false, false, false],
    collapse: false,
    ortho: true,
    ticks: 10,
    centerGrid: false,
    timeit: false,
    transparent: false,
    panSpeed: 1,
    zoomSpeed: 1,
    rotateSpeed: 1,
    clipSlider0: 0,
    clipSlider1: 0,
    clipSlider2: 0,
    clipNormal0: [1, 0, 0],
    clipNormal1: [0, 1, 0],
    clipNormal2: [0, 0, 1],
    clipIntersection: false,
    clipPlaneHelpers: false,
    clipObjectColors: false,
};

interface ViewerProps {
    modelData?: string;
    theme?: "light" | "dark";
    treeWidth?: number;
    glass?: boolean;
    tools?: boolean;
    up?: string;
    control?: "trackball" | "orbit";
}

function Viewer(props: ViewerProps) {
    const viewerInstanceRef = useRef<any>(null);
    const displayInstanceRef = useRef<any>(null);

    const {
        modelData,
        theme = "light",
        treeWidth = 240,
        glass = false,
        tools = true,
        up = "Z",
        control = "trackball",
    } = props;

    const onResize = useCallback((size: { width: number; height: number }) => {
        const width = size.width - treeWidth - 30;
        const height = size.height - 60;
        viewerInstanceRef.current.resizeCadView(width, treeWidth, height);
    }, []);

    const [viewerRef, containerSize] = useResizeObserver(onResize);

    // Initialize viewer with actual container size
    useEffect(() => {
        if (viewerRef.current && !viewerInstanceRef.current) {
            const displayOptions = {
                cadWidth: 800,
                height: 600,
                treeWidth: treeWidth,
                glass: glass,
                theme: theme,
                tools: tools,
                pinning: false,
                keymap: {
                    shift: "shiftKey",
                    ctrl: "ctrlKey",
                    meta: "metaKey",
                },
            };

            // Create display
            displayInstanceRef.current = new TCV.Display(
                viewerRef.current,
                displayOptions,
            );

            viewerInstanceRef.current = new TCV.Viewer(
                displayInstanceRef.current,
                displayOptions,
                () => {},
            );

            // Set up display
            displayInstanceRef.current.glassMode(displayOptions.glass);
            displayInstanceRef.current.showTools(displayOptions.tools);
        }

        return () => {
            // Cleanup
            if (viewerInstanceRef.current) {
                viewerInstanceRef.current.hasAnimationLoop = false;
                viewerInstanceRef.current.continueAnimation = false;
                viewerInstanceRef.current = null;
            }
            if (displayInstanceRef.current) {
                displayInstanceRef.current = null;
            }
        };
    }, [theme, treeWidth, glass, tools, up, control]);

    // Render model data
    if (viewerInstanceRef.current && modelData) {
        // Parse the string into JSON first, then decode
        let parsedData;
        try {
            // Remove the "D:" prefix that's always present
            let jsonString = modelData;
            if (modelData.startsWith("D:")) {
                jsonString = modelData.substring(3); // Remove "D:"
            }
            jsonString = jsonString.replace(/^D:/, "");
            jsonString = "{" + jsonString;

            parsedData = JSON.parse(jsonString);
        } catch (error) {
            console.error("Error parsing modelData JSON:", error);
            console.error("modelData:", modelData);
            return;
        }

        // Decode the model data
        let decodedData = parsedData;
        if (parsedData.data && parsedData.data.instances) {
            decode(decodedData);
        }

        const viewerOptions = {
            ...baseViewerOptions,
            tools: tools,
            glass: glass,
            up: up,
            control: control,
        };

        try {
            viewerInstanceRef.current.clear();
            viewerInstanceRef.current.render(
                decodedData.data.shapes,
                renderOptions,
                viewerOptions,
            );
            console.log("Model rendered successfully");
        } catch (error) {
            console.error("Error rendering model:", error);
        }
    }

    return (
        <Box // Viewer container
            ref={viewerRef}
            sx={{
                overflow: "hidden",
                width: "100%",
                height: "100%",
            }}
        />
    );
}

export default Viewer;
