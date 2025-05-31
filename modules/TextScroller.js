/// How much padding to add to the end of the string.
const padding = 40;
/// How much to move the text each scroll.
const scrollLength = 10;

const State = {
	running: "running",
	stopped: "stopped"
};

let currentState = State.stopped;

/// The object that manages scrolling.
let scroller;

/**
 * Function for scrolling text on a screen.
 * @param {layoutObj} A Layout object of type txt that you want to scrollayoutObj.
 * @param {interval} How quickly to scroll the text.
 */
function TextScroller(layoutObj, interval) {
	this.layoutObj = layoutObj;
	this.interval = interval;

	/// Calculate the width, height, and current offset of the object.
  const	w = g.stringWidth(this.layoutObj.label) + padding,
  			y = this.layoutObj.y + (this.layoutObj.h / 2);

  this.layoutObj.offset = this.layoutObj.offset % w;
}

function render() {
	// Render the text
  g.setColor(this.layoutObj.col).setBgColor(this.layoutObj.bgCol) // need to set colors: iScroll calls this function outside Layout
    .setFontAlign(-1, 0) // left center
    .clearRect(this.layoutObj.x, this.layoutObj.y, this.layoutObj.x+this.layoutObj.w-1, this.layoutObj.y+this.layoutObj.h-1)
    .drawString(this.layoutObj.label, this.layoutObj.x - this.layoutObj.offset + padding, y)
    .drawString(this.layoutObj.label, this.layoutObj.x - this.layoutObj.offset + padding + w, y);
}

function scroll() {
	this.layoutObj.offset += 10;
	render();
}

TextScroller.prototype.pause = function() {
	if (currentState === State.stopped) return;
	if (scroller) scroller = clearInterval(scroller);
};

TextScroller.prototype.start = function() {
	if (currentState === State.running) return;
	if (scroller) scroller = setInterval(scroll, this.interval);
};

TextScroller.prototype.stop = function() {
	if (scroller) {
		clearInterval(scroller);
		scroller = null;
	}
	this.layoutObj.offset = 0;
};

exports = TextScroller;