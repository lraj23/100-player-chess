const socket = io();
socket.on('connect', function () {
	var id = socket.id;
	var color = (char64.indexOf(id[0]) * 64 + char64.indexOf(id[1])).toString(16).toUpperCase().padStart(3, "0");
	console.log(color);
});

socket.on('boardState', (state) => { boardState = state; updateFrame = 10; });

socket.on('refocus', (location) => {
	var x = location % 64, y = Math.floor(location / 64);
	scrollOffsetX = -x * squareSize;
	scrollOffsetX += innerWidth / 2 - squareSize / 2;
	scrollOffsetY = -y * squareSize;
	scrollOffsetY += innerHeight / 2 - squareSize / 2;
});