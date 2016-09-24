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
