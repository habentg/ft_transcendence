let paddleSpeed = 6;
let ballSpeed = 6;
let maxScore = 3;
let slowServe = false;
let	aiFlag = false;

// Board setup
let board;
let boardWidth = 800;
let boardHeight = 500;
let context;

// Player setup
let playerWidth = 15;
let playerHeight = 80;
let playerVelocityY = 0;

let player1 = {
    x: 10,
    y: (boardHeight / 2) - (playerHeight / 2),
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY,
};

let player2 = {
    x: boardWidth - 10 - playerWidth,
    y: (boardHeight / 2) - (playerHeight / 2),
    width: playerWidth,
    height: playerHeight,
    velocityY: playerVelocityY
};

// Ball setup
let ballRadius = 7.5;
let defballSpeed = 4.5;
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    velocityX: defballSpeed,
    velocityY: defballSpeed 
};  

let player1Score = 0;
let player2Score = 0;
let player1LastKey = null;
let player2LastKey = null;
let drawFlag = false;

function initializeGame() {
    board = document.getElementById("canvasBoard");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    document.addEventListener("keydown", move);
    document.addEventListener("keyup", stopMovement);
}

function startGame() {
    player1Score = 0;
    player2Score = 0;
    player1LastKey = null;
    player2LastKey = null;
    drawFlag = true;
    requestAnimationFrame(draw);
    // document.getElementById("startButton").disabled = true; //disable start button when the game starts
}

function draw() {
    if (!drawFlag){
        return ;
    }
    requestAnimationFrame(draw);

    // Clear board
    context.clearRect(0, 0, board.width, board.height);

    // Draw dotted line in the middle
    context.setLineDash([10, 20]); // Pattern: 5px dash, 15px space
    context.strokeStyle = 'white'; // Line color
    context.lineWidth = 5; // Line thickness
    context.beginPath();
    context.moveTo(boardWidth / 2, 0); // Start at the top middle
    context.lineTo(boardWidth / 2, boardHeight); // Draw to the bottom middle
    context.stroke();
    context.setLineDash([]); // Reset line dash to solid

    // Update player positions
    if (!oob(player1.y + player1.velocityY)) player1.y += player1.velocityY;
    if (!oob(player2.y + player2.velocityY)) player2.y += player2.velocityY;

    drawCapsulePaddle(player1.x, player1.y, player1.width, player1.height, player1.width / 2, '#84ddfc', 'black');
    drawCapsulePaddle(player2.x, player2.y, player2.width, player2.height, player2.width / 2, '#84ddfc', 'black');

    // Update ball position
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Check ball collision with walls
    if (ball.y - ballRadius <= 0 || ball.y + ballRadius >= boardHeight) ball.velocityY *= -1;

    // Check ball collision with players
    if (ballCollision(ball, player1, player1LastKey)) player1LastKey = null;
    if (ballCollision(ball, player2, player2LastKey)) player2LastKey = null;

    // Draw ball as a circle
    context.beginPath();
    context.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    context.fillStyle = '#b02c98';
    context.fill();
    context.closePath();

    // Check for goals
    if (ball.x - ballRadius < 0) {
        player2Score++;
        resetGame(1);
    } else if (ball.x + ballRadius > boardWidth) {
        player1Score++;
        resetGame(-1);
    }

    // Display scores
    context.fillStyle = '#ffffff';
    context.font = "45px sans-serif";
    context.fillText(player1Score, boardWidth / 5, 45);
    context.fillText(player2Score, (boardWidth * 4) / 5, 45);
}

function move(e) {
    if (e.code === "KeyW") {
        player1.velocityY = -paddleSpeed;
        player1LastKey = "KeyW";
    }
    if (e.code === "KeyS") {
        player1.velocityY = paddleSpeed;
        player1LastKey = "KeyS";
    }
    if (e.code === "ArrowUp") {
        player2.velocityY = -paddleSpeed;
        player2LastKey = "ArrowUp";
    }
    if (e.code === "ArrowDown") {
        player2.velocityY = paddleSpeed;
        player2LastKey = "ArrowDown";
    }
}

function stopMovement(e) {
    if (e.code === "KeyW" || e.code === "KeyS"){
        player1.velocityY = 0;
        player1LastKey = e.code;
    }
    if (e.code === "ArrowUp" || e.code === "ArrowDown"){
        player2.velocityY = 0;
        player2LastKey = e.code;
    }
}


