const probabilities1 = {
	amazon: 0.5,
	general: 0.7,
	queen: 0.8,
	archbishop: 2,
	chancellor: 2,
	bishop: 3,
	rook: 3,
	knight: 4,
	pawn: 4,
	none: 80
};
const probabilities2 = {
	amazon: 1,
	general: 5,
	queen: 10,
	archbishop: 10,
	chancellor: 10,
	bishop: 72,
	rook: 72,
	knight: 100,
	pawn: 120,
	none: 1600
};
const probabilities = probabilities1;
const char64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");
const b = 64;

function pickRandomWeighted(weights) {
	let total = Object.values(weights).reduce((accumulator, current) => accumulator + current);
	let items = Object.keys(weights);
	let random = Math.random();
	let pickCeiling = 0;
	for (let i = 0; i < items.length; i++) {
		pickCeiling += (weights[items[i]] / total);
		if (random < pickCeiling) return items[i];
	}
}
function weightsToPercents(weights) { // developer visualization purposes, not actually used
	let percents = {};
	let cleanOutput = [];
	let total = Object.values(weights).reduce((accumulator, current) => accumulator + current);
	let items = Object.keys(weights);
	for (let i = 0; i < items.length; i++) {
		percents[items[i]] = ("" + ((weights[items[i]] / total) * 100).toFixed(3) + "%");
		let itemName = items[i];
		cleanOutput.push(itemName + new Array(3 - Math.floor(itemName.length / 8)).fill("\t").join("") + ((weights[items[i]] / total) * 100).toFixed(3).padStart(6, "0") + "%");
	}
	return [percents, cleanOutput.join("\n")];
}

const http = require('http');
const url = require('url');
const fs = require('fs');
const pathfunc = require('path');
const socketio = require('socket.io');
let boardState = [];
// boardState = [
// 	[
// 		{
// 			piece: "rook",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "rook",
// 			color: "FFF",
// 			owner: ""
// 		},
// 	],
// 	[{ piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" },],
// 	[{ piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }],
// 	[{ piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }],
// 	[{ piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }],
// 	[{ piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }, { piece: "none", color: "FFF", owner: "" }],
// 	[{ piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" }, { piece: "pawn", color: "FFF", owner: "" },],
// 	[
// 		{
// 			piece: "rook",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "none",
// 			color: "FFF",
// 			owner: ""
// 		},
// 		{
// 			piece: "rook",
// 			color: "FFF",
// 			owner: ""
// 		},
// 	],
// ];
for (let i = 0; i < b; i++) {
	let dimension = [];
	for (let j = 0; j < b; j++) {
		dimension.push({
			"piece": pickRandomWeighted(probabilities),
			"color": "FFF",
			"owner": ""
		});
	}
	boardState.push(dimension);
}
setInterval(() => {
	let pieceSpawn = Math.floor(Math.random() * b * b), pieces = 0;
	while (boardState[Math.floor(pieceSpawn / b)][pieceSpawn % b].piece !== "none") {
		pieceSpawn = Math.floor(Math.random() * b * b);
		pieces++;
	}
	if (pieces < (3 * b / 4))
		boardState[Math.floor(pieceSpawn / b)][pieceSpawn % b] = {
			piece: pickRandomWeighted(probabilities),
			color: "FFF",
			owner: ""
		};
	io.emit('boardState', boardState);
}, 5000);

const server = http.createServer((req, res) => {
	let path = url.parse(req.url).pathname;
	if (path.slice(-1) === '/') path += 'index.html';
	fs.readFile(__dirname + path, (err, data) => {
		if (err) {
			res.writeHead(404);
			res.end();
		} else {
			let type = 'text/' + pathfunc.extname(path).substring(1);
			if (type === 'text/js') type = 'text/javascript';
			if (type === 'text/svg') type = 'image/svg+xml';
			res.writeHead(200, { 'Content-Type': type });
			res.end(data);
		}
	});
}).listen(8080);

const io = new socketio.Server(server);
io.on('connection', (socket) => {
	socket.on('disconnect', () => {
		for (let i = 0; i < b; i++) {
			for (let j = 0; j < b; j++) {
				let square = boardState[i][j];
				if (square.owner === socket.id) {
					boardState[i][j] = {
						"piece": (square.piece === "king" ? "none" : square.piece),
						"color": "FFF",
						"owner": ""
					};
					io.emit('boardState', boardState);
				}
			}
		}
	});
	socket.on('boardState', (stateOfBoard) => {
		boardState = stateOfBoard;
		io.emit('boardState', boardState);
	});
	let kingSpawn = Math.floor(Math.random() * b * b);
	while (boardState[Math.floor(kingSpawn / b)][kingSpawn % b].piece !== "none") {
		kingSpawn = Math.floor(Math.random() * b * b);
	}
	boardState[Math.floor(kingSpawn / b)][kingSpawn % b] = {
		piece: "king",
		color: (char64.indexOf(socket.id[0]) * 64 + char64.indexOf(socket.id[1])).toString(16).toUpperCase().padStart(3, "0"),
		owner: socket.id
	};
	io.emit('boardState', boardState);
	socket.emit('refocus', kingSpawn);
});