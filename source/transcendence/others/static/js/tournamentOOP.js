class GameBoard {
  constructor(width, height) {
    this.board = null;
    this.context = null;
    this.width = width;
    this.height = height;
    this.drawFlag = false;
  }

  initialize() {
    this.board = document.getElementById("board");
    // this.board.height = boardWidth;
    // this.board.width = boardHeight;
    if (this.board) {
		// @ts-ignore
      this.context = this.board.getContext("2d");
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
	// @ts-ignore
    document.addEventListener("keydown", move);
	// @ts-ignore
    document.addEventListener("keyup", stopMovement);
  }

  //this is the function that starts the game by calling draw function and displays names at the top of the canvas
  startGame(player1, player2) {
    this.drawFlag = true;

    const player1NameElement = document.getElementById("player1Name");
    if (player1NameElement) {
      player1NameElement.textContent = "@ " + player1.playerName;
      player1NameElement.style.display = "block";
    }

    const player2NameElement = document.getElementById("player2Name");
    if (player2NameElement) {
      player2NameElement.textContent = "@ " + player2.playerName;
      player2NameElement.style.display = "block";
    }

    const player1Element = document.getElementById("player1");
    if (player1Element) {
      player1Element.classList.remove("d-none");
    }

    const player2Element = document.getElementById("player2");
    if (player2Element) {
      player2Element.classList.remove("d-none");
    }
	// @ts-ignore
    requestAnimationFrame(() => draw(player1, player2));
  }
}

class PlayerManager {
  constructor() {
    this.playersNames = ["Tofara Mususa"];
    this.maxPlayerNumbers = 0;
  }

  // This is to check is number of players is 4 or 8 and if not give an error
  static validatePlayerNumber() {
    const playersNumberInput = document.getElementById("playersNumber");
    const errorMsgDiv = document.getElementById("local-game-error-msg");
    let maxPlayers = null;
    if (playersNumberInput) {
		// @ts-ignore
      maxPlayers = playersNumberInput.value;
    }

    if (maxPlayers === "") return false;
    if (maxPlayers != 4 && maxPlayers != 8 && errorMsgDiv) {
      errorMsgDiv.textContent = "Please enter either 4 or 8";
      errorMsgDiv.style.display = "block";
      return false;
    } else if (errorMsgDiv) {
      errorMsgDiv.style.display = "none";
      return true;
    }
  }
  //this returns the html for the playercontainer elements
  getPlayerUiElements() {
    return {
      playerInput: document.getElementById("playerInput"),
      playerIcon: document.getElementById("playerIcon"),
      playerContainer: document.getElementById("playerContainer"),
      initTournamentButton: document.getElementById("initTournamentButton"),
    };
  }

  //creates the player button div returns it. Takes the name and returns html code
  createPlayerButtonWithRemoveOption(playerName) {
    // Create the button element to represent the player
    const playerButton = document.createElement("button");
    playerButton.classList.add(
      "menu-item",
      "d-flex",
      "justify-content-between", // Space between name/icon and delete icon
      "align-items-center",
      "p-3"
    );

    // Create a container for the player's icon and name
    const nameContainer = document.createElement("div");
    nameContainer.classList.add("d-flex", "align-items-center", "mx-auto"); // Center-align the name and icon

    // Add the player's icon and name inside the container
    nameContainer.innerHTML = `
		  <i class="fas fa-user fa-1x me-2"></i>
		  <h6 class="mb-0">${playerName}</h6>
		`;

    // Create the remove (delete) icon
    const deleteIcon = this.createRemovePlayerIcon(playerName);

    // Append the name container and delete icon to the player button
    playerButton.appendChild(nameContainer);
    playerButton.appendChild(deleteIcon);

    return playerButton;
  }

  createRemovePlayerIcon(playerName) {
    // Create the icon element for removal
    const deleteIcon = document.createElement("i");
    deleteIcon.classList.add("fas", "fa-times", "ms-2"); // Add spacing and styles
    deleteIcon.style.color = "rgba(255, 255, 255, 0.8)"; // Off-white color
    deleteIcon.style.cursor = "pointer"; // Pointer cursor for better UX

    // Add an event listener to handle the removal of the player
    deleteIcon.addEventListener("click", () => {
      // Prevent removal of a specific player
      if (playerName === "Tofara Mususa") {
        alert("Cannot remove Tofara Mususa");
        return;
      }

      // Find and remove the player from the players list
      const index = this.playersNames.indexOf(playerName);
      if (index > -1) {
        this.playersNames.splice(index, 1); // Remove the player from the list
      }

      // Remove the button from the DOM
      if (deleteIcon.parentElement) {
        deleteIcon.parentElement.remove();
      }
    });

    return deleteIcon;
  }
  //checks the player name input is correct if so then add to the player list.
  handlePlayerInput(playerInput, playerContainer, maxPlayerNumbers) {
    const playerName = playerInput.value.trim();
    const errorMsgDiv = document.getElementById("player-name-error-msg");

    // Remove any existing error message when input changes
    if (errorMsgDiv) {
      errorMsgDiv.textContent = "";
      errorMsgDiv.style.display = "none";
    }
    // Validation checks
    if (!playerName) {
      return;
    }
    // Check if max players reached
    if (this.playersNames.length == maxPlayerNumbers && errorMsgDiv) {
      errorMsgDiv.textContent = "Max Players reached";
      errorMsgDiv.style.display = "block";
      return;
    }

    // Check if name contains only letters
    const letterRegex = /^[A-Za-z]+$/;
    if (!letterRegex.test(playerName) && errorMsgDiv) {
      errorMsgDiv.textContent = "Name must contain only letters";
      errorMsgDiv.style.display = "block";
      return;
    }

    // Check name length (commented out but included)
    //   if (playerName.length < 5 || playerName.length > 9) {
    //     errorMsgDiv.textContent = "Name must be between 5 and 9 characters";
    //     errorMsgDiv.style.display = "block";
    //     return;
    //   }

    // Check if player already exists
    if (this.playersNames.includes(playerName) && errorMsgDiv) {
      errorMsgDiv.textContent = "Player name is taken!";
      errorMsgDiv.style.display = "block";
      return;
    }

    // If all validations pass, add player and clear input
    this.addPlayerToList(playerName, playerContainer);
    playerInput.value = "";
  }

  // Shuffles an array of players using the Fisher-Yates algorithm, returning a new randomized array while preserving the original
  static randomisePlayers(array) {
    // Create a copy of the original array to avoid modifying the original
    const shuffledArray = [...array];

    // Start from the last element and swap with a random previous element
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      // Generate a random index between 0 and i (inclusive)
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements
      [shuffledArray[i], shuffledArray[j]] = [
        shuffledArray[j],
        shuffledArray[i],
      ];
    }

    return shuffledArray;
  }
  //creates the player container and elements and adds it to the list
  addPlayerToList(playerName, playerContainer) {
    if (this.playersNames.includes(playerName)) {
      return;
    }
    this.playersNames.push(playerName);
    const playerButton = this.createPlayerButtonWithRemoveOption(playerName);
    playerContainer.appendChild(playerButton);
  }

  //Creates the first default player that is added to the start of the list that should always be added
  createDefaultPlayer(playerContainer) {
    if (!document.querySelector("#playerContainer .menu-item")) {
      const defaultPlayerButton = document.createElement("button");
      defaultPlayerButton.classList.add(
        "menu-item",
        "d-flex",
        "justify-content-center",
        "align-items-center",
        "p-3"
      );
      defaultPlayerButton.innerHTML = `
			<i class="fas fa-trophy fa-1x me-2"></i>
			<h6 class="mb-0">Tofara Mususa</h6>
		`;
      playerContainer.appendChild(defaultPlayerButton);
    }
  }

    // Sets up the player addition UI, handles player input, and initializes tournament actions based on max player numbers.
	setUpPlayerAddition(maxPlayerNumbers, tournamentObject) {
		maxPlayerNumbers = maxPlayerNumbers === 0 ? 4 : maxPlayerNumbers;
	
		const uiElements = this.getPlayerUiElements();
		if(!uiElements)
			return;
		this.createDefaultPlayer(uiElements.playerContainer);

		// @ts-ignore
		uiElements.playerIcon.addEventListener("click", () => {
		  this.handlePlayerInput(
			uiElements.playerInput,
			uiElements.playerContainer,
			maxPlayerNumbers
		  );
		});
	
		// @ts-ignore
		uiElements.playerInput.addEventListener("keypress", (e) => {
		  if (e.key === "Enter") {
			this.handlePlayerInput(
			  uiElements.playerInput,
			  uiElements.playerContainer,
			  maxPlayerNumbers
			);
		  }
		});
		// @ts-ignore
		uiElements.initTournamentButton.addEventListener("click", async () => {
		  await tournamentObject.startTournament(maxPlayerNumbers, this.playersNames);
		});
	  }
}
class Tournament {
  constructor() {
    this.matchCount = 0;
    this.matchHistory = [];
    this.tournamentElement = null;
	this.matchCount = 0;
  }

