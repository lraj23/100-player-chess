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
io.on('connection', socket => {
	let timeout = 0;
	socket.on('disconnect', () => dissociate(socket.id));
	socket.on('move', (data, callback) => {
		if (!Array.isArray(data)) return;
		if (data.length !== 4) return;
		if (!data.every(coord => Number.isInteger(coord) && coord > -1 && coord < b)) return;
		if (timeout > Date.now()) return;

		let x1 = data[0], y1 = data[1], x2 = data[2], y2 = data[3];
		if (isLegalSquare(...data, socket) === true) {
			let destination = boardState[y2][x2];
			boardState[y2][x2] = {
				piece: boardState[y1][x1].piece,
				color: boardState[y1][x1].color,
				owner: boardState[y1][x1].owner,
				moved: true
			};
			boardState[y1][x1] = (((destination.piece === "none") || (destination.owner !== "")) ? {
				piece: "none",
				color: "FFF",
				owner: ""
			} : {
				piece: destination.piece,
				color: boardState[y1][x1].color,
				owner: boardState[y1][x1].owner
			});
			timeout = Date.now() + 1000;
			io.emit('boardState', boardState);

			if (typeof callback === "function") {
				io.emit('audio', (destination.piece === "none" ? "move-opponent" : "capture"), x2, y2, socket.id);
				if (destination.piece === "king") {
					io.emit('audio', "game-end", x2, y2, destination.owner);
					dissociate(destination.owner);
					setTimeout(() => spawn(destination.owner), 3000);
				}
				callback(timeout, (destination.piece === "none" ? "move-self" : "capture"));
			}
		}
		if (typeof isLegalSquare(...data, socket) === "string") {
			// checks for ALL string isLegalSquare values, not just castling
			// if other isLegalSquare string values are added, edit the above condition
			let castle = isLegalSquare(...data, socket), castleSign = (castle === castle.toUpperCase() ? 1 : -1);
			boardState[y2][x2] = {
				piece: boardState[y1][x1].piece,
				color: boardState[y1][x1].color,
				owner: boardState[y1][x1].owner
			};
			boardState[y1][x1 + castleSign] = {
				piece: boardState[y1][x1 + castleSign * (castle.split("-").length + 1)].piece,
				color: boardState[y1][x1].color,
				owner: boardState[y1][x1].owner
			};
			boardState[y1][x1] = {
				piece: "none",
				color: "FFF",
				owner: ""
			};
			boardState[y1][x1 + castleSign * (castle.split("-").length + 1)] = {
				piece: "none",
				color: "FFF",
				owner: ""
			};
			timeout = Date.now() + 1000;
			io.emit('boardState', boardState);

			if (typeof callback === "function") {
				io.emit('audio', "castle", x2, y2, socket.id);
				callback(timeout, "castle");
			}
		}
	});
	socket.once('spawn', id => spawn(id));
	function spawn(id) {
		let kingSpawn = Math.floor(Math.random() * b * b);
		while (boardState[Math.floor(kingSpawn / b)][kingSpawn % b].piece !== "none") {
			kingSpawn = Math.floor(Math.random() * b * b);
		}
		boardState[Math.floor(kingSpawn / b)][kingSpawn % b] = {
			piece: "king",
			color: (char64.indexOf(id[0]) * 64 + char64.indexOf(id[1])).toString(16).toUpperCase().padStart(3, "0"),
			owner: id
		};
		io.emit('boardState', boardState);
		io.to(id).emit('refocus', kingSpawn);
		io.to(id).emit('spawned');
		io.emit('audio', "game-start", Math.floor(kingSpawn / b), kingSpawn % b, id);
	}
	function dissociate(id) {
		for (let i = 0; i < b; i++) {
			for (let j = 0; j < b; j++) {
				let square = boardState[i][j];
				if (square.owner === id) {
					boardState[i][j] = {
						"piece": (square.piece === "king" ? "none" : square.piece),
						"color": "FFF",
						"owner": ""
					};
				}
			}
		}
		io.emit('boardState', boardState);
	}
	io.emit('boardState', boardState);
});

function isLegalSquare(x1, y1, x2, y2, socket) {
	let piece1 = boardState[y1][x1], piece2 = boardState[y2][x2];
	if (piece1.owner !== socket.id || (piece2.owner === socket.id)) return false;
	let dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
	switch (piece1.piece) {
		case "pawn": {
			if (((dx + dy === 1) && (piece2.piece === "none")) || (dx * dy === 1) && (piece2.piece !== "none")) return true;
			if ((dx + dy !== 2) || (dx * dy !== 0) || (piece1.moved)) return false;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx), signOfY = (dy === 0 ? 0 : (y2 - y1) / dy);
			return (boardState[y1 + signOfY][x1 + signOfX]?.piece === "none") && (piece2.piece === "none");
		}
		case "knight": {
			return (dx + dy === 3) && (dx * dy === 2);
		}
		case "bishop": {
			if (dx !== dy) return false;
			let signOfX = (x2 - x1) / dx, signOfY = (y2 - y1) / dy;
			for (let i = 1; i < dx; i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "rook": {
			if (dx * dy !== 0) return false;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx), signOfY = (dy === 0 ? 0 : (y2 - y1) / dy);
			for (let i = 1; i < dx + dy; i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "queen": {
			if ((dx * dy !== 0) && (dx !== dy)) return false;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx), signOfY = (dy === 0 ? 0 : (y2 - y1) / dy);
			for (let i = 1; i < (dy / dx === 1 ? dx : dx + dy); i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "king": {
			if ((dx <= 1) && (dy <= 1)) return true;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx);
			if ((dx !== 2) || (dy !== 0) || (boardState[y1][x1 + signOfX]?.piece !== "none") || (piece2.piece !== "none")) return false;
			let off3 = boardState[y1][x1 + signOfX * 3], off4 = boardState[y1][x1 + signOfX * 4];
			if ((off3?.piece === "rook") && ((off3?.owner === piece1.owner) || (off3?.owner === ""))) return (signOfX === -1 ? "o-o" : "O-O");
			if ((off3?.piece === "none") && (off4?.piece === "rook") && ((off4?.owner === piece1.owner) || (off4.owner === ""))) return (signOfX === -1 ? "o-o-o" : "O-O-O");
			return false;
		}
		case "archbishop": {
			if ((dx + dy === 3) && (dx * dy === 2)) return true;
			if (dx !== dy) return false;
			let signOfX = (x2 - x1) / dx, signOfY = (y2 - y1) / dy;
			for (let i = 1; i < dx; i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "chancellor": {
			if ((dx + dy === 3) && (dx * dy === 2)) return true;
			if (dx * dy !== 0) return false;
			let signOfX = (dx === 0 ? 0 : (x2 - x1) / dx), signOfY = (dy === 0 ? 0 : (y2 - y1) / dy);
			for (let i = 1; i < dx + dy; i++) {
				if (boardState[y1 + i * signOfY][x1 + i * signOfX].piece !== "none") return false;
			}
			return true;
		}
		case "amazon": {
			if ((dx + dy === 3) && (dx * dy === 2)) return true;
			if ((dx * dy !== 0) && (dx !== dy)) return false;
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