class Game {
  constructor() {
    // game flags
    this.gameId = 0;
    this.aiFlag = false;
    this.versusFlag = false;
    this.tournamentFlag = false;
	  this.tournament_id = 0;

    this.drawFlag = false; // flag for stopping drawing

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
    this.defballSpeed = 8;
    this.paddleSpeed = 8;
    this.maxScore = 3;
    this.slowServe = false;

    // Parry variables
    this.cooldownTime = 5000;
    this.parryFlag = false;

    this.ball = {
      x: this.boardWidth / 2,
      y: this.boardHeight / 2,
      velocityX: this.defballSpeed,
      velocityY: this.defballSpeed,
      ballRadius: 7,
    };
    this.sound = new Sound();
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
    document.addEventListener("keydown", (event) => {
      if (this.aiFlag && isaiKey(event) && !event.isAI) {
        // Block physical keyboard inputs for AI keys
        event.preventDefault();
        return;
      }
      this.move(event); // Process both physical player inputs and AI events
    });
  
    document.addEventListener("keyup", (event) => {
      if (this.aiFlag && isaiKey(event) && !event.isAI) {
        // Block physical keyboard inputs for AI keys
        event.preventDefault();
        return;
      }
      this.stopMovement(event); // Process both physical player inputs and AI events
    });
  }
  
  stopeventListeners() {
    while (this.activeKeys.length > 0) this.activeKeys.pop();
    document.removeEventListener("keydown", this.move);
    document.removeEventListener("keyup", this.stopMovement);
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

  randomizeServe() {
    this.ball.velocityX = (Math.random() % 2 == 1 ? this.defballSpeed : -this.defballSpeed)
    this.ball.velocityY = 2 * (Math.random() > 0.5 ? 1 : -1);
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
    // console.log(`Key Down: ${event.code}`); // Debugging
  }

  stopMovement = (event) => {
    this.activeKeys[event.code] = false;
    // console.log(`Key Up: ${event.code}`);
  }

  saveSettings(user) {
    const key = `gameSetting_${user}`;
    const settings = {
      defballSpeed: this.defballSpeed,
      paddleSpeed: this.paddleSpeed,
      maxScore: this.maxScore,
      slowServe: this.slowServe,
    };
    localStorage.setItem(key, JSON.stringify(settings));
    console.log("Settings saved to localStorage:", settings);
  }

  loadSettings(user) {
    //load settings should check for invalid values or invalid ranges
    const key = `gameSetting_${user}`;
    const savedSettings = JSON.parse(localStorage.getItem(key));
    if (savedSettings) {
      this.defballSpeed = savedSettings.defballSpeed || this.defballSpeed;
      this.paddleSpeed = savedSettings.paddleSpeed || this.paddleSpeed;
      this.maxScore = savedSettings.maxScore || this.maxScore;
      this.slowServe = savedSettings.slowServe || this.slowServe;
      console.log("Loaded settings from localStorage:", savedSettings);
    } else {
      console.log("No saved settings found in localStorage.");
    }
  }
}
/* tournament view */

async function getFullTournamentView(tournament_id) {
  try {
    const response = await fetch(
      `/retrieve_tournament?tournament_id=${tournament_id}`,
      {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
        },
      }
    );
    if (response.ok) {
      const responseData = await response.json();
      loadCssandJS(responseData, false);
      console.log(
        "responseData.tournament_type: ",
        responseData.tournament_type
      );
      const tournamentViewerModal = createTournamentViewerModal(
        tournament_id,
        responseData.html
      );
      // append the modal to the body
      document.body.appendChild(tournamentViewerModal);

      // show the modal
      const tournamentModal = new bootstrap.Modal(
        document.getElementById(`tournamentModal${tournament_id}`)
      );
      tournamentModal.show();


      // remove the modal when clicked outside
      tournamentViewerModal.addEventListener("click", (e) => {
        if (e.target === tournamentViewerModal) {
            console.log("Removing modal tournamentModal");
            closeModal(`tournamentModal${tournament_id}`);
            document.getElementById(`/static/css/tournament.css-id`).remove();
        } 
      });
      return;
    }
    throw new Error("Failed to load retrieveAllGamesOfaTournament");
  } catch (error) {
    console.error("ERROR: ", error);
  }
}

/* tournament history modal viewer modal */
function createTournamentViewerModal(tournament_id, populatedHtml) {
  if (document.getElementById(`tournamentModal${tournament_id}`)) {
    return;
  }
  const modal = document.createElement("div");
  modal.className =
    "modal d-flex justify-content-center align-items-center tournamentModal";
  modal.id = `tournamentModal${tournament_id}`;
  modal.tabIndex = -1;
  modal.setAttribute("aria-labelledby", `tournamentModalLabel${tournament_id}`);
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = populatedHtml;

  return modal;
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
    if (position === "left") {
      this.pos = "left";
      this.x = 10;
      this.y = 500 / 2 - this.width / 2;
      this.parryKey = "Space";
      this.moveUp = "KeyW";
      this.moveDown = "KeyS";
    } else if (position === "right") {
      this.pos = "right"
      this.x = 800 - this.width - 10;
      this.y = 500 / 2 - this.height / 2;
      this.parryKey = "Numpad0";
      this.moveUp = "ArrowUp";
      this.moveDown = "ArrowDown";
    }
  }
}

class Sound {
  constructor() {
    this.sounds = [];
    this.soundPaths = [
      { name: "score", path: "/static/sounds/score.wav" },
      { name: "wallhit", path: "/static/sounds/wall_hit.wav" },
      { name: "parry", path: "/static/sounds/parry.wav" },
      { name: "paddlehit", path: "/static/sounds/paddle_hit.wav" },
    ];
    this.soundPaths.forEach(({ name, path }) => this.load(name, path));
  }

  load(name, path) {
    const audio = new Audio(path);

    // Event listener for successful loading
    audio.oncanplaythrough = () => {
      this.sounds[name] = audio;
      console.log(`Sound "${name}" loaded successfully.`);
    };

    // Event listener for loading errors
    audio.onerror = () => {
      console.error(`Failed to load sound "${name}" from "${path}".`);
    };

    // Start loading the audio
    audio.load(); // Explicitly start loading
  }

  play(name) {
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0; // Reset for replay
      sound.play();
    } else {
      console.warn(`Sound "${name}" not found.`);
    }
  }
}
