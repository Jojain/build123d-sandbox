import * as React from "react";
import Box from "@mui/material/Box";
import { useCallback, useEffect, useRef } from "react";
import * as TCV from "three-cad-viewer";
import useResizeObserver from "../utils/useResizeObserver";

// Helper functions for decoding model data
const MAP_HEX = {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9,
    a: 10, b: 11, c: 12, d: 13, e: 14, f: 15,
    A: 10, B: 11, C: 12, D: 13, E: 14, F: 15,
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
                        obj.shape.obj_vertices = convert(obj.shape.obj_vertices);
                        obj.shape.normals = convert(obj.shape.normals);
                        obj.shape.edge_types = convert(obj.shape.edge_types);
                        obj.shape.face_types = convert(obj.shape.face_types);
                        obj.shape.triangles = convert(obj.shape.triangles);
                        obj.shape.triangles_per_face = convert(obj.shape.triangles_per_face);
                        obj.shape.edges = convert(obj.shape.edges);
                        obj.shape.segments_per_edge = convert(obj.shape.segments_per_edge);
                    } else {
                        const ind = obj.shape.ref;
                        if (ind !== undefined) {
                            obj.shape = instances[ind];
                        }
                    }
                } else if (type === "edges") {
                    obj.shape.edges = convert(obj.shape.edges);
                    obj.shape.segments_per_edge = convert(obj.shape.segments_per_edge);
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
    defaultColor: "#e8b024"
};

const baseViewerOptions = {
    axes: true,
    axes0: true,
    blackEdges: false,
    grid: [false, false, false] as [boolean, boolean, boolean],
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
    clipNormal0: [1, 0, 0] as [number, number, number],
    clipNormal1: [0, 1, 0] as [number, number, number],
    clipNormal2: [0, 0, 1] as [number, number, number],
    clipIntersection: false,
    clipPlaneHelpers: false,
    clipObjectColors: false,
};

interface ViewerProps {
    modelData?: string;
    theme?: "light" | "dark";
    treeWidth?: number;
    tools?: boolean;
    up?: "Z" | "Y" | "legacy";
    control?: "trackball" | "orbit";
    glass?: boolean;
}

function Viewer(props: ViewerProps) {
    const viewerInstanceRef = useRef<any>(null);
    const displayInstanceRef = useRef<any>(null);

    const {
        modelData,
        theme = "light",
        treeWidth = 240,
        tools = true,
        up = "Z",
        control = "trackball",
        glass = true
    } = props;

    const onResize = useCallback((size: { width: number; height: number}) => {
        if (viewerInstanceRef.current) {
            const width = glass ? size.width - 20 : Math.max(10, size.width - treeWidth);
            const height = size.height - 55; 
            viewerInstanceRef.current.resizeCadView(width, treeWidth, height, glass);
        }
    }, [treeWidth, glass]);

    const [viewerRef] = useResizeObserver(onResize);

    // Initialize viewer with actual container size
    useEffect(() => {
        if (viewerRef.current && !viewerInstanceRef.current) {
            
            const combinedOptions: any = {
                // Render & Viewer Options
                ...baseViewerOptions,
                ...renderOptions,
                up: up,
                control: control,

                // Display Options
                cadWidth: 800,
                height: 600,
                treeWidth: treeWidth,
                theme: theme,
                tools: tools,
                pinning: false,
                keymap: {
                    shift: "shiftKey",
                    ctrl: "ctrlKey",
                    meta: "metaKey",
                    alt: "altKey"
                },
                newTreeBehavior: true,
                measurementDebug: false,
                
                glass: glass,
                measureTools: false,
                explodeTool: false,
                selectTool: false,
                zscaleTool: false,
                zebraTool: true, 
            };

            // Create display
            displayInstanceRef.current = new TCV.Display(
                viewerRef.current,
                combinedOptions,
            );

            // Pass the exact same combined configuration to the Viewer 
            viewerInstanceRef.current = new TCV.Viewer(
                displayInstanceRef.current,
                combinedOptions,
                () => {},
            );

            // Force layout styles to match
            displayInstanceRef.current.glassMode(glass); 
            displayInstanceRef.current.showTools(tools);
            displayInstanceRef.current.setTheme(theme);
        }

        return () => {
            if (viewerInstanceRef.current) {
                viewerInstanceRef.current.hasAnimationLoop = false;
                viewerInstanceRef.current.continueAnimation = false;
                viewerInstanceRef.current.dispose();
                viewerInstanceRef.current = null;
            }
            if (displayInstanceRef.current) {
                displayInstanceRef.current.dispose();
                displayInstanceRef.current = null;
            }
        };
    }, [theme, treeWidth, tools, up, control, glass]);

    // Handle python runtime pushes
    useEffect(() => {
        if (viewerInstanceRef.current && modelData) {
            let parsedData;
            try {
                let jsonString = modelData;
                if (jsonString.startsWith("D:")) {
                    jsonString = jsonString.substring(2); 
                }
                if (!jsonString.startsWith("{")) {
                    jsonString = "{" + jsonString;
                }
                parsedData = JSON.parse(jsonString);
            } catch (error) {
                console.error("Error parsing modelData JSON:", error);
                return;
            }

            let decodedData = parsedData;
            if (parsedData.data && parsedData.data.instances) {
                decode(decodedData);
            }

            // Sync the render options with our desired feature state
            const viewerOptions = {
                ...baseViewerOptions,
                glass: glass,
                measureTools: false,
                explodeTool: true,
                selectTool: false,
                zscaleTool: true,
                zebraTool: true,
                tools: true,
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
            } catch (error) {
                console.error("Error rendering model:", error);
            }
        }
    }, [modelData, up, control, glass]);

    return (
        <Box // Viewer container
            ref={viewerRef}
            // 🚨 minWidth: 0 and minHeight: 0 prevents the Viewer container from blowing out 
            // the flex layout when the three-cad-viewer internal pixel sizes run wide.
            sx={{ overflow: "hidden", width: "100%", height: "100%", minWidth: 0, minHeight: 0 }}
        />
    );
}

export default Viewer;