  // Orchestrates a complete tournament for 4 or 8 players, managing quarter-finals, semi-finals, and finals matches sequentially, returning the tournament champion
  async runTournament(playersNames) {
    playersNames = PlayerManager.randomisePlayers(playersNames); //WE NEED TO MOVE THIS FUNCTION
    let currentPlayers = [...playersNames];
    const tournamentContainer = document.getElementById("background");
	// @ts-ignore
    this.tournamentElement = this.fillPlayerNames(createTournamentMap(), playersNames); //this is okay cause we importing from another file
    if (tournamentContainer) {
		// @ts-ignore
      tournamentContainer.appendChild(tournamentElement);
    }
    if (playersNames.length == 4) {
      this.prepTournament4();
    }

    // Validate initial number of players
    if (![4, 8].includes(currentPlayers.length)) {
      alert("Tournament supports only 4, 8 players");
    }

    // Quarter Finals (if applicable)
    if (currentPlayers.length === 8) {
      //need to add a div saying that we are the quarter finals
      const quarterFinalWinners = [];
      for (let i = 0; i < currentPlayers.length; i += 2) {
        await UIManager.mapContinueButton(".continueButton");
        const winner = await this.playMatch(
          currentPlayers[i],
          currentPlayers[i + 1],
		  playersNames
        );
		// @ts-ignore
        gameWinnerModal(winner); //this will come from OTHER FILE SO ITS OKAY
        await UIManager.waitForModal("gameClosing");
        quarterFinalWinners.push(winner);
		if(tournamentContainer)
        tournamentContainer.appendChild(this.tournamentElement);
      }
      currentPlayers = quarterFinalWinners;
    }

    // Semi Finals
    const semiFinalWinners = [];
    //need to add a div saying this semifinals
    for (let i = 0; i < currentPlayers.length; i += 2) {
      await UIManager.mapContinueButton(".continueButton");
      const winner = await this.playMatch(
        currentPlayers[i],
        currentPlayers[i + 1],
		playersNames
      );
      semiFinalWinners.push(winner);
	  // @ts-ignore
      gameWinnerModal(winner);
      await UIManager.waitForModal("gameClosing");
	  if(tournamentContainer)
      tournamentContainer.appendChild(this.tournamentElement);
    }

    await UIManager.mapContinueButton(".continueButton");
    const champion = await this.playMatch(
      semiFinalWinners[0],
      semiFinalWinners[1],
	  playersNames
    );
    const runnerUp =
      champion === semiFinalWinners[0]
        ? semiFinalWinners[1]
        : semiFinalWinners[0];
		// @ts-ignore
    tournamentClosingModal(champion, runnerUp); //this is okay cause its coming from the other file
    await UIManager.waitForModal("congratsModal");
	if(tournamentContainer)
		tournamentContainer.appendChild(this.tournamentElement);
    return champion;
  }

