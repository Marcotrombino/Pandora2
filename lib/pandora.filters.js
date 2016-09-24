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
