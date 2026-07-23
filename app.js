import { probabilities, char64, b, leaderboard, boardState, pickRandomWeighted, weightsToPercents, socketIDToColor, isLegalSquare } from './consts.js';
import { createServer } from 'http';
import { parse } from 'url';
import { readFile } from 'fs';
import { extname } from 'path';
import { Server } from 'socket.io';
import { GetColorName } from 'hex-color-to-color-name';

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

const server = createServer((req, res) => {
	let path = parse(req.url).pathname;
	if (path.slice(-1) === '/') path += 'index.html';
	readFile(import.meta.dirname + path, (err, data) => {
		if (err) {
			res.writeHead(404);
			res.end();
		} else {
			let type = 'text/' + extname(path).substring(1);
			if (type === 'text/js') type = 'text/javascript';
			if (type === 'text/svg') type = 'image/svg+xml';
			res.writeHead(200, { 'Content-Type': type });
			res.end(data);
		}
	});
}).listen(8080);

const io = new Server(server);
io.on('connection', socket => {
	let timeout = 0;
	socket.on('disconnect', () => dissociate(socket.id));
	socket.on('move', (data, callback) => {
		if (!Array.isArray(data)) return;
		if (data.length !== 4) return;
		if (!data.every(coord => Number.isInteger(coord) && coord > -1 && coord < b)) return;
		if (timeout > Date.now()) return;

		let x1 = data[0], y1 = data[1], x2 = data[2], y2 = data[3];
		if (isLegalSquare(...data, socket.id) === true) {
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
					delete leaderboard[destination.owner];
					leaderboard[socket.id].kills++;
					io.to(destination.owner).emit('refocus', y2 * b + x2);
					io.emit('audio', "game-end", x2, y2, destination.owner);
					io.emit('leaderboard', leaderboard);
					dissociate(destination.owner);
					setTimeout(() => spawn(destination.owner), 3000);
				}
				callback(timeout, (destination.piece === "none" ? "move-self" : "capture"));
			}
		}
		if (typeof isLegalSquare(...data, socket.id) === "string") {
			// checks for ALL string isLegalSquare values, not just castling
			// if other isLegalSquare string values are added, edit the above condition
			let castle = isLegalSquare(...data, socket.id), castleSign = (castle === castle.toUpperCase() ? 1 : -1);
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
	const spawn = id => {
		let kingSpawn = Math.floor(Math.random() * b * b);
		while (boardState[Math.floor(kingSpawn / b)][kingSpawn % b].piece !== "none") {
			kingSpawn = Math.floor(Math.random() * b * b);
		}
		boardState[Math.floor(kingSpawn / b)][kingSpawn % b] = {
			piece: "king",
			color: socketIDToColor(id),
			owner: id
		};
		leaderboard[id] = {
			name: GetColorName(socketIDToColor(id)).toLowerCase().split(" ").join("") + socketIDToColor(id),
			kills: 0
		};
		io.emit('leaderboard', leaderboard);
		io.emit('boardState', boardState);
		io.to(id).emit('refocus', kingSpawn);
		io.to(id).emit('spawned');
		io.emit('audio', "game-start", Math.floor(kingSpawn / b), kingSpawn % b, id);
	};
	const dissociate = id => {
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
		delete leaderboard[id];
		io.emit('leaderboard', leaderboard);
		io.emit('boardState', boardState);
	};
	io.emit('boardState', boardState);
	io.emit('leaderboard', leaderboard);
});