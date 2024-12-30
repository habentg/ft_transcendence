
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