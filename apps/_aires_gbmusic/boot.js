setTimeout( // make other boot code run first
  () => {
    const AppName = require("_aires_gbmusic.metadata.json").id;

    let state, info;
 
    /**
     * Store track info so the app can grab it later
     */
    function saveTrackInfo() {
      require("Storage").writeJSON(`${AppName}.load.json`, {
        state: state,
        info: info,
      });
    }

    /**
     * Check to see if we're currently running the app.
     * If so, send music events to the app.
     * If not, save music events for later.
     */
    const IsAppOpen = globalThis.__FILE__ === `${AppName}.app.js`;
    globalThis.GB = (_GB => e => {
      switch(e.t) {
        case "musicinfo":
          info = e;
          return IsAppOpen ? globalThis.showTrackInfo(e) : saveTrackInfo();
        case "musicstate":
          state = e;
          return IsAppOpen ? globalThis.updateState(e) : saveTrackInfo();
        default:
          // pass on other events
          if (_GB) setTimeout(_GB, 0, e);
      }
    })(globalThis.GB);
  }, 1);
