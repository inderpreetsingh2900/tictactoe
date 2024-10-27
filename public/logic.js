var origBoard;
const huPlayer = 'O';
const aiPlayer = 'X';
let currentPlayer = huPlayer;
let aiMode = false;

function toggleAIMode() {
    aiMode = !aiMode;
    const modeButton = document.querySelector('button[onclick="toggleAIMode()"]');
    modeButton.innerText = aiMode ? "Switch to Player Mode" : "Switch to AI Mode";
    generateMatrix();
}


function generateWinCombos(n) {
    let winCombos = [];
    for (let i = 0; i < n; i++) {
        let row = [], col = [];
        for (let j = 0; j < n; j++) {
            row.push(i * n + j);
            col.push(j * n + i);
        }
        winCombos.push(row, col);
    }
    let diag1 = [], diag2 = [];
    for (let i = 0; i < n; i++) {
        diag1.push(i * n + i);
        diag2.push((i + 1) * (n - 1));
    }
    winCombos.push(diag1, diag2);
    return winCombos;
}


function generateMatrix() {
    const boardSizeInput = document.getElementById("boardSize");
    const matrixContainer = document.getElementById("matrix-container");
    const n = parseInt(boardSizeInput.value);
    window.winCombos = generateWinCombos(n);
    window.nu = n;

    if (isNaN(n) || n < 2) {
        alert("Please enter a valid board size");
        return;
    }

    matrixContainer.innerHTML = "";
    const table = document.createElement("table");
    for (let i = 0; i < n; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < n; j++) {
            const cell = document.createElement("td");
            cell.classList.add("cell");
            cell.id = i * n + j;
            cell.addEventListener('click', turnClick, false);
            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    matrixContainer.appendChild(table);
    startGame();
}


function startGame() {
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(nu * nu).keys());
    console.log(origBoard);
    currentPlayer = huPlayer;

    document.querySelectorAll('.cell').forEach(cell => {
        cell.innerText = '';
        cell.style.removeProperty('background-color');
        cell.addEventListener('click', turnClick, false);
    });
}


function turnClick(square) {
    if (typeof origBoard[square.target.id] === 'number') {
        turn(square.target.id, currentPlayer);
        if (!checkWin(origBoard, currentPlayer) && !checkTie() && aiMode && currentPlayer === huPlayer) {
            fetchBestMove();
        } else {
            currentPlayer = currentPlayer === huPlayer ? aiPlayer : huPlayer;
        }
    }
}


function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(origBoard, player);
    if (gameWon) gameOver(gameWon);
}


function fetchBestMove() {
    fetch('/calculateMove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boardsize: nu, board: origBoard, combos: winCombos }) /////
    })
        .then(response => response.json())
        .then(data => {
            if (data.bestMove !== undefined) {
                turn(data.bestMove, aiPlayer);
            }
            if (data.nodes !== undefined && data.depth !== undefined) {
                const nodesElement = document.getElementById("nodes");
                nodesElement.innerText = `Nodes Searched upto Depth ${data.depth} : ${data.nodes}`;  // Display nodes value
            }
        });
}


function checkWin(board, player) {
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.includes(elem))) {
            return { index: index, player: player };
        }
    }
    return null;
}


function gameOver(gameWon) {
    winCombos[gameWon.index].forEach(index => {
        document.getElementById(index).style.backgroundColor =
            gameWon.player === huPlayer ? "blue" : "red";
    });

    if (aiMode != false) {
        declareWinner(gameWon.player == huPlayer ? "You win!" : "You lose.");

    }
    else {
        declareWinner(gameWon.player == huPlayer ? "Player 1 Won" : "Player 2 Won");
    }
    
}


function declareWinner(who) {
    document.querySelector(".endgame").style.display = "flex";
    document.querySelector(".endgame .text").innerText = who;
}


function checkTie() {
    if (origBoard.every(s => typeof s !== 'number')) {
        declareWinner("Tie Game!");
        return true;
    }
    return false;
}
