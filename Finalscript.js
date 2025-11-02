window.onload = function() {
    const cellContainer = document.getElementById("cellContainer");
    const discLayer = document.getElementById("discLayer");
    const canMoveLayer = document.getElementById("canMoveLayer");
    const scoreLabel = document.getElementById("score");
    scoreLabel.style.backgroundColor = "black";
    scoreLabel.style.color = "white";
    scoreLabel.style.fontSize = "32px";
    scoreLabel.style.fontWeight = "bold";
    scoreLabel.style.padding = "12px 32px";
    scoreLabel.style.borderRadius = "12px";
    scoreLabel.style.textAlign = "center";
    scoreLabel.style.zIndex = "1000";

    const cellSize = 80;
    const gap = 2;
    let turn = 1;
    let gameOver = false;

    const boardSize = `${8 * cellSize + 7 * gap}px`;
    cellContainer.style.width = boardSize;
    cellContainer.style.height = boardSize;
    discLayer.style.width = boardSize;
    discLayer.style.height = boardSize;
    canMoveLayer.style.width = boardSize;
    canMoveLayer.style.height = boardSize;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement("div");
            cell.style.width = `${cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.backgroundColor = "green";
            cell.style.border = "1px solid black";
            cell.style.position = "absolute";
            cell.style.left = `${c * (cellSize + gap)}px`;
            cell.style.top = `${r * (cellSize + gap)}px`;
            cell.addEventListener("click", () => clickedSquare(r, c));
            cellContainer.appendChild(cell);
        }
    }

    let discs = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,2,1,0,0,0],
        [0,0,0,1,2,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ];

    function drawDiscs() {
        discLayer.innerHTML = "";
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const v = discs[r][c];
                if (v === 0) continue;
                const disc = document.createElement("div");
                const ds = cellSize - 10;
                disc.style.width = `${ds}px`;
                disc.style.height = `${ds}px`;
                disc.style.borderRadius = "50%";
                disc.style.position = "absolute";
                const centerX = c * (cellSize + gap) + cellSize / 2;
                const centerY = r * (cellSize + gap) + cellSize / 2;
                disc.style.left = `${centerX}px`;
                disc.style.top = `${centerY}px`;
                disc.style.transform = "translate(-50%, -50%)";
                if (v === 1) {
                    disc.style.backgroundColor = "black";
                    disc.style.backgroundImage = "radial-gradient(#333333 30%, black 70%)";
                } else {
                    disc.style.backgroundColor = "white";
                    disc.style.backgroundImage = "radial-gradient(white 30%, #cccccc 70%)";
                }
                disc.style.zIndex = 25;
                discLayer.appendChild(disc);
            }
        }
    }

    function drawCanMoveLayer() {
        canMoveLayer.innerHTML = "";
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (discs[r][c] === 0 && canClickSpot(turn, r, c)) {
                    const o = document.createElement("div");
                    const size = cellSize - 10;
                    o.style.width = `${size}px`;
                    o.style.height = `${size}px`;
                    o.style.borderRadius = "50%";
                    o.style.position = "absolute";
                    const centerX = c * (cellSize + gap) + cellSize / 2;
                    const centerY = r * (cellSize + gap) + cellSize / 2;
                    o.style.left = `${centerX}px`;
                    o.style.top = `${centerY}px`;
                    o.style.transform = "translate(-50%, -50%)";
                    o.style.border = turn === 1 ? "2px solid black" : "2px solid white";
                    o.style.boxSizing = "border-box";
                    o.style.zIndex = 2;
                    canMoveLayer.appendChild(o);
                }
            }
        }
    }

    function redrawScore() {
        let b = 0, w = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (discs[r][c] === 1) b++;
                else if (discs[r][c] === 2) w++;
            }
        }
        scoreLabel.innerHTML = `Black: ${b} White: ${w}`;
    }

    function canMove(id) {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (canClickSpot(id, r, c)) return true;
            }
        }
        return false;
    }

    function canClickSpot(id, row, col) {
        if (discs[row][col] !== 0) return false;
        return getAffectedDiscs(id, row, col).length > 0;
    }

    function clickedSquare(row, col) {
        if (gameOver) return;
        if (discs[row][col] !== 0) return;
        if (!canClickSpot(turn, row, col)) return;
        const affected = getAffectedDiscs(turn, row, col);
        if (affected.length === 0) return;
        flipDiscs(affected);
        discs[row][col] = turn;
        drawDiscs();
        redrawScore();

        let isFull = discs.flat().every(v => v !== 0);
        if (isFull) {
            gameOver = true;
            showWinnerOverlay();
            return;
        }

        const nextTurn = (turn === 1) ? 2 : 1;
        if (canMove(nextTurn)) {
            turn = nextTurn;
        } else if (canMove(turn)) {
            showTemporaryMessage(`${nextTurn === 1 ? "Black" : "White"} has no valid moves. Turn passes.`, 1200);
        } else {
            gameOver = true;
            showWinnerOverlay();
            return;
        }
        drawCanMoveLayer();
    }

    function flipDiscs(list) {
        for (const d of list) {
            const r = d.row, c = d.column;
            discs[r][c] = discs[r][c] === 1 ? 2 : 1;
        }
    }

    function showWinnerOverlay() {
        let b = 0, w = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (discs[r][c] === 1) b++;
                else if (discs[r][c] === 2) w++;
            }
        }

        const text = b > w ? `Black wins! (${b} vs ${w})`
            : w > b ? `White wins! (${w} vs ${b})`
            : `Draw! (${b} vs ${w})`;

        const resultScreen = document.getElementById("resultScreen");
        const resultMessage = document.getElementById("resultMessage");
        const gameScreen = document.getElementById("gameScreen");

        resultMessage.textContent = text;
        resultMessage.style.color = "white";
        resultMessage.style.fontWeight = "bold";
        resultMessage.style.textShadow = "0 0 8px black";

        gameScreen.classList.add("hidden");
        resultScreen.classList.remove("hidden");
        resultScreen.classList.add("visible");
        resultScreen.style.zIndex = "9999";

        document.querySelectorAll("#restartButton, #homeButton").forEach(btn => {
            btn.style.background = "linear-gradient(180deg, #ffffff, #333333)";
            btn.style.color = "black";
            btn.style.border = "none";
            btn.style.borderRadius = "10px";
            btn.style.fontWeight = "bold";
        });
    }

    function showTemporaryMessage(text, duration = 1200) {
        const msg = document.createElement("div");
        Object.assign(msg.style, {
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "12px",
            fontSize: "20px",
            zIndex: "10000",
            pointerEvents: "none"
        });
        msg.textContent = text;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), duration);
    }

    function getAffectedDiscs(id, row, column) {
        const affected = [];
        if (discs[row][column] !== 0) return affected;
        const dirs = [[0,1],[0,-1],[-1,0],[1,0],[1,1],[1,-1],[-1,-1],[-1,1]];
        for (const [dr, dc] of dirs) {
            let r = row + dr, c = column + dc;
            const temp = [];
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const v = discs[r][c];
                if (v === 0) break;
                if (v === id) {
                    if (temp.length > 0) affected.push(...temp);
                    break;
                }
                temp.push({row: r, column: c});
                r += dr; c += dc;
            }
        }
        return affected;
    }

    const homeScreen = document.getElementById("homeScreen");
    const aboutScreen = document.getElementById("aboutScreen");
    const gameScreen = document.getElementById("gameScreen");
    const playButton = document.getElementById("playButton");
    const aboutButton = document.getElementById("aboutButton");
    const backFromAbout = document.getElementById("backToHomeFromAbout");

    function showScreen(screen) {
        const screens = [homeScreen, aboutScreen, gameScreen];
        screens.forEach(s => {
            if (s === screen) {
                s.classList.add("visible");
                s.classList.remove("hidden");
            } else {
                s.classList.add("hidden");
                s.classList.remove("visible");
            }
        });
    }

    showScreen(homeScreen);

    playButton.addEventListener("click", () => {
        showScreen(gameScreen);
        startGame();
    });

    aboutButton.addEventListener("click", () => {
        showScreen(aboutScreen);
    });

    backFromAbout.addEventListener("click", () => {
        showScreen(homeScreen);
    });

    function startGame() {
        turn = 1;
        gameOver = false;
        discs = [
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,2,1,0,0,0],
            [0,0,0,1,2,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0]
        ];

        drawDiscs();
        redrawScore();
        drawCanMoveLayer();
    }

    document.getElementById("restartButton").addEventListener("click", () => {
        const resultScreen = document.getElementById("resultScreen");
        resultScreen.classList.add("hidden");
        resultScreen.style.display = "none";    
        resultScreen.style.zIndex = "-1";      
        showScreen(gameScreen);
        startGame();
    });
    
    document.getElementById("homeButton").addEventListener("click", () => {
        const resultScreen = document.getElementById("resultScreen");
        resultScreen.classList.add("hidden");
        resultScreen.style.display = "none";     
        resultScreen.style.zIndex = "-1";     
        showScreen(homeScreen);
    });
    

    document.getElementById("aboutContent").innerHTML = `
    <p>Welcome! This is my Othello (or Reversi) game a simple two-player strategy game where you flip discs and try to take over the board. It’s played on an 8×8 grid, and the goal is simple. Finish with more of your color on the board!</p>
  
    <p>I made this project while learning to code because I wanted to build something I could actually *see* and *play* in a browser. Using HTML, CSS, and JavaScript, I recreated the classic Othello. No downloads, just click and play!</p>
  
    <p>While making it, I learned how to handle turns, detect valid moves, and make the board update in real time. I also tried to keep the layout clean and easy to use. There were lots of bugs and confusing moments, and fixing them was really challenging since I was still new to coding. But completing each step felt amazing.</p>
  
    <p>This version isn’t perfect, but I’m proud of how far it’s come. More than anything, this project taught me how much logic and creativity go into even a small game like this. I hope you enjoy playing it!</p>
  `;
  
  

    window.clickedSquare = clickedSquare;
};
