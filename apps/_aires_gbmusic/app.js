// For info on interfacing with Gadgetbridge, see https://www.espruino.com/Gadgetbridge
const AppName = "_aires_gbmusic.app.js";
const Debug = false;  // Set to true to show debugging into
const Layout = require("Layout");
const Storage = require("Storage");
const PrimaryFont = "Vector:18";

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

// Global playback state tracker.
// Follows the syntax {t:"musicstate", state:"play/pause",position,shuffle,repeat}

let appState = {t:"musicstate", state:"pause", position:0, shuffle:0, repeat:0};

/**
 * Send a command via Bluetooth back to Gadgetbridge.
 * @param {"play"|"pause"|"next"|"previous"} command
 */
function sendCommand(command) {
  Bluetooth.println(JSON.stringify({t: "music", n: command}));

  // If this is a play or pause command, update the app state
  if (command === Command.play) appState = PlaybackState.playing;
  if (command === Command.pause) appState = PlaybackState.paused;
}

/**
 * Detect whether we're using an emulator.
 */
function detectEmulator() {
  if (typeof Bluetooth==="undefined" || typeof Bluetooth.println==="undefined") { // emulator!
    Bluetooth = {
      println: (line) => {console.log("Bluetooth:", line);},
    };
  }
}

var layout = new Layout({
  type: "v", c: [
    {type: "txt", id: "title", font:PrimaryFont, label: "Unknown Track"},
    {type: "h", c: [
      {type: "btn", id: Command.previous, font: PrimaryFont, label: "|<<", cb: l=>sendCommand(Command.previous)},
      {type: "btn", id: "playpause", font: PrimaryFont, label: ">||", cb: l=>sendCommand(appState == PlaybackState.paused ? Command.play : Command.pause)},
      {type: "btn", id: Command.next, font: PrimaryFont, label: ">>|", cb: l=>sendCommand(Command.next)}
    ]},
  ]
}, {lazy: true});

/**
 * Get info about the current playing song.
 * @param {Object} info - Gadgetbridge musicinfo event
 */
function showTrackInfo(info) {
  layout.title.label = info ? info.track : "Unknown Track";
  layout.render();
  if (Debug) layout.debug();
}

/**
 * Load previously saved music status.
 */
function loadFromStorage() {
  // check for saved music status (by widget) to load
  let saved = Storage.readJSON(`"${AppName}.load.json`, true);
  Storage.erase(`${AppName}.load.json`);
  if (saved) {
    showTrackInfo(saved.info);
    return;
  }
}

/**
 * Updates the current state of the app.
 * Called when Gadgetbridge updates (see boot.js)
 * @param {*} state 
 */
function updateState(state) {
  appState = state;
}

// Start the app
detectEmulator();
loadFromStorage();

g.clear();
layout.render();