var scrollOffsetX = 0, scrollOffsetY = 0, squareSize = 80;

var isShift = false;
addEventListener("keydown", function (e) {
	if (e.repeat) return;
	var scrollAmount = 0.1 * squareSize;
	if (e.key == "Shift") {
		isShift = true;
		addEventListener("keyup", function (e) {
			if (e.key == "Shift") {
				isShift = false;
			}
		});
	}
	if (e.key == "ArrowUp") {
		var stillScroll = true;
		function scroll() {
			scrollOffsetY += scrollAmount * (isShift ? 3 : 1);
			if (stillScroll) requestAnimationFrame(scroll);
		}
		requestAnimationFrame(scroll);
		addEventListener("keyup", function (e) {
			if (e.key == "ArrowUp") {
				stillScroll = false;
			}
		});
	}
	if (e.key == "ArrowDown") {
		var stillScroll = true;
		function scroll() {
			scrollOffsetY -= scrollAmount * (isShift ? 3 : 1);
			if (stillScroll) requestAnimationFrame(scroll);
		}
		requestAnimationFrame(scroll);
		addEventListener("keyup", function (e) {
			if (e.key == "ArrowDown") {
				stillScroll = false;
			}
		});
	}
	if (e.key == "ArrowLeft") {
		var stillScroll = true;
		function scroll() {
			scrollOffsetX += scrollAmount * (isShift ? 3 : 1);
			if (stillScroll) requestAnimationFrame(scroll);
		}
		requestAnimationFrame(scroll);
		addEventListener("keyup", function (e) {
			if (e.key == "ArrowLeft") {
				stillScroll = false;
			}
		});
	}
	if (e.key == "ArrowRight") {
		var stillScroll = true;
		function scroll() {
			scrollOffsetX -= scrollAmount * (isShift ? 3 : 1);
			if (stillScroll) requestAnimationFrame(scroll);
		}
		requestAnimationFrame(scroll);
		addEventListener("keyup", function (e) {
			if (e.key == "ArrowRight") {
				stillScroll = false;
			}
		});
	}
});

addEventListener("wheel", function (e) {
	var zoomOut = e.deltaY > 0;
	squareSize *= 0.96 ** (zoomOut ? 1 : -1);
	scrollOffsetX *= 0.96 ** (zoomOut ? 1 : -1);
	scrollOffsetX += window.innerWidth / 2 / (zoomOut ? 25 : -24);
	scrollOffsetY *= 0.96 ** (zoomOut ? 1 : -1);
	scrollOffsetY += window.innerHeight / 2 / (zoomOut ? 25 : -24);
});