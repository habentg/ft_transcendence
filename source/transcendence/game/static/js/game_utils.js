
class Game {
    constructor() {
      // game flags
      this.gameId = 0;
      this.aiFlag = false;
      this.versusFlag = false;
      this.tournamentFlag = false;
	  this.tournament_id = 0;
  
      this.drawFlag = false // flag for stopping drawing
  
      //board values
      this.board = null;
      this.context = null;
      this.boardWidth = 800;
      this.boardHeight = 500;
      this.playerWidth = 15;
      this.playerHeight = 80;
  
      //players
      this.players = [];
      this.defp1Name = ""; //use for storing player names
      this.defp2Name = "";
  
  
      this.lastTime = 0; // for fps
      this.activeKeys = []; // for key inputs
  
      //setting variables
      this.defballSpeed = 6;
      this.paddleSpeed = 8;
      this.maxScore = 3;
      this.slowServe = false;
  
      // Parry variables
      this.cooldownTime = 0;
      this.parryFlag = false;
  
      this.ball = {
        x: this.boardWidth / 2,
        y: this.boardHeight / 2,
        velocityX: this.defballSpeed,
        velocityY: this.defballSpeed,
        ballRadius: 7
      };
    }
  
    getboardWidth() {
      return this.boardWidth;
    }
  
    getboardHeight() {
      return this.boardHeight;
    }
  
    getplayerHeight() {
      return this.playerHeight;
    }
  
    getplayerWidth() {
      return this.playerWidth;
    }
  
    setupeventListeners() {
      document.addEventListener("keydown", this.move);
      document.addEventListener("keyup", this.stopMovement);
    }
  
    resetBall(direction) {
      this.ball.x = this.boardWidth / 2;
      this.ball.y = this.boardHeight / 2;
      // console.log("Ball values after reset = ", this.ball);
      if (this.slowServe) {
        // Apply reduced speed if slow serve is enabled
        this.ball.velocityX = direction * Math.abs(this.defballSpeed) * 0.5;
        this.ball.velocityY = 2 * (Math.random() > 0.5 ? 1 : -1) * 0.5;
      } else {
        // Use normal initial speed
        this.ball.velocityX = direction * Math.abs(this.defballSpeed);
        this.ball.velocityY = 2 * (Math.random() > 0.5 ? 1 : -1);
      }
    }
  
    initializeBoard(boardElementId) {
      this.board = document.getElementById(boardElementId);
      this.board.width = this.getboardWidth();
      this.board.height = this.getboardHeight();
      this.context = this.board.getContext("2d");
    }
  
    createPlayer(name, position) {
      const player = new Player(name, position, this);
      this.players.push(player);
      console.log("Player created: ", player);
    }
  
    updateParryFlag() {
      this.parryFlag = document.getElementById("slowServe").checked;
      return this.parryFlag;
    }
  
    move = (event) => {
      this.activeKeys[event.code] = true;
      console.log(`Key Down: ${event.code}`); // Debugging
    }
  
    stopMovement = (event) => {
      this.activeKeys[event.code] = false;
      console.log(`Key Up: ${event.code}`);
    }
  }
  
  
  class Player {
    constructor(name, position, game) {
      this.playerName = name;
      this.width = game.getplayerWidth();
      this.height = game.getplayerHeight();
      this.cooldownFlag = false;
      this.parryCooldown = 0;
      this.velocityY = 0;
      this.score = 0;
      this.finalScore = 0; // final score after match
      this.gameWon = 0;
      this.position = "";
      if (position === "left") {
        this.x = 10;
        this.y = 500 / 2 - this.width / 2;
        this.parryKey = "KeyA";
        this.moveUp = "KeyW";
        this.moveDown = "KeyS";
      } else if (position === "right") {
        this.x = 800 - this.width - 10;
        this.y = 500 / 2 - this.height / 2;
        this.parryKey = "Numpad0";
        this.moveUp = "ArrowUp";
        this.moveDown = "ArrowDown";
      }
    }
  }

  /* tournament view */

async function getFullTournamentView(tournament_id) {
  try {
    const response = await fetch(`/retrieve_tournament?tournament_id=${tournament_id}`, {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/json",
      },
    });
    console.log("response: ", response);
    if (response.ok) {
      const responseData = await response.json();
      loadCssandJS(responseData, false);
      if (responseData.tournament_type === 4) {
        console.log(responseData.tournament_games);
        const tournamentMap = createTournamentMapForFour(tournament_id, responseData.tournament_games);
        document.getElementById("content").innerHTML = "";
        document.getElementById("content").appendChild(tournamentMap);
      }
      else if (responseData.tournament_type === 8) {
        console.log(responseData.tournament_games);
        const tournamentMap = createTournamentMapForEight(tournament_id, responseData.tournament_games);
        document.getElementById("content").innerHTML = "";
        document.getElementById("content").appendChild(tournamentMap);
      }
      return;
    }
    throw new Error("Failed to load retrieveAllGamesOfaTournament");
  } catch (error) {
    console.error("ERROR: ", error);
  }
}

