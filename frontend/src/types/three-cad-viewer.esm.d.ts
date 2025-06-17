declare module "three-cad-viewer" {
  // --- Interfaces for options and callback types inferred from JSDoc ---
  export interface DisplayOptions {
    theme?: string;
    cadWidth?: number;
    treeWidth?: number;
    height?: number;
    pinning?: boolean;
    glass?: boolean;
    tools?: boolean;
    keymap?: object;
    newTreeBehavior?: boolean;
    [key: string]: any;
  }
  export interface RenderOptions {
    ambientIntensity?: number;
    directIntensity?: number;
    metalness?: number;
    roughness?: number;
    defaultOpacity?: number;
    edgeColor?: number;
    normalLen?: number;
    measureTools?: boolean;
    selectTool?: boolean;
    [key: string]: any;
  }
  export interface ViewOptions {
    axes?: boolean;
    axes0?: boolean;
    grid?: boolean[];
    ortho?: boolean;
    transparent?: boolean;
    blackEdges?: boolean;
    collapse?: number;
    [key: string]: any;
  }
  export type NotificationCallback = (changes: any) => void;

  // --- Main Viewer class ---
  export class Viewer {
    /**
     * Create Viewer.
     * @param display - The Display object.
     * @param options - configuration parameters.
     * @param notifyCallback - The callback to receive changes of viewer parameters.
     * @param updateMarker - enforce to redraw orientation marker after every UI activity
     */
    constructor(
      display: any,
      options?: DisplayOptions,
      notifyCallback?: NotificationCallback,
      pinAsPngCallback?: (() => void) | null,
      updateMarker?: boolean
    );

    // --- Public methods (from JSDoc) ---
    version(): string;
    setDisplayDefaults(options: DisplayOptions): void;
    setRenderDefaults(options: RenderOptions): void;
    setViewerDefaults(options: ViewOptions): void;
    dumpOptions(): void;
    renderTessellatedShapes(exploded: boolean, shapes: any): { group: any; tree: any };
    addAnimationTrack(selector: string, action: string, time: number[], values: number[] | number[][]): void;
    initAnimation(duration: number, speed: number, label?: string, repeat?: boolean): void;
    hasAnimation(): boolean;
    clearAnimation(): void;
    update(updateMarker: boolean, notify?: boolean): void;
    animate(): void;
    toggleAnimationLoop(flag: boolean): void;
    dispose(): void;
    clear(): void;
    syncTreeStates(compactTree: any, expandedTree: any, exploded: boolean, path: string): void;
    getNodeColor(path: string): string | null;
    toggleGroup(expanded: boolean): void;
    toggleTab(disable: boolean): void;
    render(shapes: any, renderOptions: RenderOptions, viewerOptions: ViewOptions): void;
    setCamera(
      relative: boolean,
      position: number[],
      quaternion?: number[] | null,
      zoom?: number | null,
      notify?: boolean
    ): void;
    presetCamera(dir: string, zoom?: number | null, notify?: boolean): void;
    getCameraType(): string;
    switchCamera(flag: boolean, notify?: boolean): void;
    recenterCamera(notify?: boolean): void;
    resize(): void;
    reset(): void;
    setLocalClipping(flag: boolean): void;
    setObject(path: string, state: number, iconNumber: number, notify?: boolean, update?: boolean): void;
    setBoundingBox(id: string): void;
    refreshPlane(index: number, value: number): void;
    backupAnimation(): void;
    restoreAnimation(): void;
    controlAnimation(btn: string): void;
    setState(id: string, state: number[], nodeType?: string, notify?: boolean): void;
    handlePick(path: string, name: string, meta: boolean, shift: boolean, alt: boolean, point: any, nodeType?: string): void;
    setPickHandler(flag: boolean): void;
    pick(e: MouseEvent): void;
    clearSelection(): void;
    setRaycastMode(flag: boolean): void;
    handleRaycast(): void;
    handleRaycastEvent(event: any): void;
    handleBackendResponse(response: any): void;
    getAxes(): boolean;
    setAxes(flag: boolean, notify?: boolean): void;
    setGrid(action: string, flag: boolean, notify?: boolean): void;
    getGrids(): boolean[];
    setGrids(grids: boolean[], notify?: boolean): void;
    setGridCenter(center: boolean[], notify?: boolean): void;
    getAxes0(): boolean;
    setAxes0(flag: boolean, notify?: boolean): void;
    getAmbientLight(): number;
    setAmbientLight(val: number, ui?: boolean, notify?: boolean): void;
    getDirectLight(): number;
    setDirectLight(val: number, ui?: boolean, notify?: boolean): void;
    getMetalness(): number;
    setMetalness(value: number, ui?: boolean, notify?: boolean): void;
    getRoughness(): number;
    setRoughness(value: number, ui?: boolean, notify?: boolean): void;
    resetMaterial(): void;
    getTransparent(): boolean;
    setTransparent(flag: boolean, notify?: boolean): void;
    getBlackEdges(): boolean;
    setBlackEdges(flag: boolean, notify?: boolean): void;
    getOrtho(): boolean;
    setOrtho(flag: boolean, notify?: boolean): void;
    getCameraZoom(): number;
    setCameraZoom(val: number, notify?: boolean): void;
    getCameraPosition(): number[];
    setCameraPosition(position: number[], relative?: boolean, notify?: boolean): void;
    getCameraQuaternion(): number[];
    setCameraQuaternion(quaternion: number[], notify?: boolean): void;
    getCameraTarget(): number[];
    setCameraTarget(target: number[], notify?: boolean): void;
    getCameraLocationSettings(): { position: number[]; quaternion: number[]; target: number[]; zoom: number };
    setCameraLocationSettings(position?: number[] | null, quaternion?: number[] | null, target?: number[] | null, zoom?: number | null, notify?: boolean): void;
    getEdgeColor(): number;
    setEdgeColor(color: number, notify?: boolean): void;
    getOpacity(): number;
    setOpacity(opacity: number, notify?: boolean): void;
    getTools(): boolean;
    showTools(flag: boolean, notify?: boolean): void;
    getStates(): any;
    getState(path: string): number[];
    setStates(states: any): void;
    getZoomSpeed(): number;
    setZoomSpeed(val: number, notify?: boolean): void;
    getPanSpeed(): number;
    setPanSpeed(val: number, notify?: boolean): void;
    getRotateSpeed(): number;
    setRotateSpeed(val: number, notify?: boolean): void;
    getClipIntersection(): boolean;
    setClipIntersection(flag: boolean, notify?: boolean): void;
    getObjectColorCaps(): boolean;
    setClipObjectColorCaps(flag: boolean, notify?: boolean): void;
    getClipPlaneHelpers(): boolean;
    setClipPlaneHelpersCheck(flag: boolean): void;
    setClipPlaneHelpers(flag: boolean, notify?: boolean): void;
    getClipNormal(index: number): number[];
    setClipNormal(index: number, normal: number[], value?: number | null, notify?: boolean): void;
    setClipNormalFromPosition(index: number, notify?: boolean): void;
    getClipSlider(index: number): number;
    setClipSlider(index: number, value: number, notify?: boolean): void;
    getResetLocation(): { target0: number[]; position0: number[]; quaternion0: number[]; zoom0: number };
    setResetLocation(target: number[], position: number[], quaternion: number[], zoom: number, notify?: boolean): void;
    pinAsPng(): void;
    getImage(taskId: string): Promise<{ task: string; dataUrl: string }>;
    explode(duration?: number, speed?: number, multiplier?: number): void;
    trimUI(tags: string[], flag: boolean): void;
    setKeyMap(config: object): void;
    resizeCadView(cadWidth: number, treeWidth: number, height: number, glass?: boolean): void;
    vector3(x?: number, y?: number, z?: number): any;
    quaternion(x?: number, y?: number, z?: number, w?: number): any;
  }
} 