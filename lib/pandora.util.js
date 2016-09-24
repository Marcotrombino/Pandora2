  /**
   *  Load and return images before processing into the canvas
   *  @method Load
   *  @param {Array} list : Images url
   *  @return {Array} loaded img Objects
   */
   Pandora.load = function(list) {
     var cached = [];
     for (var i = 0; i < list.length; i++) {
       cached[i] = new Image();
       cached[i].src = list[i];
       cached[i].onerror = function() {
         console.error("Cannot find '" + this.src + "'");
       };
     }
     return cached;
   };

  /** Utility methods */
  Pandora.Util = {
    /**
    * Return CIE luminance from RGB
    * @method luminance
    * @param {Number} r : Red channel
    * @param {Number} g : Green channel
    * @param {Number} b : Blue channel
    * @return {Number} luminance
    */
    luminance: function(r, g, b) {
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    },

    /**
    * Return HSL from RGB
    * @method toHSL
    * @param {Number} r : Red channel
    * @param {Number} g : Green channel
    * @param {Number} b : Blue channel
    * @return {Array} hsl
    */
    toHSL: function(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      var max = m.max(r, g, b);
      var min = m.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;

          case g:
            h = (b - r) / d + 2;
            break;

          case b:
            h = (r - g) / d + 4;
            break;
        }
      }
      h /= 6;
      return {
        h: h,
        s: s,
        l: l
      };
    },

    /**
    * Return RGB from HSL
    * @method HSLtoRGB
    * @param {Number} h : Hue channel
    * @param {Number} s : Saturation channel
    * @param {Number} l : luminance channel
    * @return {Array} rgb
    */
    toRGB: function(h, s, l) {
      var r, g, b;
      if (s == 0) {
        r = g = b = l; //achromatic
      } else {
        function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      return {
        r: r * 255,
        g: g * 255,
        b: b * 255
      };
    },

    RGBtoHSV: function(r, g, b) {
          r = parseFloat(r) / 255;
          g = parseFloat(g) / 255;
          b = parseFloat(b) / 255;
          var max = Math.max(r, g, b);
          var min = Math.min(r, g, b);
          var v = max;
          var delta = max - min;
          if(max != 0)
            var s = delta / max;
          else {
            var s = 0;
            var h = -1;
          }
          if(r == max)
            var h = (g - b) / delta;
          else if(g == max)
            var h = 2 + (b - r) / delta;
          else
            var h = 4 + (r - g) / delta;
          var h = h * 60;
          if(h < 0)
            h += 360;

          return {
             h: h,
             s: s,
             v: v
          };
    },

    RGBtoCMYK: function(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      var max = Math.max(r, g, b);
      var min = Math.min(r, g, b);
      var k = 1 - max;
      var c = (1 - r - k) / (1 - k);
      var m = (1 - g - k) / (1 - k);
      var y = (1 - b - k) / (1 - k);
      return {
        c : c,
        m : m,
        y : y,
        k : k
      };
    },

    CMYKtoRGB: function(c, m, y, k) {
      return {
        r :  255 *(1 - c) * (1 - k),
        g : 255 *(1 - m) * (1 - k),
        b : 255 *(1 - y) * (1 - k)
      };
    },

    convolute: function(data, weights, offset, opaque) {
      var pixels = data;
      var side = m.round(m.sqrt(weights.length));
      var halfSide = m.floor(side / 2);
      var src = pixels.data;
      var sw = pixels.width;
      var sh = pixels.height;

      //pad output by the convolution matrix
      var w = sw;
      var h = sh;
      var offCanvas = document.createElement('canvas');
      offCanvas.width = data.width;
      offCanvas.height = data.height;
      var offCtx = offCanvas.getContext('2d');

      var output = offCtx.createImageData(w, h);
      var dst = output.data;

      //go through the destination image pixels
      var alphaFac = opaque ? 1 : 0;
      for (var y = 0; y < h; y++) {
        for (var x = 0; x < w; x++) {
          var sy = y;
          var sx = x;
          var dstOff = (y * w + x) * 4;
          //calculate the weighed sum of the source image pixels that
          //fall under the convolution matrix
          var r = 0,
            g = 0,
            b = 0,
            a = 0;
          for (var cy = 0; cy < side; cy++) {
            for (var cx = 0; cx < side; cx++) {
              var scy = sy + cy - halfSide;
              var scx = sx + cx - halfSide;
              if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                var srcOff = (scy * sw + scx) * 4;
                var wt = weights[cy * side + cx];
                r += src[srcOff] * wt;
                g += src[srcOff + 1] * wt;
                b += src[srcOff + 2] * wt;
                a += src[srcOff + 3] * wt;
              }
            }
          }
          dst[dstOff] = offset + r;
          dst[dstOff + 1] = offset + g;
          dst[dstOff + 2] = offset + b;
          dst[dstOff + 3] = a + alphaFac * (255 - a);
        }
      }
      return output;
    },

    changeContrast: function(v) {
      if (v > 0 && v <= 127) {
        v = m.sin(m.PI * (90 - v / 4) / 180) * v;
      } else if (v > 127) {
        v = m.sin(m.PI * (90 - (255 - v) / 4) / 180) * v;
      }
      return v;
    },

    // Gradients for fill
    gradients: function(ctx, gradient, width, height){
      switch (gradient) {
        case "blackToWhite":
          var grd = ctx.createLinearGradient(0, height, width, height);
          grd.addColorStop(0,"black");
          grd.addColorStop(1,"white");
          return grd;
        break;

        case "whiteToBlack":
          var grd = ctx.createLinearGradient(0, height, width, height);
          grd.addColorStop(0,"white");
          grd.addColorStop(1,"black");
          return grd;
        break;

        case "pannacotta":
          var grd = ctx.createLinearGradient(0, height, width, height);
          grd.addColorStop(0, 'rgba(220, 43, 59, 1.000)');
          grd.addColorStop(1, 'rgba(175, 214, 211, 1.000)');
          return grd;
        break;

        case "light-brick":
          var grd = ctx.createLinearGradient(0, height, width, height);
          grd.addColorStop(0, 'rgba(220, 43, 59, 1.000)');
          grd.addColorStop(1, 'rgba(147, 96, 92, 1.000)');
          return grd;
        break;

        case "brick":
          var grd = ctx.createLinearGradient(0, height, width, height);
          grd.addColorStop(0, 'rgba(220, 43, 59, 1.000)');
          grd.addColorStop(1, 'rgba(147, 96, 92, 1.000)');
          return grd;
        break;

        case "sprite":
        var grd = ctx.createLinearGradient(0, height, width, height);
        grd.addColorStop(0, 'rgba(78, 145, 246, 1.000)');
        grd.addColorStop(1, 'rgba(241, 251, 54, 1.000)');
        return grd;
      break;

    }}
  };
