socket.on('connect', function () {
	var id = socket.id;
	var color = (char64.indexOf(id[0]) * 64 + char64.indexOf(id[1])).toString(16).toUpperCase().padStart(3, "0");
	console.log(color);
});

socket.on('boardState', (state) => {
	boardState = state;
	var isKing = false;
	for (i = 0; i < b; i++) {
		for (j = 0; j < b; j++) {
			if ((boardState[j][i].piece === 'king') && (boardState[j][i].owner === socket.id)) isKing = true;
		}
	}
	if (!isKing) location.reload();
	updateFrame = 10;
});

socket.on('refocus', (location) => {
	var x = location % b, y = Math.floor(location / b);
	scrollOffsetX = -x * squareSize;
	scrollOffsetX += innerWidth / 2 - squareSize / 2;
	scrollOffsetY = -y * squareSize;
	scrollOffsetY += innerHeight / 2 - squareSize / 2;
});