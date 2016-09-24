  /** Pandora2 HTML5 image processing library
   * @version: 1.0
   * @date: 2016-09-24
   * UPDATE AND DOCS AT: https://github.com/Marcotrombino/Pandora2
   * @copyright (C) 2016 Marco Trombino
   * @author: Marco Trombino
   * This program is free software: you can redistribute it and/or modify
   * it under the terms of the GNU General Public License as published by
   * the Free Software Foundation, either version 3 of the License, or
   * (at your option) any later version.
   * This program is distributed in the hope that it will be useful,
   * but WITHOUT ANY WARRANTY; without even the implied warranty of
   * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   * GNU General Public License for more details.
   * You should have received a copy of the GNU General Public License
   * along with this program.  If not, see http://www.gnu.org/licenses.
   */

  /** @namespace Namespace for Pandora */
  var Pandora = Pandora || {};

  /** Shortcuts */
  var m = Math,
      doc = document;

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

  /**
   *  Constructs Document objects
   *  @class Document
   *  @constructor
   *  @namespace Pandora
   *  @param {Object} Custom configuration
   */
   Pandora.Document = function(Config) {
     /**
      * Configuration of the Document
      * @property {String}/{HTMLImageElement} source : Document background image
      * @property {HTMLCanvasElement} destID : Canvas output
      * @property {Number} width : Document width
      * @property {Number} height : Document height
      * @property {String} format : Format of output image
      * @property {Number} quality : Quality of output image
      */
     this.config = {
       source: null,
       destID: null,
       width: "auto",
       height: "auto",
       exportFormat: "jpeg",
       exportQuality: 0.75
     };
     this.init(Config);
   };

   /**
   * Init Document object
   * @method init
   * @param {Object} config : Custom configuration
   */
   Pandora.Document.prototype.init = function(Config) {
     var config = this.config;
     // Custom config
       if(typeof config == "object") {
         for(prop in Config) {
           if(config.hasOwnProperty(prop))
             this.config[prop] = Config[prop];
         }
       }

     // Init canvas
       if(config.destID)
        this.canvas = doc.getElementById(config.destID);
       else
        this.canvas = doc.createElement('canvas');
       this.ctx = this.canvas.getContext('2d');
       this.setBackground();
   };

   /**
   * Process image and render into the canvas
   * @method process
   * @param {String} type : Function type (adjustment, filter, preset...)
   * @param {String} func : Function name
   * @param {Array} params : Function parameters
   */
   Pandora.Document.prototype.process = function(type, func, params) {
     var data = this.ctx.getImageData(0, 0, this.config.width, this.config.height);
     this.ctx.putImageData(this[type][func](data, params), 0, 0);
   };

   /**
   * Return Base64 url from canvas
   * @method export
   * @return {String} Base64 url
   */
   Pandora.Document.prototype.export = function() {
     var config = this.config;
     return this.canvas.toDataURL("image/" + config.exportFormat, config.exportQuality);
   };

   /**
    * Set canvas background image from Document source
    * @method setBackground
    */
   Pandora.Document.prototype.setBackground = function() {
     var config = this.config;
     if(typeof config.source !== "object") {
        var path = config.source;
        config.source = new Image();
        config.source.src = path;
      }
      if(config.width == "auto")
        config.width = config.source.width;
      if(config.height == "auto")
        config.height = config.source.height;
      var initWidth = config.width;
      var initHeight = config.height;
      this.canvas.width = initWidth;
      this.canvas.height = initHeight;
      this.ctx.drawImage(config.source, 0, 0, initWidth, initHeight);
   };

   /**
    *  Adjust image
    *  @method adjust
    *  @param {String} func : Adjustment name
    *  @param {Array} params : Adjustment parameters
    */
   Pandora.Document.prototype.adjust = function(func, params) {
    if(typeof this.adjustments[func] == 'function') {
      if(params) this.process("adjustments", func, params);
      else console.error("Cannot find parameters.");
    }
    else console.error("Cannot find '" + func + "' adjustment.");
   };

   /**
    *  Filter image
    *  @method filter
    *  @param {String} func : Filter name
    *  @param {Array} params : Filter parameters
    */
   Pandora.Document.prototype.filter = function(func, params) {
     if(typeof this.filters[func] == 'function'){
       if(params) this.process("filters", func, params);
       else this.process("filters", func, []);
     }
     else console.error("Cannot find '" + func + "' filter.");
   };

   /**
   * Fill layer
   * @method fill
   * @param {String} blendMode : Layer blend mode (https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
   * @param {Boolean} gradient : Gradient flag
   * @param {String} fillingValue : fill value (HEX or gradient name from Pandora.Util.gradients)
   * @param {Number} alpha : alpha value (0 to 1)
   */
   Pandora.Document.prototype.fill = function(params) {
     var blendMode = params[0];
     var gradient = params[1];
     var fillingValue = params[2];
     var alpha = params[3];

     this.ctx.globalCompositeOperation = blendMode;
     this.ctx.beginPath();

     this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);

     if(gradient == true)
       var fillingValue = Pandora.Util.gradients(this.ctx, fillingValue, this.config.width, this.config.height);

     this.ctx.fillStyle = fillingValue;
     this.ctx.globalAlpha = alpha;
     this.ctx.fill();
   };

   /**
    *  Preset image
    *  @method preset
    *  @param {String} func : Preset name
    */
   Pandora.Document.prototype.preset = function(func) {
     if(typeof this.presets[func] == 'function') {
       this.presets[func](this);
     }
     else console.error("Cannot find '" + func + "' preset.");
   };

   /**
   * Blur with StackBlur
   * @method blur
   * @param {String} ratio : Blur ratio (1 to -)
   */
   Pandora.Document.prototype.blur = function() {
     var ratio = 1;
     if(arguments[0]) ratio = arguments[0];
     this.boxBlurCanvasRGBA(this.canvas, this.ctx, 0, 0, this.config.width, this.config.height, 10, ratio);
   };

   //------ StackBlur github.com/flozz/StackBlur
   Pandora.Document.prototype.boxBlurCanvasRGBA = function( canvas, context, top_x, top_y, width, height, radius, iterations ){
     var mul_table = [ 1,57,41,21,203,34,97,73,227,91,149,62,105,45,39,137,241,107,3,173,39,71,65,238,219,101,187,87,81,151,141,133,249,117,221,209,197,187,177,169,5,153,73,139,133,127,243,233,223,107,103,99,191,23,177,171,165,159,77,149,9,139,135,131,253,245,119,231,224,109,211,103,25,195,189,23,45,175,171,83,81,79,155,151,147,9,141,137,67,131,129,251,123,30,235,115,113,221,217,53,13,51,50,49,193,189,185,91,179,175,43,169,83,163,5,79,155,19,75,147,145,143,35,69,17,67,33,65,255,251,247,243,239,59,29,229,113,111,219,27,213,105,207,51,201,199,49,193,191,47,93,183,181,179,11,87,43,85,167,165,163,161,159,157,155,77,19,75,37,73,145,143,141,35,138,137,135,67,33,131,129,255,63,250,247,61,121,239,237,117,29,229,227,225,111,55,109,216,213,211,209,207,205,203,201,199,197,195,193,48,190,47,93,185,183,181,179,178,176,175,173,171,85,21,167,165,41,163,161,5,79,157,78,154,153,19,75,149,74,147,73,144,143,71,141,140,139,137,17,135,134,133,66,131,65,129,1];
     var shg_table = [0,9,10,10,14,12,14,14,16,15,16,15,16,15,15,17,18,17,12,18,16,17,17,19,19,18,19,18,18,19,19,19,20,19,20,20,20,20,20,20,15,20,19,20,20,20,21,21,21,20,20,20,21,18,21,21,21,21,20,21,17,21,21,21,22,22,21,22,22,21,22,21,19,22,22,19,20,22,22,21,21,21,22,22,22,18,22,22,21,22,22,23,22,20,23,22,22,23,23,21,19,21,21,21,23,23,23,22,23,23,21,23,22,23,18,22,23,20,22,23,23,23,21,22,20,22,21,22,24,24,24,24,24,22,21,24,23,23,24,21,24,23,24,22,24,24,22,24,24,22,23,24,24,24,20,23,22,23,24,24,24,24,24,24,24,23,21,23,22,23,24,24,24,22,24,24,24,23,22,24,24,25,23,25,25,23,24,25,25,24,22,25,25,25,24,23,24,25,25,25,25,25,25,25,25,25,25,25,25,23,25,23,24,25,25,25,25,25,25,25,25,25,24,22,25,25,23,25,25,20,24,25,24,25,25,22,24,25,24,25,24,25,25,24,25,25,25,25,22,25,25,25,24,25,24,25,18];
     if ( isNaN(radius) || radius < 1 ) return;

     radius |= 0;

     if ( isNaN(iterations) ) iterations = 1;
     iterations |= 0;
     if ( iterations > 3 ) iterations = 3;
     if ( iterations < 1 ) iterations = 1;

     var imageData = context.getImageData( top_x, top_y, width, height );


     var pixels = imageData.data;

     var rsum,gsum,bsum,asum,x,y,i,p,p1,p2,yp,yi,yw,idx,pa;
     var wm = width - 1;
       var hm = height - 1;
       var wh = width * height;
     var rad1 = radius + 1;

     var mul_sum = mul_table[radius];
     var shg_sum = shg_table[radius];

     var r = [];
       var g = [];
       var b = [];
     var a = [];

     var vmin = [];
     var vmax = [];

     while ( iterations-- > 0 ){
       yw = yi = 0;

       for ( y=0; y < height; y++ ){
         rsum = pixels[yw]   * rad1;
         gsum = pixels[yw+1] * rad1;
         bsum = pixels[yw+2] * rad1;
         asum = pixels[yw+3] * rad1;


         for( i = 1; i <= radius; i++ ){
           p = yw + (((i > wm ? wm : i )) << 2 );
           rsum += pixels[p++];
           gsum += pixels[p++];
           bsum += pixels[p++];
           asum += pixels[p]
         }

         for ( x = 0; x < width; x++ ) {
           r[yi] = rsum;
           g[yi] = gsum;
           b[yi] = bsum;
           a[yi] = asum;

           if( y==0) {
             vmin[x] = ( ( p = x + rad1) < wm ? p : wm ) << 2;
             vmax[x] = ( ( p = x - radius) > 0 ? p << 2 : 0 );
           }

           p1 = yw + vmin[x];
           p2 = yw + vmax[x];

           rsum += pixels[p1++] - pixels[p2++];
           gsum += pixels[p1++] - pixels[p2++];
           bsum += pixels[p1++] - pixels[p2++];
           asum += pixels[p1]   - pixels[p2];

           yi++;
         }
         yw += ( width << 2 );
       }

       for ( x = 0; x < width; x++ ) {
         yp = x;
         rsum = r[yp] * rad1;
         gsum = g[yp] * rad1;
         bsum = b[yp] * rad1;
         asum = a[yp] * rad1;

         for( i = 1; i <= radius; i++ ) {
           yp += ( i > hm ? 0 : width );
           rsum += r[yp];
           gsum += g[yp];
           bsum += b[yp];
           asum += a[yp];
         }

         yi = x << 2;
         for ( y = 0; y < height; y++) {

           pixels[yi+3] = pa = (asum * mul_sum) >>> shg_sum;
           if ( pa > 0 )
           {
             pa = 255 / pa;
             pixels[yi]   = ((rsum * mul_sum) >>> shg_sum) * pa;
             pixels[yi+1] = ((gsum * mul_sum) >>> shg_sum) * pa;
             pixels[yi+2] = ((bsum * mul_sum) >>> shg_sum) * pa;
           } else {
             pixels[yi] = pixels[yi+1] = pixels[yi+2] = 0;
           }
           if( x == 0 ) {
             vmin[y] = ( ( p = y + rad1) < hm ? p : hm ) * width;
             vmax[y] = ( ( p = y - radius) > 0 ? p * width : 0 );
           }

           p1 = x + vmin[y];
           p2 = x + vmax[y];

           rsum += r[p1] - r[p2];
           gsum += g[p1] - g[p2];
           bsum += b[p1] - b[p2];
           asum += a[p1] - a[p2];

           yi += width << 2;
         }
       }
     }
     context.putImageData( imageData, top_x, top_y );
   };

  /** Document adjustment methods
   *  @param {Array} data : Canvas data before being processed
   *  @param {Array} params : Function parameters
   *  @return {Array} data : Canvas data after being processed
   */
  Pandora.Document.prototype.adjustments = {
    /**
    * Brightness adjustment
    * @method brightness
    * @param {Number} value [params[0]]: Adjustment value (-150 to 150)
    */
    brightness: function(data, params) {
      var adj = params[0];
      if(adj < -150) adj = -150;
      else if(adj > 150) adj = 150;
      var px = data.data;
      for(var i=0; i< px.length; i+=4)
        px[i] += adj, px[i+1] += adj, px[i+2] += adj;
      return data;
    },

    /**
    * Contrast adjustment
    * @method contrast
    * @param {Number} value [params[0]]: Adjustment value (-50 to 100)
    */
    contrast: function(data, params) {
      var contrast = params[0];
      if(contrast < -50) contrast = -50;
      else if(contrast > 100) contrast = 100;
      var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      var px = data.data;
      for(var i=0; i< px.length; i+=4) {
        px[i] = factor * (px[i] - 128) + 128;
        px[i+1] = factor * (px[i+1] - 128) + 128;
        px[i+2] = factor * (px[i+2] - 128) + 128;
      }
      return data;
    },

    /**
    * Exposure adjustment
    * @method exposure
    * @param {Number} value [params[0]]: Adjustment value (-100 to 100)
    */
    exposure: function(data, params) {
      var value = params[0] / 100;
      if(value < -1) value = -1;
      else if(value > 1) value = 1;
      var px = data.data;
      for (var i = 0; i < px.length; i += 4) {
        px[i] = m.pow(px[i], (1 + value));
        px[i+1] = m.pow(px[i+1], (1 + value));
        px[i+2] = m.pow(px[i+2], (1 + value));
      }
      return data;
    },

    /**
    * Color balance adjustment
    * @method colorBalance
    * @param {Number} R [params[0]]: Red channel adjustment value (-255 to 255)
    * @param {Number} G [params[1]]: Green channel adjustment value (-255 to 255)
    * @param {Number} B [params[2]]: Blue channel adjustment value (-255 to 255)
    */
    colorBalance: function(data, params) {
      var R_ADJ = params[0], G_ADJ = params[1], B_ADJ = params[2];
      if(R_ADJ < -255) R_ADJ = -255; else if(R_ADJ > 255) R_ADJ = 255;
      if(G_ADJ < -255) G_ADJ = -255; else if(G_ADJ > 255) G_ADJ = 255;
      if(B_ADJ < -255) B_ADJ = -255; else if(B_ADJ > 255) B_ADJ = 255;
      var px = data.data;
      for (var i=0; i<px.length; i+=4)
        px[i] += + R_ADJ, px[i+1] += G_ADJ, px[i+2] += B_ADJ;
      return data;
    },

    /**
    * Threshold adjustment
    * @method threshold
    * @param {Number} value [params[0]]: Threshold adjustment value (0 to 255)
    */
    threshold: function(data, params) {
      var threshold = params[0] || 127;
      if(threshold < 0) threshold = 0;
      else if(threshold > 255) threshold = 255;
      var px = data.data;
      for (var i=0; i<px.length; i+=4)
        px[i] = px[i+1] = px[i+2] = Pandora.Util.luminance(px[i], px[i+1], px[i+2]) > threshold ? 255 : 0;
      return data;
    },

    /**
    * Gamma adjustment
    * @method gamma
    * @param {Number} value [params[0]]: Gamma adjustment value (0 to 5)
    */
    gamma: function(data, params) {
      var gamma = params[0];
      if(gamma < 0) gamma = 0;
      if(gamma > 5) gamma = 5;
      var px = data.data;
      for (var i = 0; i < px.length; i += 4) {
        px[i] = px[i] * gamma * gamma;
        px[i+1] = px[i+1] * gamma * gamma;
        px[i+2] = px[i+2] * gamma * gamma;
      }
      return data;
    },

    /**
    * Vibrance adjustment
    * @method vibrance
    * @param {Number} value [params[0]]: Vibrance adjustment value (-100 to 100)
    */
    vibrance: function(data, params) {
      if(params[0] < -100)
       params[0] = -100;
      else if(params[0] > 100)
       params[0] = 100;
      var level = params[0] * -1;
      var px = data.data;
      for (var i = 0; i < px.length; i += 4) {
        var max = m.max(px[i], px[i+1], px[i+2]);
        var avg = (px[i] + px[i+1] + px[i+2]) / 3;
        var amt = ((m.abs(max - avg) * 2 / 255) * level) / 100;
        if (px[i] !== max) {
          px[i] += (max - px[i]) * amt;
        }
        if (px[i+1] !== max) {
          px[i+1] += (max - px[i+1]) * amt;
        }
        if (px[i+2] !== max) {
          px[i+2] += (max - px[i+2]) * amt;
        }
      }
      return data;
    },

    /**
    * Saturation adjustment
    * @method saturation
    * @param {Number} value [params[0]]: Saturation adjustment value (0 to 10)
    */
    saturation: function(data, params) {
      var saturation = params[0];
      if(saturation < 0) saturation = 0;
      else if(saturation > 10) saturation = 10;
      var px = data.data;
      for (var i = 0; i < px.length; i += 4) {
        var hsl = Pandora.Util.toHSL(px[i], px[i+1], px[i+2]);
          hsl.s = m.min(m.max(hsl.s * saturation, 0), 1);
        var rgb = Pandora.Util.toRGB(hsl.h, hsl.s, hsl.l);
        px[i] = rgb.r, px[i+1] = rgb.g, px[i+2] = rgb.b;
      }
      return data;
   },

   /**
   * Hue adjustment
   * @method saturation
   * @param {Number} value [params[0]]: Hue value (0 to 360)
   */
   hue: function(data, params) {
     var hue = params[0];
     if(hue < 0) hue = 0;
     else if(hue > 360) hue = 360;
     var px = data.data;
     for (var i = 0; i < px.length; i += 4) {
       var hsl = Pandora.Util.toHSL(px[i], px[i+1], px[i+2]);
         hsl.h = hue / 360;
       var rgb = Pandora.Util.toRGB(hsl.h, hsl.s, hsl.l);
       px[i] = rgb.r, px[i+1] = rgb.g, px[i+2] = rgb.b;
     }
     return data;
   }
  };

  /** Document filter methods
   *  @param {Array} data : Canvas data before being processed
   *  @param {Array} params : Function parameters
   *  @return {Array} data : Canvas data after being processed
   */
  Pandora.Document.prototype.filters = {
    /**
    * Grayscale filter
    * @method grayscale
    * @param {Number} blendValue (optional)[params[0]]: Percentage of filter (0 to 1)
    */
    grayscale: function(data, params) {
      var blendValue = params[0] === undefined ? 1 : m.min(m.max(params[0], 0), 1);
      var px = data.data;
      for (var i = 0; i < px.length; i += 4) {
          //var grayscale = px[i] * .3 + px[i+1] * .59 + px[i+2] * .11;
          var lum = Pandora.Util.luminance(px[i], px[i+1], px[i+2]);
          px[i] = lum * blendValue + px[i] * (1 - blendValue);
          px[i+1] = lum * blendValue + px[i+1] * (1 - blendValue);
          px[i+2] = lum * blendValue + px[i+2] * (1 - blendValue);
      }
      return data;
    },

    /**
    * Sepia filter
    * @method sepia
    * @param {Number} blendValue (optional)[params[0]]: Percentage of filter (0 to 1)
    */
    sepia: function(data, params) {
      var blendValue = params[0] === undefined ? 1 : Math.min(Math.max(params[0], 0), 1);
      var px = data.data;
      for (var i = 0; i < px.length; i += 4) {
        var r = px[i], g = px[i+1], b = px[i+2];
        px[i] = (0.393 * r + 0.769 * g + 0.189 * b) * blendValue + r * (1 - blendValue);
        px[i+1] = (0.349 * r + 0.686 * g + 0.168 * b) * blendValue + g * (1 - blendValue);
        px[i+2] = (0.272 * r + 0.534 * g + 0.131 * b) * blendValue + b * (1 - blendValue);
      }
      return data;
    },

    /** Sepia2 filter @method sepia2 */
    sepia2: function(data, params) {
      var r = [0, 0, 0, 1, 1, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 12, 12, 12, 12, 13, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 17, 18, 19, 19, 20, 21, 22, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 39, 40, 41, 42, 44, 45, 47, 48, 49, 52, 54, 55, 57, 59, 60, 62, 65, 67, 69, 70, 72, 74, 77, 79, 81, 83, 86, 88, 90, 92, 94, 97, 99, 101, 103, 107, 109, 111, 112, 116, 118, 120, 124, 126, 127, 129, 133, 135, 136, 140, 142, 143, 145, 149, 150, 152, 155, 157, 159, 162, 163, 165, 167, 170, 171, 173, 176, 177, 178, 180, 183, 184, 185, 188, 189, 190, 192, 194, 195, 196, 198, 200, 201, 202, 203, 204, 206, 207, 208, 209, 211, 212, 213, 214, 215, 216, 218, 219, 219, 220, 221, 222, 223, 224, 225, 226, 227, 227, 228, 229, 229, 230, 231, 232, 232, 233, 234, 234, 235, 236, 236, 237, 238, 238, 239, 239, 240, 241, 241, 242, 242, 243, 244, 244, 245, 245, 245, 246, 247, 247, 248, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 254, 254, 254, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255];
      var g = [0, 0, 1, 2, 2, 3, 5, 5, 6, 7, 8, 8, 10, 11, 11, 12, 13, 15, 15, 16, 17, 18, 18, 19, 21, 22, 22, 23, 24, 26, 26, 27, 28, 29, 31, 31, 32, 33, 34, 35, 35, 37, 38, 39, 40, 41, 43, 44, 44, 45, 46, 47, 48, 50, 51, 52, 53, 54, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 67, 68, 69, 71, 72, 73, 74, 75, 76, 77, 79, 80, 81, 83, 84, 85, 86, 88, 89, 90, 92, 93, 94, 95, 96, 97, 100, 101, 102, 103, 105, 106, 107, 108, 109, 111, 113, 114, 115, 117, 118, 119, 120, 122, 123, 124, 126, 127, 128, 129, 131, 132, 133, 135, 136, 137, 138, 140, 141, 142, 144, 145, 146, 148, 149, 150, 151, 153, 154, 155, 157, 158, 159, 160, 162, 163, 164, 166, 167, 168, 169, 171, 172, 173, 174, 175, 176, 177, 178, 179, 181, 182, 183, 184, 186, 186, 187, 188, 189, 190, 192, 193, 194, 195, 195, 196, 197, 199, 200, 201, 202, 202, 203, 204, 205, 206, 207, 208, 208, 209, 210, 211, 212, 213, 214, 214, 215, 216, 217, 218, 219, 219, 220, 221, 222, 223, 223, 224, 225, 226, 226, 227, 228, 228, 229, 230, 231, 232, 232, 232, 233, 234, 235, 235, 236, 236, 237, 238, 238, 239, 239, 240, 240, 241, 242, 242, 242, 243, 244, 245, 245, 246, 246, 247, 247, 248, 249, 249, 249, 250, 251, 251, 252, 252, 252, 253, 254, 255];
      var b = [53, 53, 53, 54, 54, 54, 55, 55, 55, 56, 57, 57, 57, 58, 58, 58, 59, 59, 59, 60, 61, 61, 61, 62, 62, 63, 63, 63, 64, 65, 65, 65, 66, 66, 67, 67, 67, 68, 69, 69, 69, 70, 70, 71, 71, 72, 73, 73, 73, 74, 74, 75, 75, 76, 77, 77, 78, 78, 79, 79, 80, 81, 81, 82, 82, 83, 83, 84, 85, 85, 86, 86, 87, 87, 88, 89, 89, 90, 90, 91, 91, 93, 93, 94, 94, 95, 95, 96, 97, 98, 98, 99, 99, 100, 101, 102, 102, 103, 104, 105, 105, 106, 106, 107, 108, 109, 109, 110, 111, 111, 112, 113, 114, 114, 115, 116, 117, 117, 118, 119, 119, 121, 121, 122, 122, 123, 124, 125, 126, 126, 127, 128, 129, 129, 130, 131, 132, 132, 133, 134, 134, 135, 136, 137, 137, 138, 139, 140, 140, 141, 142, 142, 143, 144, 145, 145, 146, 146, 148, 148, 149, 149, 150, 151, 152, 152, 153, 153, 154, 155, 156, 156, 157, 157, 158, 159, 160, 160, 161, 161, 162, 162, 163, 164, 164, 165, 165, 166, 166, 167, 168, 168, 169, 169, 170, 170, 171, 172, 172, 173, 173, 174, 174, 175, 176, 176, 177, 177, 177, 178, 178, 179, 180, 180, 181, 181, 181, 182, 182, 183, 184, 184, 184, 185, 185, 186, 186, 186, 187, 188, 188, 188, 189, 189, 189, 190, 190, 191, 191, 192, 192, 193, 193, 193, 194, 194, 194, 195, 196, 196, 196, 197, 197, 197, 198, 199];
      var px = data.data;
      for (var i = 0; i < px.length; i += 4)
        px[i] = r[px[i]], px[i+1] = g[px[i+1]], px[i+2] = b[px[i+2]];
      return data;
    },

    /**
    * Noise filter
    * @method noise
    * @param {Number} value : Noise ratio (-255 to 255)
    * @param {Boolean} alpha : Alpha channel flag
    */
    noise: function(data, params) {
      var value = params[0];
      var alpha = params[1] || false;
      var px = data.data;
      for (var i = 0; i < px.length; i += 4) {
          var noise = -value / 2 + m.random() * value * 2;
          px[i] += noise, px[i+1] += noise, px[i+2] += noise;
          px[i+4] = alpha ? px[i+4] + noise : px[i+4];
      }
      return data;
    },

    /**
    * Invert filter
    * @method noise
    * @param {Boolean} R : Red channel invert flag
    * @param {Boolean} G : Green channel invert flag
    * @param {Boolean} B : Blue channel invert flag
    * @param {Boolean} intensity : Active channel intensity (0 to 255)
    */
    invert: function(data, params) {
      var activeChannels = [];
        var optionalValue = 255;
        if(params[0] == true)   activeChannels.push(0);
        if(params[1] == true)   activeChannels.push(1);
        if(params[2] == true)   activeChannels.push(2);
        if(typeof params[3] !== 'undefined')  optionalValue = parseInt(params[3]);
        if(activeChannels.length == 0)  activeChannels.push(0,1,2);
        var px = data.data;
        for (var i = 0; i < px.length / 4; i++) {
          var pixelSelected = i * 4;
          for(var j = 0; j < activeChannels.length; j++) {
            px[pixelSelected + activeChannels[j]] = optionalValue - px[pixelSelected + activeChannels[j]];
          }
        }
      return data;
    },

    /** HDR filter @method HDR */
    HDR: function(data, params) {
      var px = data.data;
      for (var i = 0; i < px.length; i += 4)
        px[i] = Pandora.Util.changeContrast(px[i]), px[i+1] = Pandora.Util.changeContrast(px[i+1]), px[i+2] = Pandora.Util.changeContrast(px[i+2]);
      return data;
    },

    /** Accentuate details @method sharpen */
    sharpen: function(data, params) {
      var alpha = params[0] || 1;
      var predata = data;
      var sharpendata = Pandora.Util.convolute(data, [0, -1, 0, -1, 5, -1, 0, -1, 0], 0, false);
      var sharpencanvas = doc.createElement('canvas');
       sharpencanvas.width = data.width;
       sharpencanvas.height = data.height;
       var sharpenctx = sharpencanvas.getContext('2d');
       sharpenctx.putImageData(sharpendata, 0, 0);
       var canvas = doc.createElement('canvas');
         canvas.width = data.width;
         canvas.height = data.height;
       var ctx = canvas.getContext('2d');
       ctx.putImageData(predata, 0, 0);
       ctx.globalAlpha = alpha;
       ctx.drawImage(sharpencanvas, 0, 0);
       return ctx.getImageData(0, 0, canvas.width, canvas.height);
    },

    /** Accentuate details (soft) @method sharpen2 */
    sharpen2: function(data, params) {
      var alpha = params[0] || 1;
      var predata = data;
      var sharpendata = Pandora.Util.convolute(data, [-1/256,-4/256,-6/256,-4/256,-1/256,-4/256,-16/256,-24/256,-16/256,-4/256,-6/256,-24/256,476/256,-24/256,-6/256,-4/256,-16/256,-24/256,-16/256,-4/256,-1/256,-4/256,-6/256,-4/256,-1/256], 0, true);
      var sharpencanvas = doc.createElement('canvas');
       sharpencanvas.width = data.width;
       sharpencanvas.height = data.height;
       var sharpenctx = sharpencanvas.getContext('2d');
       sharpenctx.putImageData(sharpendata, 0, 0);
       var canvas = doc.createElement('canvas');
         canvas.width = data.width;
         canvas.height = data.height;
       var ctx = canvas.getContext('2d');
       ctx.putImageData(predata, 0, 0);
       ctx.globalAlpha = alpha;
       ctx.drawImage(sharpencanvas, 0, 0);
       return ctx.getImageData(0, 0, canvas.width, canvas.height);
    },

    /** Emboss filter @method emboss */
    emboss: function(data, params) {
      return Pandora.Util.convolute(data, [2, 0, 0, 0, -1, 0, 0, 0, -1], 127, true);
    },

    /** Box blur @method boxBlur */
    boxBlur: function(data, params) {
      return Pandora.Util.convolute(data, [1/9,1/9,1/9,1/9,1/9,1/9,1/9,1/9,1/9], 0, false);
    },

    /** Gaussian blur @method boxBlur */
    gaussianBlur: function(data, params) {
      return Pandora.Util.convolute(data, [1/16,1/8,1/16,1/8,1/4,1/8,1/16,1/8,1/16], 0, false);
    },

    /** Edge detection 1 @method edge1 */
    edge1: function(data, params) {
      return Pandora.Util.convolute(data, [-1,-1,-1,-1,8,-1,-1,-1,-1], 0, true);
    },

    /** Edge detection 2 @method edge2 */
    edge2: function(data, params) {
      return Pandora.Util.convolute(data, [0,1,0,1,-4,1,0,1,0], 0, true);
    },

    /** Edge detection 3 @method edge3 */
    edge3: function(data, params) {
      return Pandora.Util.convolute(data, [1,0,-1,0,0,0,-1,0,1], 0, true);
    },

    /** motion blur @method motionBlur */
    motionBlur: function(data, params) {
      return Pandora.Util.convolute(data, [1/9, 0, 0, 0, 0, 0, 0, 0, 0,0, 1/9, 0, 0, 0, 0, 0, 0, 0,0, 0, 1/9, 0, 0, 0, 0, 0, 0,0, 0, 0, 1/9, 0, 0, 0, 0, 0,0, 0, 0, 0, 1/9, 0, 0, 0, 0,0, 0, 0, 0, 0, 1/9, 0, 0, 0,0, 0, 0, 0, 0, 0, 1/9, 0, 0,0, 0, 0, 0, 0, 0, 0, 1/9, 0,0, 0, 0, 0, 0, 0, 0, 0, 1/9], 0, false);
    }

  };

  /** Document preset methods */
  Pandora.Document.prototype.presets = {
    preset01: function(_) {
      _.fill(['difference', 'color', '#dc2b3b', 0.22]);
      _.fill(['soft-light', 'gradient', 'pannacotta', 1]);
      _.fill(['luminosity', 'gradient', 'brick', 0.22]);
      _.fill(['color-burn', 'color', '#93605c', 0.25]);
      _.fill(['saturation', 'gradient', 'light-brick', 0.22]);
      _.adjust("brightness", [20]);
    },

    preset02: function(_) {
      _.fill(['soft-light', 'color', '#03dbf0', 0.43]);
      _.fill(['overlay', 'color', '#9c4b4b', 0.70]);
      _.fill(['difference', 'color', '#293268', 0.30]);
      _.adjust("vibrance", [80]);
      _.fill(['lighter', 'color', '#293268', 0.05]);
    },

    preset03: function(_) {
      _.fill(['multiply', 'color', '#f7d9ad', 1]);
      _.fill(['soft-light', 'color', '#4e91f6', 0.61]);
      _.fill(['color-dodge', 'color', '#93615d', 0.35]);
      _.fill(['soft-light', 'gradient', 'sprite', 0.59]);
      _.adjust("brightness", [-6]);
      _.adjust("contrast", [40]);
      _.adjust("colorBalance", [0, 35, 60]);
    }
  };
