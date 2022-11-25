// @ts-nocheck

/**
 * Utility object
 */

  var CannyJS: any, GrayImageData, Util;

  Util = {};

  Util.generateMatrix = function(w, h, initialValue) {
    var matrix, x, y, _i, _j, _ref, _ref1;
    matrix = [];
    for (x = _i = 0, _ref = w - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
      matrix[x] = [];
      for (y = _j = 0, _ref1 = h - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
        matrix[x][y] = initialValue;
      }
    }
    return matrix;
  };


  /**
   * Class that represents gray-scaled image data
   */

  GrayImageData = (function() {

    /**
     * construct a new image data
     * @param {number} width of the image
     * @param {number} height of the image
     */
    function GrayImageData(width, height) {
      this.width = width;
      this.height = height;
      this.data = Util.generateMatrix(this.width, this.height, 0);
      this;
    }


    /**
     * load image data from canvas and store it as a matrix of gray-scaled pixels
     * @param {object} canvas object
     */

    GrayImageData.prototype.loadCanvas = function(canvas) {
      var b, ctx, d, g, i, r, rawdata, x, y, _i, _len;
      ctx = canvas.getContext('2d');
      rawdata = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      x = 0;
      y = 0;
      for (i = _i = 0, _len = rawdata.length; _i < _len; i = _i += 4) {
        d = rawdata[i];
        r = rawdata[i];
        g = rawdata[i + 1];
        b = rawdata[i + 2];
        this.data[x][y] = Math.round(0.298 * r + 0.586 * g + 0.114 * b);
        if (x === this.width - 1) {
          x = 0;
          y += 1;
        } else {
          x += 1;
        }
      }
      return this;
    };


    /**
     * get the neighbor of a given point
     * @param {number} x corrdinate of the point
     * @param {number} y corrdinate of the point
     * @param {number} size of the neighbors
     * @return {array} matrix of the neighbor of the point
     */

    GrayImageData.prototype.getNeighbors = function(x, y, size) {
      var i, j, neighbors, trnsX, trnsY, _i, _j, _ref, _ref1;
      neighbors = Util.generateMatrix(size, size, 0);
      for (i = _i = 0, _ref = size - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        neighbors[i] = [];
        for (j = _j = 0, _ref1 = size - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          trnsX = x - (size - 1) / 2 + i;
          trnsY = y - (size - 1) / 2 + j;
          if (this.data[trnsX] && this.data[trnsX][trnsY]) {
            neighbors[i][j] = this.data[trnsX][trnsY];
          } else {
            neighbors[i][j] = 0;
          }
        }
      }
      return neighbors;
    };


    /**
     * iterate all the pixel in the image data
     * @param {number} size of the neighbors given to
     * @param {function} function that will applied to the pixel
     */

    GrayImageData.prototype.eachPixel = function(neighborSize, func) {
      var current, neighbors, x, y, _i, _j, _ref, _ref1;
      for (x = _i = 0, _ref = this.width - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        for (y = _j = 0, _ref1 = this.height - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
          current = this.data[x][y];
          neighbors = this.getNeighbors(x, y, neighborSize);
          func(x, y, current, neighbors);
        }
      }
      return this;
    };


    /**
     * return linear array of the image data
     * @return {array} array of the pixel color data
     */

    GrayImageData.prototype.toImageDataArray = function() {
      var ary, i, x, y, _i, _j, _k, _ref, _ref1;
      ary = [];
      for (y = _i = 0, _ref = this.height - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
        for (x = _j = 0, _ref1 = this.width - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
          for (i = _k = 0; _k <= 2; i = ++_k) {
            ary.push(this.data[x][y]);
          }
          ary.push(255);
        }
      }
      return ary;
    };


    /**
     * return a deep copy of this object
     * @return {object} the copy of this object
     */

    GrayImageData.prototype.copy = function() {
      var copied, x, y, _i, _j, _ref, _ref1;
      copied = new GrayImageData(this.width, this.height);
      for (x = _i = 0, _ref = this.width - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; x = 0 <= _ref ? ++_i : --_i) {
        for (y = _j = 0, _ref1 = this.height - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; y = 0 <= _ref1 ? ++_j : --_j) {
          copied.data[x][y] = this.data[x][y];
        }
      }
      copied.width = this.width;
      copied.height = this.height;
      return copied;
    };


    /**
     * draw the image on a given canvas
     * @param {object} target canvas object
     */

    GrayImageData.prototype.drawOn = function(canvas) {
      var color, ctx, i, imgData, _i, _len, _ref;
      ctx = canvas.getContext('2d');
      imgData = ctx.createImageData(canvas.width, canvas.height);
      _ref = this.toImageDataArray();
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        color = _ref[i];
        imgData.data[i] = color;
      }
      return ctx.putImageData(imgData, 0, 0);
    };


    /**
     * fill the image with given color
     * @param {number} color to fill
     */

    GrayImageData.prototype.fill = function(color) {
      var x, y, _i, _ref, _results;
      _results = [];
      for (y = _i = 0, _ref = this.height - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; y = 0 <= _ref ? ++_i : --_i) {
        _results.push((function() {
          var _j, _ref1, _results1;
          _results1 = [];
          for (x = _j = 0, _ref1 = this.width - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; x = 0 <= _ref1 ? ++_j : --_j) {
            _results1.push(this.data[x][y] = color);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    return GrayImageData;

  })();


  /**
   * object that holds methods for image processing
   */

  CannyJS = {};


  /**
   * apply gaussian blur to the image data
   * @param {object} GrayImageData object
   * @param {number} [sigmma=1.4] value of sigmma of gauss function
   * @param {number} [size=3] size of the kernel (must be an odd number)
   * @return {object} GrayImageData object
   */

  CannyJS.gaussianBlur = function(imgData, sigmma, size) {
    var copy, kernel;
    if (sigmma == null) {
      sigmma = 1.4;
    }
    if (size == null) {
      size = 3;
    }
    kernel = CannyJS.generateKernel(sigmma, size);
    copy = imgData.copy();
    copy.fill(0);
    imgData.eachPixel(size, function(x, y, current, neighbors) {
      var i, j, _results;
      i = 0;
      _results = [];
      while (i <= size - 1) {
        j = 0;
        while (j <= size - 1) {
          copy.data[x][y] += neighbors[i][j] * kernel[i][j];
          j++;
        }
        _results.push(i++);
      }
      return _results;
    });
    return copy;
  };


  /**
   * generate kernel matrix
   * @param {number} [sigmma] value of sigmma of gauss function
   * @param {number} [size] size of the kernel (must be an odd number)
   * @return {array} kernel matrix
   */

  CannyJS.generateKernel = function(sigmma, size) {
    var e, gaussian, i, j, kernel, s, sum, x, y, _i, _j, _k, _l, _ref, _ref1, _ref2, _ref3;
    s = sigmma;
    e = 2.718;
    kernel = Util.generateMatrix(size, size, 0);
    sum = 0;
    for (i = _i = 0, _ref = size - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      x = -(size - 1) / 2 + i;
      for (j = _j = 0, _ref1 = size - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
        y = -(size - 1) / 2 + j;
        gaussian = (1 / (2 * Math.PI * s * s)) * Math.pow(e, -(x * x + y * y) / (2 * s * s));
        kernel[i][j] = gaussian;
        sum += gaussian;
      }
    }
    for (i = _k = 0, _ref2 = size - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
      for (j = _l = 0, _ref3 = size - 1; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; j = 0 <= _ref3 ? ++_l : --_l) {
        kernel[i][j] = (kernel[i][j] / sum).toFixed(3);
      }
    }
    console.log("kernel", kernel);
    return kernel;
  };


  /**
   * appy sobel filter to image data
   * @param {object} GrayImageData object
   * @return {object} GrayImageData object
   */

  CannyJS.sobel = function(imgData) {
    var copy, xFiler, yFiler;
    yFiler = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    xFiler = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    copy = imgData.copy();
    copy.fill(0);
    imgData.eachPixel(3, function(x, y, current, neighbors) {
      var ghs, gvs, i, j, _i, _j;
      ghs = 0;
      gvs = 0;
      for (i = _i = 0; _i <= 2; i = ++_i) {
        for (j = _j = 0; _j <= 2; j = ++_j) {
          ghs += yFiler[i][j] * neighbors[i][j];
          gvs += xFiler[i][j] * neighbors[i][j];
        }
      }
      return copy.data[x][y] = Math.sqrt(ghs * ghs + gvs * gvs);
    });
    return copy;
  };


  /**
   * appy non-maximum suppression to image data
   * @param {object} GrayImageData object
   * @return {object} GrayImageData object
   */

  CannyJS.nonMaximumSuppression = function(imgData) {
    var copy;
    copy = imgData.copy();
    copy.fill(0);
    imgData.eachPixel(3, function(x, y, c, n) {
      if (n[1][1] > n[0][1] && n[1][1] > n[2][1]) {
        copy.data[x][y] = n[1][1];
      } else {
        copy.data[x][y] = 0;
      }
      if (n[1][1] > n[0][2] && n[1][1] > n[2][0]) {
        copy.data[x][y] = n[1][1];
      } else {
        copy.data[x][y] = 0;
      }
      if (n[1][1] > n[1][0] && n[1][1] > n[1][2]) {
        copy.data[x][y] = n[1][1];
      } else {
        copy.data[x][y] = 0;
      }
      if (n[1][1] > n[0][0] && n[1][1] > n[2][2]) {
        return copy.data[x][y] = n[1][1];
      } else {
        return copy.data[x][y] = 0;
      }
    });
    return copy;
  };


  /**
   * appy hysteresis threshold to image data
   * @param {object} GrayImageData object
   * @param {number} [ht=150] value of high threshold
   * @param {number} [lt=100] value of low threshold
   * @return {object} GrayImageData object
   */

  CannyJS.hysteresis = function(imgData, ht, lt) {
    var copy, isCandidate, isStrong, isWeak, traverseEdge;
    copy = imgData.copy();
    isStrong = function(edge) {
      return edge > ht;
    };
    isCandidate = function(edge) {
      return edge <= ht && edge >= lt;
    };
    isWeak = function(edge) {
      return edge < lt;
    };
    imgData.eachPixel(3, function(x, y, current, neighbors) {
      if (isStrong(current)) {
        return copy.data[x][y] = 255;
      } else if (isWeak(current) || isCandidate(current)) {
        return copy.data[x][y] = 0;
      }
    });
    traverseEdge = function(x, y) {
      var i, j, neighbors, _i, _results;
      if (x === 0 || y === 0 || x === imgData.width - 1 || y === imgData.height - 1) {
        return;
      }
      if (isStrong(copy.data[x][y])) {
        neighbors = copy.getNeighbors(x, y, 3);
        _results = [];
        for (i = _i = 0; _i <= 2; i = ++_i) {
          _results.push((function() {
            var _j, _results1;
            _results1 = [];
            for (j = _j = 0; _j <= 2; j = ++_j) {
              if (isCandidate(neighbors[i][j])) {
                copy.data[x - 1 + i][y - 1 + j] = 255;
                _results1.push(traverseEdge(x - 1 + i, y - 1 + j));
              } else {
                _results1.push(void 0);
              }
            }
            return _results1;
          })());
        }
        return _results;
      }
    };
    copy.eachPixel(3, function(x, y) {
      return traverseEdge(x, y);
    });
    copy.eachPixel(1, function(x, y, current) {
      if (!isStrong(current)) {
        return copy.data[x][y] = 0;
      }
    });
    return copy;
  };


  /**
   * appy canny edge detection algorithm to canvas
   * @param {object} canvas object
   * @param {number} [ht=100] value of high threshold
   * @param {number} [lt=50] value of low threshold
   * @param {number} [sigmma=1.4] value of sigmma of gauss function
   * @param {number} [size=3] size of the kernel (must be an odd number)
   * @return {object} GrayImageData object
   */

  CannyJS.canny = function(canvas, ht, lt, sigmma, kernelSize) {
    var blur, imgData, nms, sobel;
    if (ht == null) {
      ht = 100;
    }
    if (lt == null) {
      lt = 50;
    }
    if (sigmma == null) {
      sigmma = 1.4;
    }
    if (kernelSize == null) {
      kernelSize = 3;
    }
    imgData = new GrayImageData(canvas.width, canvas.height);
    imgData.loadCanvas(canvas);
    blur = CannyJS.gaussianBlur(imgData, sigmma, kernelSize);
    sobel = CannyJS.sobel(blur);
    nms = CannyJS.nonMaximumSuppression(sobel);
    return CannyJS.hysteresis(nms, ht, lt);
  };





export {
  CannyJS,
  GrayImageData,
}