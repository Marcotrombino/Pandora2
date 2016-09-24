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
