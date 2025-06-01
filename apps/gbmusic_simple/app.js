// For info on interfacing with Gadgetbridge, see https://www.espruino.com/Gadgetbridge
const Debug = false;  // Set to true to show debugging into
const Layout = require("Layout");
const PrimaryFont = "Vector:18" || g.getFont();

const Command = {
  next: "next",
  pause: "pause",
  play: "play",
  previous: "previous"
};

const PlaybackState = {
  paused: "paused",
  playing: "playing"
};

/**
 * Global playback state tracker.
 * Follows the syntax {t:"musicstate", state:"play/pause",position,shuffle,repeat}
 */
let appState = { t: "musicstate", state: "pause", position: 0, shuffle: 0, repeat: 0 };

/// Track the curent runtime
let elapsedTimer;

/**
 * Define the screen layout.
 */
let layout = new Layout({
  type: "v", c: [
    { type: "txt", id: "title", halign: -1, fillx: 1, col: g.fg, font: PrimaryFont, label: "Unknown Track" },
    { type: "txt", id: "artist", halign: -1, fillx: 1, col: g.fg, font: PrimaryFont, label: "Unknown Artist" },
    { type: "h", c: [
      { type: "txt", id: "elapsed", halign: -1, fillx: 1, col: g.fg, font: PrimaryFont, label: "00:00" },
      { type: "txt", id: "timeSplitter", halign: 0, fillx: 1, col: g.fg, font: PrimaryFont, label: " - " },
      { type: "txt", id: "duration", halign: 1, fillx: 1, col: g.fg, font: PrimaryFont, label: "00:00" }
    ]},
    {
      type: "h", c: [
        { type: "btn", id: Command.previous, font: PrimaryFont, col: g.fg2, bgCol: g.bg2,  label: "|<<", cb: l => sendCommand(Command.previous) },
        { type: "btn", id: "playpause", font: PrimaryFont, col: g.fg2, bgCol: g.bg2, label: ">||", cb: l => sendCommand(appState.state === PlaybackState.paused ? Command.play : Command.pause) },
        { type: "btn", id: Command.next, font: PrimaryFont, col: g.fg2, bgCol: g.bg2, label: ">>|", cb: l => sendCommand(Command.next) }
      ]
    },
  ]
}, { lazy: true });

/**
 * Detect whether we're using an emulator.
 */
function detectEmulator() {
  if (typeof Bluetooth === "undefined" || typeof Bluetooth.println === "undefined") { // emulator!
    Bluetooth = {
      println: (line) => { console.log("Bluetooth:", line); },
    };
  }
}

/**
 * Send a command via Bluetooth back to Gadgetbridge.
 * @param {"play"|"pause"|"next"|"previous"} command
 */
function sendCommand(command) {
  Bluetooth.println(JSON.stringify({ t: "music", n: command }));

  // If this is a play or pause command, update the app state
  if (command === Command.play) {
    updateState(PlaybackState.playing);
  }
  else if (command === Command.pause) {
    updateState(PlaybackState.paused);
  };
}

/// Track how long the current song has been running.
var songElapsed = 0;
function updateTime() {
  songElapsed++;
  layout.elapsed.label = formatTime(songElapsed);
  layout.render(layout.elapsed.label);
}

function formatTime(time) {
  let minutes = Math.floor(time / 60);
  let seconds = time % 60;
  return `${minutes}:${seconds}`;
}

/**
 * Get info about the current playing song.
 * @param {Object} info - Gadgetbridge musicinfo event
 */
function showTrackInfo(info) {
  layout.title.label = info ? info.track : "Unknown Track";
  layout.artist.label = info ? info.artist : "Unknown Track";
  layout.elapsed.label = "00:00";
  layout.duration.label = info ? formatTime(info.dur) : "00:00";
  layout.render();
  if (Debug) layout.debug();
}

/**
 * Updates the current state of the app.
 * Called when Gadgetbridge updates (see boot.js)
 * @param {*} state 
 */
function updateState(state) {
  appState.state = state;

  if (appState.state === "play" ) {
    elapsedTimer = setInterval(updateTime, 200);
  }
  else if (appState.state === "pause" ) {
    clearInterval(elapsedTimer);
  }
}

/**
 * Listen for Gadgetbridge events
 */
setTimeout(
  () => {
    /**
     * Read music events from Gadgetbridge.
     */
    globalThis.GB = (_GB => e => {
      switch (e.t) {
        case "musicinfo":
          return showTrackInfo(e);
        case "musicstate":
          return updateState(e);
        default:
          // pass on other events
          if (_GB) setTimeout(_GB, 0, e);
      }
    })(globalThis.GB);
  }, 1);


// Start the app
detectEmulator();

g.clear();
layout.render();