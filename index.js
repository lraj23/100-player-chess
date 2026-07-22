socket.on('connect', () => {
	let id = socket.id, color = (char64.indexOf(id[0]) * 64 + char64.indexOf(id[1])).toString(16).toUpperCase().padStart(3, "0");
	console.log(color);
});

let start = document.getElementById("start");
start.onclick = () => {
	start.remove();
	socket.emit('spawn', socket.id);
	(new Audio("./audio/game-start.mp3")).play();
};

let isEndScreen = false;
socket.on('boardState', state => {
	boardState = state;
	if (document.getElementById("start")) return;
	let isKing = false;
	for (let i = 0; i < b; i++) {
		for (let j = 0; j < b; j++) {
			if ((boardState[j][i].piece === 'king') && (boardState[j][i].owner === socket.id)) isKing = true;
		}
	}
	if (!isKing && !isEndScreen) {
		(new Audio("./audio/game-end.mp3")).play();
		isEndScreen = Date.now();
		updateFrame += 5;
	}
	updateFrame += 5;
});

socket.on('refocus', location => {
	let x = location % b, y = Math.floor(location / b);
	scrollOffsetX = -x * squareSize;
	scrollOffsetX += innerWidth / 2 - squareSize / 2;
	scrollOffsetY = -y * squareSize;
	scrollOffsetY += innerHeight / 2 - squareSize / 2;
});

socket.on('audio', (audio, x2, y2, id) => {
	if (id === socket.id) return;
	let distance = Math.sqrt(Math.pow(y2 - (innerHeight / 2 / squareSize) + (scrollOffsetY / squareSize), 2) + Math.pow(x2 - (innerWidth / 2 / squareSize) + (scrollOffsetX / squareSize), 2));
	let effect = new Audio("./audio/" + audio + ".mp3");
	effect.volume = Math.min(0.9, 0.9 / Math.pow(distance / 6, 2));
	if (effect.volume < 0.1) return;
	effect.play();
});

socket.on('spawned', () => {
	(new Audio("./audio/game-start.mp3")).play();
	isEndScreen = false;
});