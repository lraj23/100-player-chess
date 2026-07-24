socket.on('connect', () => {
	const start = document.getElementById("start"), play = document.getElementById("play");
	play.onclick = () => {
		start.remove();
		socket.emit('spawn', socket.id);
	};
});

socket.on('spawned', () => {
	(new Audio("./audio/game-start.mp3")).play();
	isEndScreen = false;
});

let isEndScreen = false;
socket.on('boardState', state => {
	boardState = state;
	if (document.getElementById("play")) return;
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

socket.on('leaderboard', stats => leaderboard = stats);

socket.on('audio', (audio, x2, y2, id) => {
	if (id === socket.id) return;
	const distance = Math.sqrt(Math.pow(y2 - (innerHeight / 2 / squareSize) + (scrollOffsetY / squareSize), 2) + Math.pow(x2 - (innerWidth / 2 / squareSize) + (scrollOffsetX / squareSize), 2));
	const effect = new Audio("./audio/" + audio + ".mp3");
	effect.volume = Math.min(0.9, 0.9 / Math.pow(distance / 6, 2));
	if (effect.volume < 0.1) return;
	effect.play();
});