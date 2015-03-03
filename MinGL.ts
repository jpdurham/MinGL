class MinGL {
    constructor(private canvas, private video){
        this.setupRequestAnimationFrame();
    }

    getElem(id): any {
        document.getElementById(id);
    }

    getWebGLContext(): boolean {
        return this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    }

    isWebGLSupported(): boolean {
        try {
            var w: any = window;
            return !!(w.WebGLRenderingContext && this.getWebGLContext());
        } catch (e) {
            return false;
        }
    }

    getSourceById(id): string {
        var shaderScript = this.getElem(id);
        if (!shaderScript) {
            return null;
        }

        var shaderText = "";
        var elem = shaderScript.firstChild;
        while (elem) {
            if (elem.nodeType == 3) {
                shaderText += elem.textContent;
            }
            elem = elem.nextSibling;
        }
        return shaderText;
    }

    setupCamera(callback): boolean {
        var getUserMediaKey = ['getUserMedia', 'webkitGetUserMedia', 'mozGetUserMedia'],
            urlKey = ['URL', 'webkitURL', 'mozURL'],
            found = false,
        videoHandler  = function(localMediaStream: any) {
                this.video.src = window[urlKey[i]].createObjectURL(localMediaStream);
                this.video.play();
            },
            videoHandler2 = function(stream: any) {
                this.video.src = stream;
                this.video.play();
            },
            errorHandler  = function() {
                console.log('An error occurred while loading the camera. Please refresh and try again.');
            },
            key;

        for (var i = 0, l = getUserMediaKey.length; i < l; ++i) {
            key = getUserMediaKey[i];
            if (key in navigator) {
                if (i > 0) {
                    navigator[key]({ video: true }, videoHandler,  errorHandler);
                } else {
                    navigator[key]({ video: true }, videoHandler2, errorHandler);
                }
                found = true;
                break;
            }
        }

        if (!found) {
            this.getElem('useVideo').style = "display:none";
            this.getElem('useVideo').checked = false;
        }

        return found;
    }

    setupRequestAnimationFrame() : void {
        if (window.requestAnimationFrame) return;

        var found: boolean = false;
        ['oRequestAnimationFrame',
            'webkitRequestAnimationFrame',
            'mozRequestAnimationFrame'].forEach(function(impl) {
                var w: any = window;
                if (impl in w) {
                    w.requestAnimationFrame = function(callback) {
                        w[impl](function() {
                            callback();
                        });
                    };
                    found = true;
                }
            });

        if (!found) {
            var w: any = window;
            w.requestAnimationFrame = function(callback) {
                setTimeout(function() {
                    callback();
                }, 1000 / 60);
            };
        }
    }

    /* Shader setup */

    createShader(gl: any, type: string, source: string): any {
        var shader = gl.createShader(type);
        if (shader == null) {
            console.error('Error creating the shader with shader type: ' + type);
        }
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            var info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            console.error('Error while compiling the shader ' + info);
        }
        return shader;
    }

    createShaderFromURI (gl: any, type: string, uri: string, callback: any): any {
        callback(this.createShader(gl, type, this.getSourceById(uri)));
    }

    createProgramFromShaders(gl: any, vs: any, fs: any): any {
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        return program;
    }

    createProgramFromURIs(gl: any, params: any): any {
        var vsURI = params.vsURI,
            fsURI = params.fsURI,
            onComplete = params.onComplete;

        this.createShaderFromURI(gl, gl.VERTEX_SHADER, vsURI, function(vsShader) {
            this.createShaderFromURI(gl, gl.FRAGMENT_SHADER, fsURI, function(fsShader) {
                onComplete(this.createProgramFromShaders(gl, vsShader, fsShader));
            });
        });
    }
}