  // Initiates and manages a game match between two players, handles game setup, tracks scoring, and returns a promise that resolves with the winner's name when the game ends
  async playMatch(player1Name, player2Name, playersNames) {
    let tournamentDiv = document.querySelector("#tournamentWrapper");
    if(tournamentDiv)
		tournamentDiv.remove();
		// @ts-ignore
    nextMatchModal(player1Name, player2Name); //this is fine comes from the other file
    await UIManager.waitForModal("nextMatch");
    console.log(`The two playing this game ${player1Name} vs. ${player2Name}`);
    const pageContainer = document.getElementById("background");
	// @ts-ignore
    const game = gameCanvas(); //this comes from the other file
	if(pageContainer)
		pageContainer.appendChild(game);

    return new Promise((resolve, reject) => {
      try {
		// @ts-ignore
        let player1Obj = new Player(player1Name, "left"); //this comes from other file
		// @ts-ignore
        let player2Obj = new Player(player2Name, "right"); //this comes from other file

        const gameboard = document.getElementById("tableBoard");
        const canvas = document.getElementById("board");
		if(!gameboard || !canvas)
		{
			return;
		}
        gameboard.style.visibility = "visible";
        canvas.style.visibility = "visible";
		// @ts-ignore
		let newGame = new GameBoard(boardWidth, boardHeight);
        newGame.initialize();
        newGame.startGame(player1Obj, player2Obj);

        const checkGameStatus = () => {
          if (!newGame.drawFlag) {
            const match = {
              player1: player1Obj.playerName,
              player1Score: player1Obj.finalScore,
              player2: player2Obj.playerName,
              player2Score: player2Obj.finalScore,
              winner:
			  // @ts-ignore
                player1Obj.finalScore >= maxScore
                  ? player1Obj.playerName
                  : player2Obj.playerName,
            };
            this.matchHistory.push(match);
            this.updateTournamentMap(match, playersNames);
            game.remove();
            resolve(match.winner);
          } else {
            requestAnimationFrame(checkGameStatus);
          }
        };

        checkGameStatus();
      } catch (error) {
        reject(error);
      }
    });
  }