// function to check if the paddle is inside the walls, by walls the top and bottom part of the board.
function oob(yPosition) {
    return yPosition < 0 || yPosition + playerHeight > boardHeight;
}

function ballCollision(ball, player) {
    let isCollision =
        ball.x - ballRadius < player.x + player.width &&   // Right side of the ball is past the left side of the player
        ball.x + ballRadius > player.x &&                 // Left side of the ball is past the right side of the player
        ball.y + ballRadius > player.y &&                 // Bottom side of the ball is past the top of the player
        ball.y - ballRadius < player.y + player.height;   // Top side of the ball is past the bottom of the player

    if (isCollision) {
        // Reverse horizontal direction
        ball.velocityX *= -1;

        // Calculate the relative hit position
        let paddleCenter = player.y + player.height / 2;
        let hitPosition = (ball.y - paddleCenter) / (player.height / 2); // Normalize between -1 and 1

        // Adjust vertical velocity based on hit position
        ball.velocityY = hitPosition * 2.5; // Increase ball speed and angle

        // Optional: Slightly increase ball speed for more challenge
        ball.velocityX *= 1.1; // Increase horizontal speed

        // Resolve collision by repositioning the ball outside the paddle
        // Move the ball just outside the paddle to avoid it sticking or passing through
        if (ball.x < player.x) {
            ball.x = player.x - ballRadius; // Push ball to the left of the paddle
        } else {
            ball.x = player.x + player.width + ballRadius; // Push ball to the right of the paddle
        }
    }

    return isCollision;
}

function resetGame(direction) {
    ball.x = boardWidth / 2;
    ball.y = boardHeight / 2;

    // Reset velocities to default speed each game
    ball.velocityX = direction * Math.abs(defballSpeed);
    ball.velocityY = 2 * (Math.random() > 0.5 ? 1 : -1);

    if (slowServe) {
        // Apply reduced speed if slow serve is enabled
        ball.velocityX *= 0.5;
        ball.velocityY *= 0.5;
    }

    if (isGameOver()) {
        drawFlag = false;
    }
}

function isGameOver(){
    if (player1Score >= maxScore || player2Score >= maxScore){
        displayGameOver();
        return true;
    }
    return false;
}

// this display sucks need a better one 
function displayGameOver() {
    context.clearRect(0, 0, board.width, board.height);

    context.font = "50px sans-serif";
    context.fillStyle = "red";
    let winner = player1Score >= maxScore ? "Player 1" : "Player 2";
    context.fillText(`${winner} Wins!`, boardWidth / 4, boardHeight / 2);

    context.font = "30px sans-serif";
    context.fillStyle = "white";
}

function drawCapsulePaddle(x, y, width, height, radius, fillColor, borderColor) {
    context.beginPath();
    context.arc(x + width / 2, y + radius, radius, Math.PI, 0); // Top cap
    context.lineTo(x + width, y + height - radius); // Right edge
    context.arc(x + width / 2, y + height - radius, radius, 0, Math.PI); // Bottom cap
    context.lineTo(x, y + radius); // Left edge
    context.closePath();

    context.fillStyle = fillColor; // Fill color
    context.fill();
    if (borderColor) {
        context.strokeStyle = borderColor; // Border color
        context.stroke();
    }
}

//TOURNAMENT LOGIC

//ADD THE This is to add players
const players = ['Tofara Mususa'];

