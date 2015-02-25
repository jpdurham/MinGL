var mingl = {
    getElem: function(id) {
        return document.getElementById(id)
    },

    isWebGlSupported: function() {
        try {
            var canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    },

    getWebGLContext: function(canvas) {
        return canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    },

    createShader: function(gl, type, source) {
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
    },

    getSourceSynch: function(id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
                return null;
            }

            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
                if (k.nodeType == 3) {
                    str += k.textContent;
                }
                k = k.nextSibling;
            }
        return str;
    },

    createShaderFromURI: function(gl, type, uri, callback) {
        callback(this.createShader(gl, type, this.getSourceSynch(uri)));
    },

    createProgramFromShaders: function(gl, vs, fs) {
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        return program;
    },

    createProgramFromURIs: function(gl, params) {
        var vsURI = params.vsURI,
            fsURI = params.fsURI,
            onComplete = params.onComplete;

        this.createShaderFromURI(gl, gl.VERTEX_SHADER, vsURI, function(vsShader) {
            minglib.createShaderFromURI(gl, gl.FRAGMENT_SHADER, fsURI, function(fsShader) {
                onComplete(minglib.createProgramFromShaders(gl, vsShader, fsShader));
            });
        });
    }
};

(function() {
  if (window.requestAnimationFrame) return;

  var found = false;
  ['oRequestAnimationFrame',
   'webkitRequestAnimationFrame',
   'mozRequestAnimationFrame'].forEach(function(impl) {

    if (impl in window) {
      window.requestAnimationFrame = function(callback) {
        window[impl](function() {
          callback();
        });
      };
      found = true;
    }
  });
  if (!found) {
    window.requestAnimationFrame = function(callback) {
      setTimeout(function() {
        callback();
      }, 1000 / 60);
    };
  }
})();
