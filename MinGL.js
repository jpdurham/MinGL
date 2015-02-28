var MinGL = (function () {
    function MinGL(canvas) {
        this.canvas = canvas;
        this.setupRequestAnimationFrame();
    }
    MinGL.prototype.getElem = function (id) {
        document.getElementById(id);
    };
    MinGL.prototype.getWebGLContext = function () {
        return this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    };
    MinGL.prototype.isWebGLSupported = function () {
        try {
            var w = window;
            return !!(w.WebGLRenderingContext && this.getWebGLContext());
        }
        catch (e) {
            return false;
        }
    };
    MinGL.prototype.getSourceById = function (id) {
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
    };
    MinGL.prototype.setupRequestAnimationFrame = function () {
        if (window.requestAnimationFrame)
            return;
        var found = false;
        ['oRequestAnimationFrame', 'webkitRequestAnimationFrame', 'mozRequestAnimationFrame'].forEach(function (impl) {
            var w = window;
            if (impl in w) {
                w.requestAnimationFrame = function (callback) {
                    w[impl](function () {
                        callback();
                    });
                };
                found = true;
            }
        });
        if (!found) {
            var w = window;
            w.requestAnimationFrame = function (callback) {
                setTimeout(function () {
                    callback();
                }, 1000 / 60);
            };
        }
    };
    /* Shader setup */
    MinGL.prototype.createShader = function (gl, type, source) {
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
    };
    MinGL.prototype.createShaderFromURI = function (gl, type, uri, callback) {
        callback(this.createShader(gl, type, this.getSourceById(uri)));
    };
    MinGL.prototype.createProgramFromShaders = function (gl, vs, fs) {
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        return program;
    };
    MinGL.prototype.createProgramFromURIs = function (gl, params) {
        var vsURI = params.vsURI, fsURI = params.fsURI, onComplete = params.onComplete;
        this.createShaderFromURI(gl, gl.VERTEX_SHADER, vsURI, function (vsShader) {
            this.createShaderFromURI(gl, gl.FRAGMENT_SHADER, fsURI, function (fsShader) {
                onComplete(this.createProgramFromShaders(gl, vsShader, fsShader));
            });
        });
    };
    return MinGL;
})();