  //this function is used to update tournament after every game is run
  updateTournamentMap(match, playersNames) {
    this.matchCount += 1;

    if (playersNames.length == 4 && this.matchCount == 3) {
      this.matchCount = 5;
    }

    const gameToUpdate = this.tournamentElement.querySelector(`#game${this.matchCount}`);
    // Determine which game to update based on this.matchCount

    if (gameToUpdate) {
      // Update team names
      const teamElements = gameToUpdate
        .closest(".game")
        .querySelectorAll(".team span");
      teamElements[0].textContent = match.player1;
      teamElements[1].textContent = match.player2;
      const scoreElement = gameToUpdate
        .closest(".game")
        .querySelector(".score");
      scoreElement.innerHTML = `<span class="score-value">${match.player1Score}</span> :
		<span class="score-value">${match.player2Score}</span>`;
      this.routeWinnerToNextRound(this.matchCount, match.winner, playersNames);
    }
  }

  //updates the tournament map with the name of the player to play in the next match
  routeWinnerToNextRound(currentGameNumber, winner, playersNames) {
    // Mapping of game progression
    const gameProgressionMap =
      playersNames.length == 8
        ? {
            1: { nextGame: 5, teamPosition: 0 },
            2: { nextGame: 5, teamPosition: 1 },
            3: { nextGame: 6, teamPosition: 0 },
            4: { nextGame: 6, teamPosition: 1 },
            5: { nextGame: 7, teamPosition: 0 },
            6: { nextGame: 7, teamPosition: 1 },
          }
        : {
            1: { nextGame: 5, teamPosition: 0 },
            2: { nextGame: 5, teamPosition: 1 },
          };
    // Check if this game has a next round
    const progression = gameProgressionMap[currentGameNumber];
    if (progression) {
      const nextGameElement = this.tournamentElement.querySelector(
        `#game${progression.nextGame}`
      );
      if (nextGameElement) {
        const teamElements = nextGameElement
          .closest(".game")
          .querySelectorAll(".team span");
        teamElements[progression.teamPosition].textContent = winner;
      }
    }
  }

  //ADD TO PLAYER CLASS
  //This is put the playernames in the tournament map
  fillPlayerNames(tournamentMap, playersNames) {
    const teamSpans = tournamentMap.querySelectorAll(".team span");

    // Update Game 1
    teamSpans[0].textContent = playersNames[0];
    teamSpans[1].textContent = playersNames[1];

    // Update Game 2
    teamSpans[2].textContent = playersNames[2];
    teamSpans[3].textContent = playersNames[3];

    if (playersNames.length == 8) {
      teamSpans[4].textContent = playersNames[4];
      teamSpans[5].textContent = playersNames[5];

      // Update Game 4
      teamSpans[6].textContent = playersNames[6];
      teamSpans[7].textContent = playersNames[7];
    }
    return tournamentMap;
  }

