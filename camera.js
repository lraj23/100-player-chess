let scrollOffsetX = 0, scrollOffsetY = 0, squareSize = 80;

let isShift = false;
addEventListener("keydown", e => {
	if (e.repeat) return;
	let scrollAmount = 0.1 * squareSize;
	if (e.key === "Shift") {
		isShift = true;
		addEventListener("keyup", e => {
			if (e.key === "Shift") {
				isShift = false;
			}
		});
	}
	if (e.key === "ArrowUp") {
		let stillScroll = true;
		function scroll() {
			scrollOffsetY += scrollAmount * (isShift ? 3 : 1);
			updateFrame = 5;
			if (stillScroll) requestAnimationFrame(scroll);
		}
		requestAnimationFrame(scroll);
		addEventListener("keyup", e => {
			if (e.key === "ArrowUp") {
				stillScroll = false;
			}
		});
	}
	if (e.key === "ArrowDown") {
		let stillScroll = true;
		function scroll() {
			scrollOffsetY -= scrollAmount * (isShift ? 3 : 1);
			updateFrame = 5;
			if (stillScroll) requestAnimationFrame(scroll);
		}
		requestAnimationFrame(scroll);
		addEventListener("keyup", e => {
			if (e.key === "ArrowDown") {
				stillScroll = false;
			}
		});
	}
	if (e.key === "ArrowLeft") {
		let stillScroll = true;
		function scroll() {
			scrollOffsetX += scrollAmount * (isShift ? 3 : 1);
			updateFrame = 5;
			if (stillScroll) requestAnimationFrame(scroll);
		}
		requestAnimationFrame(scroll);
		addEventListener("keyup", e => {
			if (e.key === "ArrowLeft") {
				stillScroll = false;
			}
		});
	}
	if (e.key === "ArrowRight") {
		let stillScroll = true;
		function scroll() {
			scrollOffsetX -= scrollAmount * (isShift ? 3 : 1);
			updateFrame = 5;
			if (stillScroll) requestAnimationFrame(scroll);
		}
		requestAnimationFrame(scroll);
		addEventListener("keyup", e => {
			if (e.key === "ArrowRight") {
				stillScroll = false;
			}
		});
	}
});

addEventListener("wheel", e => {
	let zoomOut = e.deltaY > 0;
	updateFrame = 5;
	squareSize *= 0.96 ** (zoomOut ? 1 : -1);
	scrollOffsetX *= 0.96 ** (zoomOut ? 1 : -1);
	scrollOffsetX += window.innerWidth / 2 / (zoomOut ? 25 : -24);
	scrollOffsetY *= 0.96 ** (zoomOut ? 1 : -1);
	scrollOffsetY += window.innerHeight / 2 / (zoomOut ? 25 : -24);
});