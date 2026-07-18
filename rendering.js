var board = document.createElement("canvas");
board.id = "board";
board.width = innerWidth;
board.height = innerHeight;
document.body.appendChild(board);
var ctx = board.getContext("2d");

function tick() {
	if (updateFrame < 1) {
		requestAnimationFrame(tick);
		return;
	}
	var ctx = board.getContext("2d");
	if (!isFloating) {
		ctx.fillStyle = "#111";
		ctx.fillRect(0, 0, innerWidth, innerHeight);
	} else ctx.clearRect(0, 0, innerWidth, innerHeight);
	for (i = 0; i < b; i++) {
		for (j = 0; j < b; j++) {
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
				if (premove.length != 0) {
					if ((premove[1] == j) && (premove[2] == i)) {
						ctx.fillStyle = ((i + j) % 2 == 0 ? "#FF8" : "#BC4");
					}
					if ((premove[4] == j) && (premove[5] == i)) {
						ctx.fillStyle = ((i + j) % 2 == 0 ? "#E76" : "#D65");
					}
				}
				if (isFloating) ctx.globalCompositeOperation = "destination-over";
				ctx.fillRect(x1, y1, squareSize, squareSize);
				if (isFloating) ctx.globalCompositeOperation = "source-over";
				if (boardState) {
					if (boardState[i][j].piece != "none") {
						var img = new Image();
						img.src = "data:image/svg+xml;base64," + btoa(svg[boardState[i][j].piece].split("[COLOR]").join("#" + boardState[i][j].color));
						ctx.drawImage(img, 0, 0, 45, 45, (selectedSquare == j * b + i && isFloating ? mouseX - squareSize / 2 : x1), (selectedSquare == j * b + i && isFloating ? mouseY - squareSize / 2 : y1), (boardState[i][j].piece == "amazon" ? squareSize * 45 / 26 : squareSize), (boardState[i][j].piece == "amazon" ? squareSize * 45 / 26 : squareSize));
					};
					if (selectedSquare != -1)
						if (isLegalSquare(boardState[selectedSquare % b][Math.floor(selectedSquare / b)], Math.floor(selectedSquare / b), selectedSquare % b, boardState[i][j], j, i)) {
							ctx.fillStyle = "#0004";
							ctx.beginPath();
							ctx.arc(x1 + (squareSize / 2), y1 + (squareSize / 2), squareSize / 6, 0, Math.PI * 2);
							ctx.fill();
						}
				}
			}
		}
	}
	if (isFloating) {
		ctx.globalCompositeOperation = "destination-over";
		ctx.fillStyle = "#111";
		ctx.fillRect(0, 0, innerWidth, innerHeight);
		ctx.globalCompositeOperation = "source-over";
	}
	if (timeout > Date.now()) {
		ctx.fillStyle = "#000000" + Math.floor((timeout - Date.now()) * 256 / 1000).toString(16).toUpperCase().padStart(2, "0");
		// ctx.fillStyle = "#ff000077";
		ctx.fillRect(mouseX, mouseY, 100, 50);
		ctx.fillStyle = "#" + (char64.indexOf(socket.id[0]) * 64 + char64.indexOf(socket.id[1])).toString(16).toUpperCase().padStart(3, "0") + (char64.indexOf(socket.id[0]) * 64 + char64.indexOf(socket.id[1])).toString(16).toUpperCase().padStart(3, "0") + Math.floor((timeout - Date.now()) * 256 / 1000).toString(16).toUpperCase().padStart(2, "0");
		ctx.fillRect(mouseX, mouseY, 100 * (timeout - Date.now()) / 1000, 50);
		updateFrame = 5;
	}
	updateFrame--;
	if ((timeout <= Date.now()) && (premove.length != 0)) {
		selectedSquare = premove[1] * b + premove[2];
		mouseUp({
			clientX: (premove[4] * squareSize) + scrollOffsetX,
			clientY: (premove[5] * squareSize) + scrollOffsetY,
			isPremove: true
		});
		premove = [];
		timeout = Date.now() + 1000;
	}
	requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

window.addEventListener("resize", () => {
	board.width = innerWidth.toString();
	board.height = innerHeight.toString();
	if ((squareSize >= innerWidth) || (squareSize >= innerHeight)) squareSize = Math.min(innerWidth, innerHeight) * 0.9;
	updateFrame = 60;
});

