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
const leaderboard = {};
const boardState = [];
const pickRandomWeighted = weights => {
	let total = Object.values(weights).reduce((accumulator, current) => accumulator + current);
	let items = Object.keys(weights);
	let random = Math.random();
	let pickCeiling = 0;
	for (let i = 0; i < items.length; i++) {
		pickCeiling += (weights[items[i]] / total);
		if (random < pickCeiling) return items[i];
	}
};
const weightsToPercents = weights => { // developer visualization purposes, not actually used
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
};
const socketIDToColor = id => (char64.indexOf(id[0]) * 64 + char64.indexOf(id[1])).toString(16).toUpperCase().padStart(3, "0");
const isLegalSquare = (x1, y1, x2, y2, id) => {
	let piece1 = boardState[y1][x1], piece2 = boardState[y2][x2];
	if (piece1.owner !== id || (piece2.owner === id)) return false;
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
};

export {
	probabilities,
	char64,
	b,
	leaderboard,
	boardState,
	pickRandomWeighted,
	weightsToPercents,
	socketIDToColor,
	isLegalSquare
};