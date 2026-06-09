"use strict";
const WIDTH = 10;
const HEIGHT = 10;
const MINES = 10;
let board = [];
let gameOver = false;
let cellsRevealed = 0; // Nowość: śledzenie postępu do wygranej
// Tworzenie pustej planszy
function createBoard() {
    board = [];
    for (let y = 0; y < HEIGHT; y++) {
        const row = [];
        for (let x = 0; x < WIDTH; x++) {
            row.push({
                x,
                y,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                adjacentMines: 0
            });
        }
        board.push(row);
    }
}
// Losowe rozmieszczenie min
function placeMines() {
    let placed = 0;
    while (placed < MINES) {
        const x = Math.floor(Math.random() * WIDTH);
        const y = Math.floor(Math.random() * HEIGHT);
        if (!board[y][x].isMine) {
            board[y][x].isMine = true;
            placed++;
        }
    }
}
// Liczenie min wokół komórki
function countAdjacent() {
    const dirs = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1]
    ];
    for (const row of board) {
        for (const cell of row) {
            if (cell.isMine)
                continue;
            let count = 0;
            for (const [dx, dy] of dirs) {
                const nx = cell.x + dx;
                const ny = cell.y + dy;
                if (board[ny]?.[nx]?.isMine)
                    count++;
            }
            cell.adjacentMines = count;
        }
    }
}
// Sprawdzanie warunku wygranej
function checkWin() {
    const totalSafeCells = (WIDTH * HEIGHT) - MINES;
    if (cellsRevealed === totalSafeCells) {
        gameOver = true;
        setTimeout(() => alert("Gratulacje! Wygrałeś! 🏆"), 100);
        showResetButton();
    }
}
// Odkrywanie komórki
function reveal(x, y) {
    if (gameOver)
        return;
    const cell = board[y][x];
    // Nie odkrywamy komórek z flagą ani już odkrytych
    if (cell.isRevealed || cell.isFlagged)
        return;
    cell.isRevealed = true;
    cellsRevealed++;
    // Trafienie miny → przegrana
    if (cell.isMine) {
        gameOver = true;
        revealAllMines();
        render();
        setTimeout(() => alert("Bum! Przegrałeś 💥"), 100);
        showResetButton();
        return;
    }
    // Flood fill dla pustych pól
    if (cell.adjacentMines === 0) {
        const dirs = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];
        for (const [dx, dy] of dirs) {
            const nx = x + dx;
            const ny = y + dy;
            if (board[ny]?.[nx])
                reveal(nx, ny);
        }
    }
    checkWin();
}
// Stawianie flagi
function toggleFlag(x, y, e) {
    e.preventDefault(); // Blokuje domyślne menu kontekstowe przeglądarki
    if (gameOver)
        return;
    const cell = board[y][x];
    if (cell.isRevealed)
        return;
    cell.isFlagged = !cell.isFlagged;
    render();
}
// Odkrycie wszystkich min po przegranej
function revealAllMines() {
    for (const row of board) {
        for (const cell of row) {
            if (cell.isMine) {
                cell.isRevealed = true;
            }
        }
    }
}
// Pokazanie przycisku restartu
function showResetButton() {
    const btn = document.getElementById("resetBtn");
    btn.style.display = "block";
}
// Renderowanie planszy
function render() {
    const container = document.getElementById("board");
    container.style.gridTemplateColumns = `repeat(${WIDTH}, 40px)`;
    container.innerHTML = "";
    for (const row of board) {
        for (const cell of row) {
            const div = document.createElement("div");
            div.className = "cell";
            if (cell.isRevealed) {
                div.classList.add("revealed");
                if (cell.isMine) {
                    div.classList.add("mine");
                    div.textContent = "💣";
                }
                else if (cell.adjacentMines > 0) {
                    div.textContent = String(cell.adjacentMines);
                    div.setAttribute("data-num", String(cell.adjacentMines)); // Do kolorowania w CSS
                }
            }
            else if (cell.isFlagged) {
                div.classList.add("flag");
                div.textContent = "🚩";
            }
            // Nasłuchiwacze zdarzeń
            div.onclick = () => {
                reveal(cell.x, cell.y);
                render();
            };
            div.oncontextmenu = (e) => toggleFlag(cell.x, cell.y, e);
            container.appendChild(div);
        }
    }
}
// Start nowej gry
function startGame() {
    gameOver = false;
    cellsRevealed = 0;
    createBoard();
    placeMines();
    countAdjacent();
    render();
}
// Obsługa restartu
document.getElementById("resetBtn").onclick = () => {
    startGame();
    document.getElementById("resetBtn").style.display = "none";
};
// Uruchomienie gry
startGame();
