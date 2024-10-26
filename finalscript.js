var origBoard;
const huPlayer = 'O';
const aiPlayer = 'X';
let currentPlayer=huPlayer;
let aiMode=false;

// const winCombos = [
// 	[0, 1, 2],
// 	[3, 4, 5],
// 	[6, 7, 8],
// 	[0, 3, 6],
// 	[1, 4, 7],
// 	[2, 5, 8],
// 	[0, 4, 8],
// 	[6, 4, 2]
// ]


function toggleAIMode() {
	aiMode = !aiMode; // Toggle AI mode
	const modeButton = document.querySelector('button[onclick="toggleAIMode()"]');
	modeButton.innerText = aiMode ? "Switch to Player Mode" : "Switch to AI Mode";
	generateMatrix(); // Restart game when mode changes
}


function generateWinCombos(n) {
    let winCombos = [];

    // Horizontal win conditions
    for (let i = 0; i < n; i++) {
        let row = [];
        for (let j = 0; j < n; j++) {
            row.push(i * n + j); // Cells in the same row
        }
        winCombos.push(row);
    }

    // Vertical win conditions
    for (let i = 0; i < n; i++) {
        let col = [];
        for (let j = 0; j < n; j++) {
            col.push(j * n + i); // Cells in the same column
        }
        winCombos.push(col);
    }

    // Diagonal win conditions (top-left to bottom-right)
    let diag1 = [];
    for (let i = 0; i < n; i++) {
        diag1.push(i * n + i); // Diagonal cells from top-left to bottom-right
    }
    winCombos.push(diag1);

    // Diagonal win conditions (top-right to bottom-left)
    let diag2 = [];
    for (let i = 0; i < n; i++) {
        diag2.push((i + 1) * (n - 1)); // Diagonal cells from top-right to bottom-left
    }
    winCombos.push(diag2);

    return winCombos;
}

//const boardSize = submitBoardSize()

function generateMatrix() {
    const boardSizeInput = document.getElementById("boardSize");
    const matrixContainer = document.getElementById("matrix-container");
    const n = parseInt(boardSizeInput.value);
    window.winCombos = generateWinCombos(n);
    window.nu = n;

    // Clear any existing matrix
    matrixContainer.innerHTML = "";

    // Validate the input size
    if (isNaN(n) || n < 2 || n > 10) {
        alert("Please enter a valid board size between 2 and 10.");
        return;
    }

    // Create a table element
    const table = document.createElement("table");
    let cellId = 0;  // Initialize cell ID counter

    // Generate n x n cells
    for (let i = 0; i < n; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < n; j++) {
            const cell = document.createElement("td");
            cell.classList.add("cell");     // Add class 'cell'
            cell.id = cellId++;             // Assign unique ID from 0 to n*n-1
            cell.addEventListener('click', turnClick, false);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    // Append the table to the matrix container
    matrixContainer.appendChild(table);

    startGame();
}

const cells = document.querySelectorAll('.cell');
//startGame();



function startGame() {
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(nu * nu).keys());

    currentPlayer = huPlayer;

    //console.log(nu);
    // console.log(origBoard.filter(s => typeof s == 'number'));
    // console.log(winCombos.length);
    // for (let i = 0; i < winCombos.length; i++) {
    // 	console.log(winCombos[i].join(" ")); // Joins elements with a space for better formatting
    //   }


    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function turnClick(square) {
	if (typeof origBoard[square.target.id] == 'number') 
		{
		turn(square.target.id, currentPlayer);
		if (!checkWin(origBoard, currentPlayer) && !checkTie() && aiMode && currentPlayer === huPlayer)
			 {
			turn(bestSpot(), aiPlayer); // AI's move if in AI mode
		} else 
		{
			currentPlayer = currentPlayer === huPlayer ? aiPlayer : huPlayer;
		}
	}
}


// //async
// function turnClick(square) {
//     if (typeof origBoard[square.target.id] == 'number') {
//         turn(square.target.id, huPlayer)
//         //await delay(300); 
//         if (!checkWin(origBoard, huPlayer) && !checkTie()) turn(bestSpot(), aiPlayer);

//     }
// }

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(origBoard, player)
    if (gameWon) gameOver(gameWon)
}

// explanation needed
function checkWin(board, player) {
    let plays = board.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

// explanation needed
function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player == huPlayer ? "blue" : "red";
    }
    for (var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    if (aiMode != false) {
        declareWinner(gameWon.player == huPlayer ? "You win!" : "You lose.");

    }
    else {
        declareWinner(gameWon.player == huPlayer ? "Player 1 Won" : "Player 2 Won");
    }
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    return minimax(origBoard, aiPlayer).index;
}

// explanation needed
function checkTie() {
    if (emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "green";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!")
        return true;
    }
    return false;
}

// explanation needed
function minimax(newBoard, player) {
    var availSpots = emptySquares(); // array of available sqaures

    if (checkWin(newBoard, huPlayer)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }
    var moves = [];
    for (var i = 0; i < availSpots.length; i++) {
        var move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player == aiPlayer) {
            var result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            var result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;

        moves.push(move);
    }

    var bestMove;
    if (player === aiPlayer) {
        var bestScore = -10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        var bestScore = 10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}



// function submitBoardSize() {
// 	const boardSizeInput = document.getElementById("boardSize");
// 	const boardSize = parseInt(boardSizeInput.value);
// 	return boardSize
// }


