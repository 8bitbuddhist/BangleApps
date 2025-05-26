// place your const, vars, functions or classes here
const debug = false;  // Set to true to show debugging into
const Layout = require("Layout");
const Storage = require("Storage");
const mainFont = "Vector:20%";

const Command = {
  next: "next",
  playpause: "playpause",
  previous: "previous"
};

const PlaybackState = {
  paused: "paused",
  playing: "playing"
};

/**
 * Send a command via Bluetooth back to Gadgetbridge.
 * @param {"playpause"|"next"|"previous"} command
 */
function sendCommand(command) {
  Bluetooth.println(JSON.stringify({t: "music", n: command}));
  draw("title");
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
    {type: "txt", id: "title", font:"10%", label: "Unknown Track"},
    {type: "h", c: [
      {type: "btn", id: Command.previous, label: "|<<", cb: l=>sendCommand(Command.previous)},
      {type: "btn", id: Command.playpause, label: ">||", cb: l=>sendCommand(Command.playpause)},
      {type: "btn", id: Command.next, label: ">>|", cb: l=>sendCommand(Command.next)}
    ]},
  ]
}, {lazy: true});

/**
 * Redraw the screen.
 */
function draw(element) {
  layout.update(element);
  layout.render(element);
  if (debug) layout.debug();
}

/**
 * Get info about the current playing song.
 * @param {Object} info - Gadgetbridge musicinfo event
 */
function showTrackInfo(info) {
  layout.title.label = info.track || "Unknown Track";
  draw();
}

/**
 * Load previously saved music status.
 */
function loadFromStorage() {
  // check for saved music status (by widget) to load
  let saved = Storage.readJSON("gbmusic.load.json", true);
  Storage.erase("gbmusic.load.json");
  if (saved) {
    showTrackInfo(saved.info);
    return;
  }
}

detectEmulator();
loadFromStorage();

// Clear the screen
g.clear();
draw();

// TODO: Get updates from Gadgetbridge