document.addEventListener('DOMContentLoaded', () => {
    // Players array with Tofara Mususa as first element
    // Get DOM elements
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('searchIcon');
    const createTournamentBtn = document.getElementById('createTournamentBtn');
    const startButton = document.getElementById('startButton');

    // Function to add a new player
    function addPlayer(playerName) {
        // Trim and validate player name
        const trimmedName = playerName.trim();
        if (!trimmedName) return;

        // Check if player already exists
        if (players.includes(trimmedName)) {
            alert('Player already added!');
            return;
        }

        // Add player to array
        players.push(trimmedName);

        // Create new player button
        const playerButton = document.createElement('button');
        playerButton.classList.add(
            'menu-item', 
            'd-flex', 
            'justify-content-center', 
            'align-items-center', 
            'p-3'
        );
        playerButton.innerHTML = `
            <i class="fas fa-user fa-1x me-2"></i>
            <h6 class="mb-0">${trimmedName}</h6>
        `;

        // Add click event to remove player
        playerButton.addEventListener('click', () => {
            // Prevent removing Tofara Mususa
            if (trimmedName === 'Tofara Mususa') {
                alert('Cannot remove Tofara Mususa');
                return;
            }

            // Remove from players array
            const index = players.indexOf(trimmedName);
            if (index > -1) {
                players.splice(index, 1);
            }
            
            // Remove button from DOM
            playerButton.remove();
        });

        // Add the new player button to the createTournamentBtn div
        createTournamentBtn.appendChild(playerButton);

        // Clear input
        searchInput.value = '';
    }

    // Event listener for search icon click
    searchIcon.addEventListener('click', () => {
        addPlayer(searchInput.value);
    });

    // Event listener for enter key in search input
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayer(searchInput.value);
        }
    });

    // Start tournament button (currently just logs players)
    startButton.addEventListener('click', () => {
        if (players.length < 2) {
            alert('Please add at least 2 players to start the tournament!');
            return;
        }
		const friendBoard = document.querySelector('.friendBoard');
		friendBoard.remove();       
		// console.log(`\n${scenario.name} Tournament:`);
		const tournament = createPingPongTournament(players);
		const champion = tournament.runTournament();
		console.log('Champion:', champion);
		console.log('Match History:', tournament.getMatchHistory());

        // Add your tournament start logic here
    });

    // Add initial Tofara Mususa button (if not already present)
    if (!document.querySelector('#createTournamentBtn .menu-item')) {
        const initialPlayerButton = document.createElement('button');
        initialPlayerButton.classList.add(
            'menu-item', 
            'd-flex', 
            'justify-content-center', 
            'align-items-center', 
            'p-3'
        );
        initialPlayerButton.innerHTML = `
            <i class="fas fa-trophy fa-1x me-2"></i>
            <h6 class="mb-0">Tofara Mususa</h6>
        `;

        // Add click event to remove player
        initialPlayerButton.addEventListener('click', () => {
            alert('Cannot remove Tofara Mususa');
        });

        createTournamentBtn.appendChild(initialPlayerButton);
    }
});

//LOGIC: This is to display initial the tournament logic
function createPingPongTournament(players) {
    const matchHistory = [];
    
	async function playMatch(player1, player2) {
		return new Promise((resolve) => {
			// Reset scores before match
			player1Score = 0;
			player2Score = 0;
	
			// Make game board visible
			const gameboard = document.getElementById('canvasBoard');
			gameboard.style.visibility = 'visible';
	
			// Start game with specific players
			startGame();
	
			// Create a function to check game state
			const checkGameStatus = () => {
				if (!drawFlag) {
					const match = { 
						player1: player1,
						player2: player2,
						player1Score: player1Score, 
						player2Score: player2Score, 
						winner: player1Score >= maxScore ? player1 : player2
					};
	
					gameboard.style.visibility = 'hidden';
					resolve(match.winner);
				} else {
					// Continue checking if game is not finished
					requestAnimationFrame(checkGameStatus);
				}
			};
	
			// Start checking game status
			checkGameStatus();
		});
	}

async function runTournament() {
		initializeGame()
        let currentPlayers = [...players];

        // Validate initial number of players
        if (![4, 8, 16].includes(currentPlayers.length)) {
            alert('Tournament supports only 4, 8, or 16 players');
        }

        // Round of 16 (if applicable)
        if (currentPlayers.length === 16) {
			//need to add a div here saying round of 16
            const roundOf16Winners = [];
            for (let i = 0; i < currentPlayers.length; i += 2) {
				const winner = await playMatch(currentPlayers[i], currentPlayers[i + 1]);
                roundOf16Winners.push(winner);
            }
            currentPlayers = roundOf16Winners;
        }

        // Quarter Finals (if applicable)
        if (currentPlayers.length === 8) {
			//need to add a div saying that we are the quarter finals
            const quarterFinalWinners = [];
            for (let i = 0; i < currentPlayers.length; i += 2) {
				const winner = await playMatch(currentPlayers[i], currentPlayers[i + 1])
                quarterFinalWinners.push(winner);
            }
            currentPlayers = quarterFinalWinners;
        }

        // Semi Finals
        const semiFinalWinners = [];
		//need to add a div saying this semifinals
        for (let i = 0; i < currentPlayers.length; i += 2) {
			const winner = await playMatch(currentPlayers[i], currentPlayers[i + 1])
			semiFinalWinners.push(winner);
        }

        // Final
		// add the finals div here saying there are the players playing
        const champion = await playMatch(semiFinalWinners[0], semiFinalWinners[1]);

        return champion;
    }

    function getMatchHistory() {
        return matchHistory;
    }

    return {
        runTournament,
        getMatchHistory
    };
}