var selectedSquare = -1, mouseX, mouseY, isFloating = false, timeout = Date.now(), premove = [];
board.addEventListener("mousemove", (e) => {
	mouseX = e.clientX;
	mouseY = e.clientY;
	updateFrame = 5;
});
board.addEventListener("mousedown", (e) => {
	var x = Math.floor((e.clientX - scrollOffsetX) / squareSize), y = Math.floor((e.clientY - scrollOffsetY) / squareSize);
	if ((x < 0) || (x > (b - 1)) || (y < 0) || (y > (b - 1))) return;
	if (boardState[y][x].owner == socket.id) {
		selectedSquare = x * b + y;
		isFloating = true;
		updateFrame = 5;
	}
});
function mouseUp(e) {
	var x = Math.floor((e.clientX - scrollOffsetX) / squareSize), y = Math.floor((e.clientY - scrollOffsetY) / squareSize);
	if (selectedSquare == -1) { updateFrame = 5; return; }
	if ((selectedSquare == x * b + y) && (!e.isPremove)) { isFloating = false; updateFrame = 5; return; }
	if ((x < 0) || (x > (b - 1)) || (y < 0) || (y > (b - 1))) { selectedSquare = -1; updateFrame = 5; return; }
	var selectedX = selectedSquare % b, selectedY = Math.floor(selectedSquare / b);
	if (timeout > Date.now()) {
		premove = [boardState[selectedX][selectedY], selectedY, selectedX, boardState[y][x], x, y];
		isFloating = false;
		selectedSquare = -1;
		updateFrame = 5;
		return;
	}
	if (isLegalSquare(boardState[selectedX][selectedY], selectedY, selectedX, boardState[y][x], x, y) === true) {
		var newSpot = boardState[y][x];
		boardState[y][x] = {
			piece: boardState[selectedX][selectedY].piece,
			color: boardState[selectedX][selectedY].color,
			owner: boardState[selectedX][selectedY].owner
		};
		boardState[selectedX][selectedY] = (newSpot.piece == "none" || newSpot.owner != "" ? {
			piece: "none",
			color: "FFF",
			owner: ""
		} : {
			piece: newSpot.piece,
			color: boardState[selectedX][selectedY].color,
			owner: boardState[selectedX][selectedY].owner
		});
		timeout = Date.now() + 1000;
		socket.emit('boardState', boardState);
	}
	if (isLegalSquare(boardState[selectedX][selectedY], selectedY, selectedX, boardState[y][x], x, y))
		if (isLegalSquare(boardState[selectedX][selectedY], selectedY, selectedX, boardState[y][x], x, y)[0].toUpperCase() === "O") {
			console.log("castle");
			var castle = isLegalSquare(boardState[selectedX][selectedY], selectedY, selectedX, boardState[y][x], x, y)[0];
			var castleSign = (castle == castle.toUpperCase() ? 1 : -1);
			boardState[y][x] = {
				piece: boardState[selectedX][selectedY].piece,
				color: boardState[selectedX][selectedY].color,
				owner: boardState[selectedX][selectedY].owner
			};
			boardState[selectedX][selectedY + castleSign] = {
				piece: boardState[selectedX][selectedY + castleSign * (castle.split("-").length + 1)].piece,
				color: boardState[selectedX][selectedY + castleSign * (castle.split("-").length + 1)].color,
				owner: boardState[selectedX][selectedY].owner
			};
			boardState[selectedX][selectedY] = {
				piece: "none",
				color: "FFF",
				owner: ""
			};
			boardState[selectedX][selectedY + castleSign * (castle.split("-").length + 1)] = {
				piece: "none",
				color: "FFF",
				owner: ""
			};
			timeout = Date.now() + 1000;
			socket.emit('boardState', boardState);
		}
	selectedSquare = -1;
	updateFrame = 5;
}
board.addEventListener("mouseup", mouseUp);

