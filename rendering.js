var board = document.createElement("canvas");
board.id = "board";
board.width = window.innerWidth;
board.height = window.innerHeight;
document.body.appendChild(board);
var ctx = board.getContext("2d");

function tick() {
	if (updateFrame < 1) {
		requestAnimationFrame(tick);
		return;
	}
	var ctx = board.getContext("2d");
	ctx.fillStyle = "#111";
	ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
	for (i = 0; i < 64; i++) {
		for (j = 0; j < 64; j++) {
			let x1 = j * squareSize + scrollOffsetX;
			let x2 = x1 + squareSize;
			let y1 = i * squareSize + scrollOffsetY;
			let y2 = y1 + squareSize;
			if (
				(
					(((0 < x1) && (x1 < innerWidth)) || ((0 < x2) && (x2 < innerWidth)))
					&& (((0 < y1) && (y1 < innerHeight)) || ((0 < y2) && (y2 < innerHeight))))
				|| (
					((squareSize > innerWidth) || (squareSize > innerHeight))
					&& (
						(
							(x1 < 0) && (innerWidth < x2)
							&& (((0 < y1) && (y1 < innerHeight)) || ((0 < y2) && (y2 < innerHeight)))
						)
						|| (
							(((0 < x1) && (x1 < innerWidth)) || ((0 < x2) && (x2 < innerWidth)))
							&& (y1 < 0) && (innerHeight < y2)
						)
					)
				)
				|| (
					(squareSize > innerWidth)
					&& (squareSize > innerHeight)
					&& (x1 < 0) && (innerWidth < x2) && (y1 < 0) && (innerHeight < y2)
				)
			) {
				ctx.fillStyle = ((i + j) % 2 == 0 ? "#EED" : "#795");
				ctx.fillRect(x1, y1, squareSize, squareSize);
				if (boardState)
					if (boardState[i][j].piece != "none") {
						var img = new Image();
						img.src = "data:image/svg+xml;base64," + btoa(svg[boardState[i][j].piece].split("[COLOR]").join("#" + boardState[i][j].color));
						ctx.drawImage(img, 0, 0, 45, 45, x1, y1, squareSize, squareSize);
					};
			}
		}
	}
	updateFrame--;
	requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

window.addEventListener("resize", function () {
	board.width = window.innerWidth.toString();
	board.height = window.innerHeight.toString();
	if ((squareSize >= innerWidth) || (squareSize >= innerHeight)) squareSize = Math.min(innerWidth, innerHeight) * 0.9;
	updateFrame = 60;
});
