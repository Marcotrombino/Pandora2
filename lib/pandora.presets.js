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
    },

    preset04: function(_) {
      _.filter("grayscale");
      _.adjust("colorBalance", [40, 20, 20]);
      _.fill(['lighten', 'color', '#ff0000', 0.08]);
      _.fill(['lighten', 'color', '#406562', 0.5]);
      _.adjust("contrast", [13]);
    },

    preset05: function(_) {
     _.filter("grayscale");
     _.fill(['soft-light', 'color', '#000000', 1]);
     _.adjust("contrast", [10]);
    },

    preset06: function(_) {
      _.fill(['exclusion', 'color', '#0a0a30', 1]);
      _.fill(['overlay', 'color', '#e76c79', 1]);
      _.fill(['multiply', 'color', '#b8dff4', 0.4]);
      _.fill(['overlay', 'color', '#4fef3e', 0.26]);
      _.fill(['overlay', 'color', '#00baff', 0.35]);
      _.adjust("contrast", [15]);
    },

    preset07: function(_) {
      _.adjust("exposure", [3]);
      _.fill(['soft-light', 'color', '#ffb6e5', 0.6]);
      _.fill(['soft-light', 'color', '#001b70', 1]);
      _.fill(['exclusion', 'color', '#00353b', 0.8]);
      _.fill(['color-dodge', 'color', '#8fe1ff', 0.3]);
    },

    preset08: function(_) {
      _.fill(['soft-light', 'color', '#163cf9', 0.25]);
      _.fill(['lighter', 'color', '#1b1b1b', 0.78]);
      _.adjust("saturation", [1.15]);
    },

    preset09: function(_) {
      _.fill(['lighten', 'color', '#4a53a8', 0.4]);
      _.fill(['lighten', 'color', '#642c2e', 0.75]);
    },

    preset10: function(_) {
      _.fill(['color-dodge', 'color', '#93a84a', 0.23]);
      _.fill(['lighten', 'color', '#4a53a8', 0.25]);
    },

    preset11: function(_) {
      _.fill(['color-dodge', 'color', '#e9b46f', 0.25]);
      _.adjust("vibrance", [90]);
    },

    preset12: function(_) {
      _.fill(['color-dodge', 'color', '#7f7f7f', 0.3]);
      _.adjust("vibrance", [90]);
      _.adjust("saturation", [1.2]);
      _.adjust("brightness", [10]);
      _.adjust("contrast", [10]);
      _.fill(['color-dodge', 'color', '#233047', 0.25]);
      _.filter("sharpen", [0.35]);
    }
  };