function isLegalSquare(piece1, x1, y1, piece2, x2, y2) {
	if (piece1.owner != socket.id || (piece2.owner == socket.id)) return false;
	var dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
	switch (piece1.piece) {
		case "pawn":
			if (((dx + dy == 1) && (piece2.piece == "none")) || (dx * dy == 1) && (piece2.piece != "none")) return true;
			return false;
		case "knight":
			if ((dx + dy == 3) && (dx * dy == 2)) return true;
			return false;
		case "bishop":
			if (Math.abs(dy / dx) != 1) return false;
			var bishopI, signOfX = (x2 - x1) / dx, signOfY = (y2 - y1) / dy;
			for (bishopI = 1; bishopI < dx; bishopI++) {
				if (boardState[y1 + bishopI * signOfY][x1 + bishopI * signOfX].piece != "none") return false;
			}
			return true;
		case "rook":
			if ((dy > 0) && (dx > 0)) return false;
			var rookI, signOfX = (dx == 0 ? 0 : (x2 - x1) / dx), signOfY = (dy == 0 ? 0 : (y2 - y1) / dy);
			for (rookI = 1; rookI < dx + dy; rookI++) {
				if (boardState[y1 + rookI * signOfY][x1 + rookI * signOfX].piece != "none") return false;
			}
			return true;
		case "queen":
			if ((dy > 0) && (dx > 0) && (Math.abs(dy / dx) != 1)) return false;
			var queenI, signOfX = (dx == 0 ? 0 : (x2 - x1) / dx), signOfY = (dy == 0 ? 0 : (y2 - y1) / dy);
			for (queenI = 1; queenI < (Math.abs(dy / dx) == 1 ? dx : dx + dy); queenI++) {
				if (boardState[y1 + queenI * signOfY][x1 + queenI * signOfX].piece != "none") return false;
			}
			return true;
		case "king":
			if ((dx <= 1) && (dy <= 1) && (dx + dy > 0)) return true;
			var signOfX = (dx == 0 ? 0 : (x2 - x1) / dx);
			// console.log(dx, signOfX);
			if ((dx == 2) && (dy == 0) && (boardState[y1][x1 + signOfX]?.piece == "none") && (piece2.piece == "none") && (boardState[y1][x1 + signOfX * 3]?.piece == "rook")) return (signOfX == -1 ? "o-o" : "O-O");
			if ((dx == 2) && (dy == 0) && (boardState[y1][x1 + signOfX]?.piece == "none") && (piece2.piece == "none") && (boardState[y1][x1 + signOfX * 3]?.piece == "none") && (boardState[y1][x1 + signOfX * 4]?.piece == "rook")) return (signOfX == -1 ? "o-o-o" : "O-O-O");
			return false;
		case "archbishop":
			if ((dx + dy == 3) && (dx * dy == 2)) return true;
			if (Math.abs(dy / dx) != 1) return false;
			var archbishopI, signOfX = (x2 - x1) / dx, signOfY = (y2 - y1) / dy;
			for (archbishopI = 1; archbishopI < dx; archbishopI++) {
				if (boardState[y1 + archbishopI * signOfY][x1 + archbishopI * signOfX].piece != "none") return false;
			}
			return true;
		case "chancellor":
			if ((dx + dy == 3) && (dx * dy == 2)) return true;
			if ((dy > 0) && (dx > 0)) return false;
			var chancellorI, signOfX = (dx == 0 ? 0 : (x2 - x1) / dx), signOfY = (dy == 0 ? 0 : (y2 - y1) / dy);
			for (chancellorI = 1; chancellorI < dx + dy; chancellorI++) {
				if (boardState[y1 + chancellorI * signOfY][x1 + chancellorI * signOfX].piece != "none") return false;
			}
			return true;
		case "amazon":
			if ((dx + dy == 3) && (dx * dy == 2)) return true;
			if ((dy > 0) && (dx > 0) && (Math.abs(dy / dx) != 1)) return false;
			var amazonI, signOfX = (dx == 0 ? 0 : (x2 - x1) / dx), signOfY = (dy == 0 ? 0 : (y2 - y1) / dy);
			for (amazonI = 1; amazonI < (Math.abs(dy / dx) == 1 ? dx : dx + dy); amazonI++) {
				if (boardState[y1 + amazonI * signOfY][x1 + amazonI * signOfX].piece != "none") return false;
			}
			return true;
		case "general":
			if ((dx + dy == 3) && (dx * dy == 2)) return true;
			if ((dx <= 1) && (dy <= 1) && (dx + dy > 0)) return true;
			return false;
	}
}