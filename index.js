var board = document.createElement("canvas");
board.id = "board";
board.width = window.innerWidth;
board.height = window.innerHeight;
var ctx = board.getContext("2d");
for (i = 0; i < 64; i++) {
	for (j = 0; j < 64; j++) {
		ctx.fillStyle = ((i + j) % 2 == 0 ? "#eed" : "#795");
		ctx.fillRect(j * 80, i * 80, 80, 80);
	}
}
document.body.appendChild(board);

window.addEventListener("resize", function () {
	board.width = window.innerWidth.toString();
	board.height = window.innerHeight.toString();
});

function tick() {
	var ctx = board.getContext("2d");
	ctx.fillStyle = "#111";
	ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
	for (i = 0; i < 64; i++) {
		for (j = 0; j < 64; j++) {
			ctx.fillStyle = ((i + j) % 2 == 0 ? "#eed" : "#795");
			ctx.fillRect(j * squareSize + scrollOffsetX, i * squareSize + scrollOffsetY, squareSize, squareSize);
		}
	}
	requestAnimationFrame(tick);
}
requestAnimationFrame(tick);