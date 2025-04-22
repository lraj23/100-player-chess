const probabilities = {
	pawn: 6,
	knight: 5,
	bishop: 3.5,
	rook: 3.5,
	queen: 0.5,
	none: 100
};
const char64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split("");

function pickRandomWeighted(weights) {
	var total = Object.values(weights).reduce(function (accumulator, current) {
		return accumulator + current;
	});
	var items = Object.keys(weights);
	var random = Math.random();
	var pickCeiling = 0;
	for (let i = 0; i < items.length; i++) {
		pickCeiling += (weights[items[i]] / total);
		if (random < pickCeiling) return items[i];
	}
}
function weightsToPercents(weights) { // developer visualization purposes, not actually used
	var percents = {};
	var cleanOutput = [];
	var total = Object.values(weights).reduce(function (accumulator, current) {
		return accumulator + current;
	});
	var items = Object.keys(weights);
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
var i, j;
var boardState = [];
for (i = 0; i < 64; i++) {
	var dimension = [];
	for (j = 0; j < 64; j++) {
		dimension.push({
			"piece": pickRandomWeighted(probabilities),
			"color": "FFF",
			"owner": ""
		});
	}
	boardState.push(dimension);
}

const server = http.createServer(function (req, res) {
	var path = url.parse(req.url).pathname;
	if (path.slice(-1) == '/') {
		path += 'index.html';
	}
	fs.readFile(__dirname + path, function (err, data) {
		if (err) {
			res.writeHead(404);
			res.end();
		} else {
			var type = 'text/' + pathfunc.extname(path).substring(1);
			if (type == 'text/js') type = 'text/javascript';
			if (type == 'text/svg') type = 'image/svg+xml';
			res.writeHead(200, { 'Content-Type': type });
			res.end(data);
		}
	});
}).listen(8080);

const io = new socketio.Server(server);
io.on('connection', (socket) => {
	io.emit('boardState', boardState);
	socket.on('disconnect', () => {
		for (i = 0; i < 64; i++) {
			for (j = 0; j < 64; j++) {
				var square = boardState[i][j];
				if (square.owner == socket.id) {
					boardState[i][j] = {
						"piece": (square.piece == "king" ? "none" : square.piece),
						"color": "FFF",
						"owner": ""
					};
					io.emit('boardState', boardState);
				}
			}
		}
	});
	var kingSpawn = Math.floor(Math.random() * 4096);
	while (boardState[Math.floor(kingSpawn / 64)][kingSpawn % 64].piece != "none") {
		kingSpawn = Math.floor(Math.random() * 4096);
	}
	boardState[Math.floor(kingSpawn / 64)][kingSpawn % 64] = {
		piece: "king",
		color: (char64.indexOf(socket.id[0]) * 64 + char64.indexOf(socket.id[1])).toString(16).toUpperCase().padStart(3, "0"),
		owner: socket.id
	};
	io.emit('boardState', boardState);
	socket.emit('refocus', kingSpawn);
});