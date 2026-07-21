let board = document.createElement("canvas");
board.id = "board";
board.width = innerWidth;
board.height = innerHeight;
document.body.appendChild(board);

function tick() {
	if (updateFrame < 1) return requestAnimationFrame(tick);
	let ctx = board.getContext("2d");
	if (!isFloating) {
		ctx.fillStyle = "#111";
		ctx.fillRect(0, 0, innerWidth, innerHeight);
	} else ctx.clearRect(0, 0, innerWidth, innerHeight);
	for (let i = 0; i < b; i++) {
		for (let j = 0; j < b; j++) {
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
				ctx.fillStyle = ((i + j) % 2 === 0 ? "#EED" : "#795");
				if (premove.length !== 0) {
					if ((premove[1] === j) && (premove[2] === i)) {
						ctx.fillStyle = ((i + j) % 2 === 0 ? "#FF8" : "#BC4");
					}
					if ((premove[4] === j) && (premove[5] === i)) {
						ctx.fillStyle = ((i + j) % 2 === 0 ? "#F88" : "#B64");
					}
				}
				if (isFloating) ctx.globalCompositeOperation = "destination-over";
				ctx.fillRect(x1, y1, squareSize, squareSize);
				if (isFloating) ctx.globalCompositeOperation = "source-over";
				if (boardState) {
					if (boardState[i][j].piece !== "none") {
						let img = new Image();
						img.src = "data:image/svg+xml;base64," + btoa(svg[boardState[i][j].piece].split("[COLOR]").join("#" + boardState[i][j].color));
						ctx.drawImage(img, 0, 0, 45, 45, (selectedSquare === j * b + i && isFloating ? mouseX - squareSize / 2 : x1), (selectedSquare === j * b + i && isFloating ? mouseY - squareSize / 2 : y1), (boardState[i][j].piece === "amazon" ? squareSize * 45 / 26 : squareSize), (boardState[i][j].piece === "amazon" ? squareSize * 45 / 26 : squareSize));
					};
					if (selectedSquare !== -1)
						if (isLegalSquare(boardState[selectedSquare % b][Math.floor(selectedSquare / b)], Math.floor(selectedSquare / b), selectedSquare % b, boardState[i][j], j, i, false)) {
							ctx.fillStyle = "#0004";
							ctx.beginPath();
							ctx.arc(x1 + (squareSize / 2), y1 + (squareSize / 2), squareSize / 6, 0, Math.PI * 2);
							ctx.fill();
						}
						else if ((timeout > Date.now()) && isLegalSquare(boardState[selectedSquare % b][Math.floor(selectedSquare / b)], Math.floor(selectedSquare / b), selectedSquare % b, boardState[i][j], j, i, true)) {
							ctx.fillStyle = "#F004";
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
	if ((timeout <= Date.now()) && (premove.length !== 0)) {
		selectedSquare = premove[1] * b + premove[2];
		mouseUp({
			clientX: premove[4],
			clientY: premove[5],
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

let selectedSquare = -1, mouseX, mouseY, isFloating = false, timeout = Date.now(), premove = [];
board.addEventListener("mousemove", e => {
	mouseX = e.clientX;
	mouseY = e.clientY;
	updateFrame = 5;
});
board.addEventListener("mousedown", e => {
	let x = Math.floor((e.clientX - scrollOffsetX) / squareSize), y = Math.floor((e.clientY - scrollOffsetY) / squareSize);
	if ((x < 0) || (x > (b - 1)) || (y < 0) || (y > (b - 1))) return;
	if (boardState[y][x].owner === socket.id) {
		selectedSquare = x * b + y;
		isFloating = true;
		updateFrame = 5;
	}
});

function mouseUp(e) {
	let x2 = (e.isPremove ? e.clientX : Math.floor((e.clientX - scrollOffsetX) / squareSize)), y2 = (e.isPremove ? e.clientY : Math.floor((e.clientY - scrollOffsetY) / squareSize));
	if (selectedSquare === -1) { updateFrame = 5; return; }
	if ((selectedSquare === x2 * b + y2) && (!e.isPremove)) { isFloating = false; updateFrame = 5; return; }
	if ((x2 < 0) || (x2 > (b - 1)) || (y2 < 0) || (y2 > (b - 1))) { selectedSquare = -1; updateFrame = 5; return; }
	let x1 = Math.floor(selectedSquare / b), y1 = selectedSquare % b;
	if (timeout > Date.now() && isLegalSquare(boardState[y1][x1], x1, y1, boardState[y2][x2], x2, y2, true)) {
		(new Audio("./audio/premove.mp3")).play();
		premove = [boardState[y1][x1], x1, y1, boardState[y2][x2], x2, y2];
		console.log(premove, timeout, Date.now());
		isFloating = false;
		selectedSquare = -1;
		updateFrame = 5;
		return;
	}
	if (isLegalSquare(boardState[y1][x1], x1, y1, boardState[y2][x2], x2, y2, false)) socket.emit('move', [x1, y1, x2, y2], (ts, audio) => {
		timeout = ts;
		(new Audio("./audio/" + audio + ".mp3")).play();
	});
	else (new Audio("./audio/illegal.mp3")).play();
	selectedSquare = -1;
	updateFrame = 5;
}
board.addEventListener("mouseup", mouseUp);

function isLegalSquare(piece1, x1, y1, piece2, x2, y2, premove) {
	if (piece1.owner !== socket.id || (piece2.owner === socket.id)) return false;
	let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
	switch (piece1.piece) {
		case "pawn": {
			if (((dx + dy === 1) && (premove || (piece2.piece === "none"))) || (dx * dy === 1) && (premove || (piece2.piece !== "none"))) return true;
			if ((dx + dy !== 2) || (dx * dy !== 0) || (piece1.moved)) return false;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx), signOfY = (dy === 0 ? 0 : (y2 - y1) / dy);
			return (premove || (boardState[y1 + signOfY][x1 + signOfX]?.piece === "none") && (piece2.piece === "none"));
		}
		case "knight": {
			return (dx + dy === 3) && (dx * dy === 2);
		}
		case "bishop": {
			if (dx !== dy) return false;
			if (premove) return true;
			let signOfX = (x2 - x1) / dx, signOfY = (y2 - y1) / dy;
			for (let i = 1; i < dx; i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "rook": {
			if (dx * dy !== 0) return false;
			if (premove) return true;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx), signOfY = (dy === 0 ? 0 : (y2 - y1) / dy);
			for (let i = 1; i < dx + dy; i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "queen": {
			if ((dx * dy !== 0) && (dx !== dy)) return false;
			if (premove) return true;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx), signOfY = (dy === 0 ? 0 : (y2 - y1) / dy);
			for (let i = 1; i < (dy / dx === 1 ? dx : dx + dy); i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "king": {
			if ((dx <= 1) && (dy <= 1)) return true;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx);
			if ((dx === 2) && (dy === 0) && premove) return true;
			if ((dx !== 2) || (dy !== 0) || (boardState[y1][x1 + signOfX]?.piece !== "none") || (piece2.piece !== "none")) return false;
			let off3 = boardState[y1][x1 + signOfX * 3], off4 = boardState[y1][x1 + signOfX * 4];
			if ((off3?.piece === "rook") && ((off3?.owner === piece1.owner) || (off3?.owner === ""))) return (signOfX === -1 ? "o-o" : "O-O");
			if ((off3?.piece === "none") && (off4?.piece === "rook") && ((off4?.owner === piece1.owner) || (off4.owner === ""))) return (signOfX === -1 ? "o-o-o" : "O-O-O");
			return false;
		}
		case "archbishop": {
			if ((dx + dy === 3) && (dx * dy === 2)) return true;
			if (dx !== dy) return false;
			if (premove) return true;
			let signOfX = (x2 - x1) / dx, signOfY = (y2 - y1) / dy;
			for (let i = 1; i < dx; i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "chancellor": {
			if ((dx + dy === 3) && (dx * dy === 2)) return true;
			if (dx * dy !== 0) return false;
			if (premove) return true;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx), signOfY = (dy === 0 ? 0 : (y2 - y1) / dy);
			for (let i = 1; i < dx + dy; i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "amazon": {
			if ((dx + dy === 3) && (dx * dy === 2)) return true;
			if ((dx * dy !== 0) && (dx !== dy)) return false;
			if (premove) return true;
			let signOfX = (dx == 0 ? 0 : (x2 - x1) / dx), signOfY = (dy == 0 ? 0 : (y2 - y1) / dy);
			for (let i = 1; i < (dx == dy ? dx : dx + dy); i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "general": {
			return ((dx + dy == 3) && (dx * dy == 2)) || ((dx <= 1) && (dy <= 1));
		}
	}
}