  //This modifies the map to match for only FOUR Players. Mostly CSS
  prepTournament4() {
    var game3 = document.getElementsByClassName("game3");
    var game4 = document.getElementsByClassName("game4");
    var game6 = document.getElementsByClassName("game6");
    var game7 = document.getElementsByClassName("game7");

    for (var i = 0; i < game3.length; i++) {
		// @ts-ignore
      game3[i].style.display = "none";
    }
    for (var i = 0; i < game4.length; i++) {
		// @ts-ignore
      game4[i].style.display = "none";
    }
    for (var i = 0; i < game6.length; i++) {
		// @ts-ignore
      game6[i].style.display = "none";
    }
    for (var i = 0; i < game7.length; i++) {
		// @ts-ignore
      game7[i].style.display = "none";
    }

    // Also delete pseudo elements that start from game 5. class .connection-5-7
    var connection57 = document.getElementsByClassName("connection-5-7");
    for (var i = 0; i < connection57.length; i++) {
		// @ts-ignore
      connection57[i].style.display = "none";
    }

    // Adjust the position of the game 5
    var game5 = document.getElementsByClassName("game5");
    if (game5) {
      console.log(game5);
	  // @ts-ignore
      game5[0].style.top = "85%";
	  // @ts-ignore
      game5[0].style.left = "45%";
	  // @ts-ignore
      game5[0].style.transform = "translate(-50%, -50%)";
    }
	// @ts-ignore
    // game5[0].style.width = "100%";

    // Select the div with the class 'col-4 d-flex justify-content-center last'
    const divToDelete = document.querySelector(
      ".col-4.d-flex.justify-content-center.last"
    );
    if (divToDelete) {
      divToDelete.remove();
    }

    // Select the first round div to update the class
    const divToUpdate = document.querySelector(
      ".col-4.d-flex.justify-content-center.align-items-end"
    );
    if (divToUpdate) {
      divToUpdate.classList.replace("col-4", "col-6");
    }

    // Select the second round div to update the class
    const divToUpdate2 = document.querySelector(
      ".col-4.d-flex.justify-content-center.align-items-start"
    );
    if (divToUpdate2) {
      divToUpdate2.classList.replace("col-4", "col-6");
    }

    // make the connection between game 1 and game 5 width to 80px
    var connection15 = document.getElementsByClassName("connection-1-5");
    for (var i = 0; i < connection15.length; i++) {
		// @ts-ignore
      connection15[i].style.width = "80px";
    }

    // make the connection between game 2 and game 5 width to 80px
    var connection25 = document.getElementsByClassName("connection-2-5");
    for (var i = 0; i < connection25.length; i++) {
		// @ts-ignore
      connection25[i].style.width = "80px";
    }

    // make final4 class name div's from justify-content-center to start
    var final4 = document.getElementsByClassName("final4");
    for (var i = 0; i < final4.length; i++) {
      final4[i].classList.replace(
        "justify-content-center",
        "justify-content-start"
      );
    }
  }
}

class UIManager {
  static closeModal(modalId) {
    console.log("closing modal");
    const modal = document.getElementById(modalId);
    if (modal) {
		// @ts-ignore
      modal.hide;
      modal.remove(); // Remove the modal from the DOM
      document.body.classList.remove("modal-open"); // Remove the modal-open class from body
    } else {
      console.warn(`Modal with id "${modalId}" not found.`);
    }
  }

  // Returns a promise that resolves when a modal is closed, with a 10-second timeout safeguard to automatically close lingering modals
  static waitForModal(modalId) {
    return new Promise((resolve) => {
      let elapsedTime = 0;
      const interval = 100; // Check every 100ms
      const timeout = 10000; // 10 seconds

      const checker = setInterval(() => {
        const modal = document.getElementById(modalId);

        // Check if the modal exists and the body still has the modal-open class
        const isBodyClassRemoved =
          !document.body.classList.contains("modal-open");

        if (isBodyClassRemoved) {
          console.log(
            "Modal and modal-open class no longer exist. Resolving..."
          );
          clearInterval(checker);
          resolve(1);
        } else if (elapsedTime >= timeout) {
          // If time exceeds 10 seconds, close the modal
          console.warn("Modal exists for too long. Closing modal...");
          clearInterval(checker);
		  // @ts-ignore
          modal.hide;
          UIManager.closeModal(modalId);
          resolve(1);
        } else {
          console.log(
            "Modal is still open or body class remains. Continue checking..."
          );
          elapsedTime += interval;
        }
      }, interval);
    });
  }