/* tournament history modal viewer modal */
function createTournamentMapForFour(tournament_id, games) {
  const tournamentWrapper = document.createElement("div");
  tournamentWrapper.className = "tournamentWrapper";
  tournamentWrapper.id = "tournamentWrapper";

  tournamentWrapper.innerHTML = `
  <h1 class="text-center mb-5">Tournament ${tournament_id} Map</h1>
  <div class="row d-flex position-relative">
    <!-- First Round -->
    <div class="col-4 d-flex justify-content-center align-items-end">
      <div class="round first-round mb-5">
        <!-- <h6 class="text-center">First Round</h6> -->
        <div class="vertical-line">
          <!-- Game 1 -->
          <div class="game game1 mb-5">
            <div class="card">
              <div class="card-body-custom">
                <h5 id="game1" class="card-title game-1">Game 1</h5>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="team">
                    <i class="profileIcon fas fa-user-circle"></i>
                    <span class="">${games[0].player_one}</span>
                  </div>
                  <div class="score">
                    <span class="score-value">${games[0].final_score}</span>
                  </div>
                  <div class="team">
                    <span>${games[0].player_two}</span>
                    <i class="profileIcon fas fa-user-circle"></i>
                  </div>
                </div>
              </div>
              <div class="connection-line connection-1-5"></div>
            </div>
          </div>
          <!-- Game 2 -->
          <div class="game game2 mb-5">
            <div class="card">
              <div class="card-body-custom">
                <h5 id="game2" class="card-title game-2">Game 2</h5>
                <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[1].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[1].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[1].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
              </div>
            </div>
            <div class="connection-line connection-2-5"></div>
          </div>
        </div>
      </div>
    </div>
  
    <!-- Final Round -->
    <div class="col-4 d-flex justify-content-center">
      <div class="round final-round">
        <!-- <h6 class="text-center">Final Round</h6> -->
        <!-- <div class="vertical-line"> -->
        <!-- Game 5 -->
        <div class="game game5">
          <div class="card">
            <div class="card-body-custom">
              <h5 id="game5" class="card-title game-5">Game 5</h5>
              <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[2].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[2].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[2].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- </div> -->
      </div>
    </div>
  </div>
		`;

  return tournamentWrapper;
}
/* tournament history modal viewer modal */
function createTournamentMapForEight(tournament_id, games) {
  const tournamentWrapper = document.createElement("div");
  tournamentWrapper.className = "tournamentWrapper";
  tournamentWrapper.id = "tournamentWrapper";

  tournamentWrapper.innerHTML = `
  <h1 class="text-center mb-5">Tournament ${tournament_id} Map</h1>
<div class="row d-flex position-relative">
  <!-- First Round -->
  <div class="col-4 d-flex justify-content-center align-items-end">
    <div class="round first-round mb-5">
      <!-- <h6 class="text-center">First Round</h6> -->
      <div class="vertical-line">
        <!-- Game 1 -->
        <div class="game game1 mb-5">
          <div class="card">
            <div class="card-body-custom">
              <h5 id="game1" class="card-title game-1">Game 1</h5>
              <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[0].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[0].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[0].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
            </div>
            <div class="connection-line connection-1-5"></div>
          </div>
        </div>
        <!-- Game 2 -->
        <div class="game game2 mb-5">
          <div class="card">
            <div class="card-body-custom">
              <h5 id="game2" class="card-title game-2">Game 2</h5>
              <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[1].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[1].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[1].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="connection-line connection-2-5"></div>
        </div>
        <!-- Game 3 -->
        <div class="game game3 mb-5">
          <div class="card">
            <div class="card-body-custom">
              <h5 id="game3" class="card-title game-3">Game 3</h5>
              <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[2].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[2].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[2].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="connection-line connection-3-6"></div>
        </div>
        <!-- Game 4 -->
        <div class="game game4 mb-5">
          <div class="card">
            <div class="card-body-custom">
              <h5 id="game4" class="card-title game-4">Game 4</h5>
              <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[3].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[3].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[3].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="connection-line connection-4-6"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Second Round -->
  <div class="col-4 d-flex justify-content-center">
    <div class="round second-round mb-5">
      <!-- <h6 class="text-center">Second Round</h6> -->
      <div class="vertical-line">
        <!-- Game 5 -->
        <div class="game game5">
          <div class="card">
            <div class="card-body-custom">
              <h5 id="game5" class="card-title game-5">Game 5</h5>
              <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[4].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[4].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[4].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="connection-line connection-5-7"></div>
        </div>
        <!-- Game 6 -->
        <div class="game game6 mb-5">
          <div class="card">
            <div class="card-body-custom">
              <h5 id="game6" class="card-title game-6">Game 6</h5>
              <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[5].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[5].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[5].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="connection-line connection-6-7"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Final Round -->
  <div class="col-4 d-flex justify-content-center">
    <div class="round final-round">
      <!-- <h6 class="text-center">Final Round</h6> -->
      <!-- <div class="vertical-line"> -->
      <!-- Game 7 -->
      <div class="game game7 mb-5">
        <div class="card">
          <div class="card-body-custom">
            <h5 id="game7" class="card-title game-7">Final</h5>
            <div class="d-flex justify-content-between align-items-center">
                <div class="team">
                  <i class="profileIcon fas fa-user-circle"></i>
                  <span class="">${games[6].player_one}</span>
                </div>
                <div class="score">
                  <span class="score-value">${games[6].final_score}</span>
                </div>
                <div class="team">
                  <span>${games[6].player_two}</span>
                  <i class="profileIcon fas fa-user-circle"></i>
                </div>
              </div>
          </div>
        </div>
        <div class="connection-line connection-7-8"></div>
      </div>
      <!-- </div> -->
    </div>
  </div>
</div>

		`;

  return tournamentWrapper;
}