declare class MinGL {
    private canvas;
    private video;
    constructor(canvas: any, video: any);
    getElem(id: any): any;
    getWebGLContext(): boolean;
    isWebGLSupported(): boolean;
    getSourceById(id: any): string;
    setupCamera(callback: any): boolean;
    setupRequestAnimationFrame(): void;
    createShader(gl: any, type: string, source: string): any;
    createShaderFromURI(gl: any, type: string, uri: string, callback: any): any;
    createProgramFromShaders(gl: any, vs: any, fs: any): any;
    createProgramFromURIs(gl: any, params: any): any;
}