  //this our way of stopping the code flow. We wait for the button to clicked before going to the next section
  static mapContinueButton(buttonClass) {
    return new Promise((resolve, reject) => {
      const continueButton = document.querySelector(buttonClass);
      if (!continueButton) {
        reject("Not working");
        console.error("Continue button not found in the DOM.");
        return; // Exit the function early to prevent further execution
      }
      const handleClick = () => {
        continueButton.removeEventListener("click", handleClick);
        resolve(1);
      };
      continueButton.addEventListener("click", handleClick);
    });
  }
}

// Main game controller that coordinates between other classes
class GameController {
  constructor() {
    this.playerManager = new PlayerManager();
    this.tournament = new Tournament();
	// @ts-ignore
    this.gameBoard = new GameBoard(boardWidth, boardHeight); //this is okay comes from other file
    this.currentGame = null;
	this.maxPlayerNumbers = 0
  }
  // Initializes a tournament setup modal that prompts for the number of players, validates input, and triggers player addition setup when closed
  initializeTournament() {
    const existingModal = document.getElementById("tournamentModal");
    if (existingModal) {
      existingModal.remove();
    }
    // @ts-ignore
    const modal = getPlayerNumberModal(); //put player number modal, comes from other file
    document.body.appendChild(modal); //add it to the page

    const playersNumberInput = document.getElementById("playersNumber"); //get players number div container
    const submitPlayerNumBtn = document.getElementById("submitPlayerNumBtn"); //get submit player button

	if(!playersNumberInput || !submitPlayerNumBtn)
		return
    // Add input event listener for real-time validation
    playersNumberInput.addEventListener("input", PlayerManager.validatePlayerNumber); //when number is inputted check if its correct

    // Modify existing submit button event listener
    submitPlayerNumBtn.addEventListener("click", () => {
      if (!PlayerManager.validatePlayerNumber()) {
        return;
      }
	  // @ts-ignore
      this.maxPlayerNumbers = playersNumberInput.value;
      console.log("Creating tournament with ", this.maxPlayerNumbers, " players");
      UIManager.closeModal("tournamentModal"); //close the tournament modal
      this.playerManager.setUpPlayerAddition(this.maxPlayerNumbers);
    });
    // close the modal when the close button is clicked
	if(!document)
		return;
		// @ts-ignore
    document
      .querySelector("#tournamentModal .btn-close")
      .addEventListener("click", () => {
		// @ts-ignore
        this.maxPlayerNumbers = playersNumberInput.value;
        console.log("Creating tournament with ", this.maxPlayerNumbers, " players");
        UIManager.closeModal("tournamentModal");
        this.playerManager.setUpPlayerAddition(this.maxPlayerNumbers, this);
      });

    // close the modal when the modal is clicked outside
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
		// @ts-ignore
       this.maxPlayerNumbers = playersNumberInput.value;
        console.log("Creating tournament with ", this.maxPlayerNumbers, " players");
        UIManager.closeModal("tournamentModal");
        this.playerManager.setUpPlayerAddition(this.maxPlayerNumbers);
      }
    });
	// @ts-ignore
    document
      .getElementById("playerInput")
      .addEventListener("input", function () {
        const errorMsgDiv = document.getElementById("player-name-error-msg");
        if (errorMsgDiv) {
          errorMsgDiv.textContent = "";
          errorMsgDiv.style.display = "none";
        }
      });
  }

  //This is the main part where we create tournament map and run the tournament
  async startTournament(maxPlayerNumbers, playersNames) {
    if (playersNames.length !== parseInt(maxPlayerNumbers)) {
      const errorMsgDiv = document.getElementById("player-name-error-msg");
	  if(errorMsgDiv)
	  {
		  errorMsgDiv.textContent = "Players do not match total number of players";
		  errorMsgDiv.style.display = "block";
	  }
      return;
    }
	if(!document)
		return;
		// @ts-ignore
    document.querySelector(".playerListContainer").remove();
    try {
      const champion = await this.tournament.runTournament(playersNames);
      console.log("Champion:", champion);
    //   console.log("Match History:", this.tournament.getMatchHistory());
    } catch (error) {
      console.error("Tournament error:", error);
    }
  }
}
