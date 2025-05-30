const AppName = "_aires_gbmusic";
setTimeout( // make other boot code run first, so we override e.g. android.boot.js GB
  () => {
    const APP = globalThis.__FILE__=== `${AppName}.app.js`,
      a = !!(require("Storage").readJSON(`${AppName}.json`, 1) || {}).autoStart;

    let state, info;
 
    /**
     * Store track info so the app can grab it later
     */
    function getTrackInfo() {
        require("Storage").writeJSON(`${AppName}.load.json`, {
        state: state,
        info: info,
      });
    }

    globalThis.GB = (_GB => e => {
      // we eat music events!
      switch(e.t) {
        case "musicinfo":
          info = e;
          return APP ? globalThis.showTrackInfo(e) : getTrackInfo();
        case "musicstate":
          state = e;
          return APP ? globalThis.updateState(e) : getTrackInfo();
        default:
          // pass on other events
          if (_GB) setTimeout(_GB, 0, e);
      }
    })(globalThis.GB);
  }, 1);
