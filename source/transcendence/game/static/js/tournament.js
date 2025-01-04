async function createTournamentinDB(tournament_type) {
	try {
		const response = await fetch("/tournament/", {
			method: "POST",
			headers: {
				"X-Requested-With": "XMLHttpRequest",
				"X-CSRFToken": await getCSRFToken(),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({type: tournament_type}),
		});
		const responseData = await response.json();
		if (response.ok) {
			console.log(`tournament ${responseData.tournament_id} got created!`);
			return responseData.tournament_id;
		}
		return 0;
	} catch (error) {
		console.error("some kinda error in tournament creation!")
	}
}

{
  class GameBoard {
    constructor() {
      this.game = new Game();
      this.game.initializeBoard("board");
      this.game.aiFlag = false;
      this.game.versusFlag = false;
      this.game.tournamentFlag = true;
	  window.addEventListener("resize", tournamentGameScreenSize);
    }
    //this is the function that starts the game by calling draw function and displays names at the top of the canvas
    async startTournamentGame(player1Name, player2Name) {
      this.game.createPlayer(player1Name, "left");
      this.game.createPlayer(player2Name, "right");
      this.game.drawFlag = true;
      this.game.setupeventListeners();
      const player1NameElement = document.getElementById("player1Name");
      if (player1NameElement) {
        player1NameElement.textContent = "@ " + player1Name;
        player1NameElement.style.display = "block";
      }
      const player2NameElement = document.getElementById("player2Name");
      if (player2NameElement) {
        player2NameElement.textContent = "@ " + player2Name;
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
      const tournament_id = document
        .getElementById("background")
        .getAttribute("data-tournamentId");
      this.game.tournament_id = tournament_id;
      await createGameInDB(this.game);
      requestAnimationFrame((timestamp) => gameLoop(this.game, timestamp));
      //   if (gameCreated)
      //   } else {
      // alert("Failed to start game. We will have to restart")
      // updateUI("/home")
      //   }
    }
    getPlayers() {
      return this.game.players;
    }
  }

  class PlayerManager {
    constructor() {
      this.playersNames = [
        //@ts-ignore
        document
          .getElementById("playerContainer")
          .querySelector("button h6")
          .textContent.trim(),
      ];
      this.maxPlayerNumbers = 0;

      console.log(this.playersNames[0]); // Logs "Tofara Mususa"
    }

    // This is to check is number of players is 4 or 8 and if not give an error
    static validatePlayerNumber() {
      const playersNumberInput = document.getElementById("playersNumber");
      const errorMsgDiv = document.getElementById("local-game-error-msg");
      let maxPlayers = null;
      if (playersNumberInput) {
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
      //   if (playerName.length < 3 || playerName.length > 15) {
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

    // Sets up the player addition UI, handles player input, and initializes tournament actions based on max player numbers.
    setUpPlayerAddition(maxPlayerNumbers, tournamentObject) {
      // maxPlayerNumbers = !maxPlayerNumbers || parseInt(maxPlayerNumbers) != 4 || 8 ? 4 : parseInt(maxPlayerNumbers);
      const uiElements = this.getPlayerUiElements();
      if (!uiElements) return;

      uiElements.playerIcon.addEventListener("click", () => {
        this.handlePlayerInput(
          uiElements.playerInput,
          uiElements.playerContainer,
          maxPlayerNumbers
        );
      });

      uiElements.playerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handlePlayerInput(
            uiElements.playerInput,
            uiElements.playerContainer,
            maxPlayerNumbers
          );
        }
      });
      uiElements.initTournamentButton.addEventListener("click", async () => {
        console.log("Players:", this.playersNames);
        if (this.playersNames.length === parseInt(maxPlayerNumbers)) {
          console.log("Good to go:", this.playersNames);
          const tournament_id = await createTournamentinDB(this.playersNames.length);
          if (tournament_id != 0)
            document
              .getElementById("background")
              .setAttribute("data-tournamentId", tournament_id);
          else return;
        }
        await tournamentObject.startTournament(
          maxPlayerNumbers,
          this.playersNames
        );
        // console.log("Good to go:", goodToGo);
        // if (goodToGo === false) {
        // 	alert("Failed to start tournament. Please try again.");
        // 	return ;
        // }
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

    checkGameStatus = (
      players,
      newTournamentGame,
      gameCanvas,
      playersNames
    ) => {
      if (!newTournamentGame.game.drawFlag) {
        const match = {
          player1: players[0].playerName,
          player1Score: players[0].finalScore,
          player2: players[1].playerName,
          player2Score: players[1].finalScore,
          winner:
            players[0].finalScore >= newTournamentGame.game.maxScore
              ? players[0].playerName
              : players[1].playerName,
        };
        this.matchHistory.push(match);
        this.updateTournamentMap(match, playersNames);
        gameCanvas.remove();
		window.removeEventListener("resize", tournamentGameScreenSize);
        return match.winner;
      }
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve(
            this.checkGameStatus(
              players,
              newTournamentGame,
              gameCanvas,
              playersNames
            )
          );
        });
      });
    };

    // Initiates and manages a game match between two players, handles game setup, tracks scoring, and returns a promise that resolves with the winner's name when the game ends
    async playMatch(player1Name, player2Name, playersNames) {
      let tournamentDiv = document.querySelector("#tournamentWrapper");
      if (tournamentDiv) tournamentDiv.remove();
      nextMatchModal(player1Name, player2Name); //this is fine comes from the other file
      await UIManager.waitForModal("nextMatch");
      console.log(
        `The two playing this game ${player1Name} vs. ${player2Name}`
      );
      const pageContainer = document.getElementById("background");
      const gameCanvas = createGameCanvas(); //Input the Game Canvas into the page
      if (pageContainer) pageContainer.appendChild(gameCanvas);

      return new Promise((resolve, reject) => {
        try {
          const gameboard = document.getElementById("tournamentGameBoard");
          const canvas = document.getElementById("board");
          let newTournamentGame = new GameBoard();
          let players = newTournamentGame.getPlayers();
          //HERE IS TO CREATE THE GAME IN DB
          newTournamentGame.startTournamentGame(player1Name, player2Name);
          resolve(
            this.checkGameStatus(
              players,
              newTournamentGame,
              gameCanvas,
              playersNames
            )
          );
        } catch (error) {
          console.error("Error playing match:", error);
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
      const gameToUpdate = this.tournamentElement.querySelector(
        `#game${this.matchCount}`
      );
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
        this.routeWinnerToNextRound(
          this.matchCount,
          match.winner,
          playersNames
        );
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
      // Iterate through playersNames and assign textContent to teamSpans
      for (let i = 0; i < playersNames.length; i++) {
        teamSpans[i].textContent = playersNames[i];
      }
      return tournamentMap;
    }

    //This modifies the map to match for only FOUR Players. Mostly CSS
    prepTournament4() {
      let game3 = document.getElementsByClassName("game3");
      let game4 = document.getElementsByClassName("game4");
      let game6 = document.getElementsByClassName("game6");
      let game7 = document.getElementsByClassName("game7");

      for (let i = 0; i < game3.length; i++) {
        game3[i].style.display = "none";
      }
      for (let i = 0; i < game4.length; i++) {
        game4[i].style.display = "none";
      }
      for (let i = 0; i < game6.length; i++) {
        game6[i].style.display = "none";
      }
      for (let i = 0; i < game7.length; i++) {
        game7[i].style.display = "none";
      }

      // Also delete pseudo elements that start from game 5. class .connection-5-7
      let connection57 = document.getElementsByClassName("connection-5-7");
      for (let i = 0; i < connection57.length; i++) {
        connection57[i].style.display = "none";
      }

      // Adjust the position of the game 5
      let game5 = document.getElementsByClassName("game5");
      if (game5) {
        console.log(game5);
        game5[0].style.top = "85%";
        game5[0].style.left = "45%";
        game5[0].style.transform = "translate(-50%, -50%)";
      }
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
      let connection15 = document.getElementsByClassName("connection-1-5");
      for (let i = 0; i < connection15.length; i++) {
        connection15[i].style.width = "80px";
      }

      // make the connection between game 2 and game 5 width to 80px
      let connection25 = document.getElementsByClassName("connection-2-5");
      for (let i = 0; i < connection25.length; i++) {
        connection25[i].style.width = "80px";
      }

      // make final4 class name div's from justify-content-center to start
      let final4 = document.getElementsByClassName("final4");
      for (let i = 0; i < final4.length; i++) {
        final4[i].classList.replace(
          "justify-content-center",
          "justify-content-start"
        );
      }
    }

    // Orchestrates a complete tournament for 4 or 8 players, managing quarter-finals, semi-finals, and finals matches sequentially, returning the tournament champion
    async runTournament(playersNames) {
      playersNames = PlayerManager.randomisePlayers(playersNames); //WE NEED TO MOVE THIS FUNCTION
      let currentPlayers = [...playersNames];
      const tournamentContainer = document.getElementById("background");
      this.tournamentElement = this.fillPlayerNames(
        createTournamentMap(),
        playersNames
      ); //this is okay cause we importing from another file
      if (tournamentContainer) {
        tournamentContainer.appendChild(this.tournamentElement);
      }
      if (playersNames.length == 4) {
        this.prepTournament4();
      }
      // Validate initial number of players
      if (![4, 8].includes(currentPlayers.length)) {
        alert("Tournament supports only 4, 8 players");
        // return ;
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
          gameWinnerModal(winner); //this will come from OTHER FILE SO ITS OKAY
          // Close the modal after 2 seconds
          setTimeout(() => {
            closeModal("gameClosing");
          }, 1750);
          quarterFinalWinners.push(winner);
          if (tournamentContainer)
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
        gameWinnerModal(winner);
        // Close the modal after 2 seconds
        setTimeout(() => {
          closeModal("gameClosing");
        }, 2000);
        if (tournamentContainer)
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
      tournamentClosingModal(champion, runnerUp); //this is okay cause its coming from the other file
      await UIManager.waitForModal("congratsModal");
      updateTournamentMapAfterFinal(
        tournamentContainer,
        this.tournamentElement
      );
      return champion;
    }
  }

  class UIManager {
    static closeModal(modalId) {
      console.log("closing modal");
      const modal = document.getElementById(modalId);
      if (modal) {
        let backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) backdrop.remove();
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
		  const timeout = 3000; // 3 seconds
	
		  const checker = setInterval(() => {
			const modal = document.getElementById(modalId);
	
			// Check if the modal exists and the body still has the modal-open class
			const isBodyClassRemoved =
			  !document.body.classList.contains("modal-open");
	
			if (isBodyClassRemoved) {
			  clearInterval(checker);
			  resolve(1);
			} else if (elapsedTime >= timeout) {
			  // If time exceeds 10 seconds, close the modal
			  console.warn("Modal exists for too long. Closing modal...");
			  clearInterval(checker);
			  // @ts-ignore
			  modal.hide;
			  closeModal(modalId);
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
      this.currentGame = null;
      this.maxPlayerNumbers = 0;
    }
    // Initializes a tournament setup modal that prompts for the number of players, validates input, and triggers player addition setup when closed
    initializeTournament() {
      const existingModal = document.getElementById("tournamentModal");
      if (existingModal) {
        existingModal.remove();
      }
      const modal = getPlayerNumberModal(); //put player number modal, comes from other file
      document.body.appendChild(modal); //add it to the page
      
      // create eventlistner
      document.getElementById("tournamentOf4").addEventListener("click", () => {
        this.maxPlayerNumbers = 4;
        console.log( "Creating tournament with ", this.maxPlayerNumbers, " players");
        console.log(this.maxPlayerNumbers);
        closeModal("tournamentModal");
        this.playerManager.setUpPlayerAddition(this.maxPlayerNumbers, this);
      });
      document.getElementById("tournamentOf8").addEventListener("click", () => {
        this.maxPlayerNumbers = 8;
        console.log( "Creating tournament with ", this.maxPlayerNumbers, " players");
        console.log(this.maxPlayerNumbers);
        closeModal("tournamentModal");
        this.playerManager.setUpPlayerAddition(this.maxPlayerNumbers, this);
      });
      // set eventlisner for outside of the window clicked
      document.querySelector(".btn-close").addEventListener("click", async (e) => {
        // if (e.target.id === "tournamentModal") {
          console.log("clicked outside");
          closeModal("tournamentModal");
          await updateUI(`/home`);
        // }
      });
    };



    //This is the main part where we create tournament map and run the tournament
    async startTournament(maxPlayerNumbers, playersNames) {
      if (playersNames.length !== parseInt(maxPlayerNumbers)) {
        const errorMsgDiv = document.getElementById("player-name-error-msg");
        if (errorMsgDiv) {
          errorMsgDiv.textContent =
            "Players do not match total number of players";
          errorMsgDiv.style.display = "block";
        }
        return;
      }
      if (!document) return;
      document.querySelector(".playerListContainer").remove();
      try {
        const champion = await this.tournament.runTournament(playersNames);
        console.log("Champion:", champion);
        console.log(this.tournament.matchHistory);
        // const pageContainer = document.getElementById("background");

        //   console.log("Match History:", this.tournament.getMatchHistory());
      } catch (error) {
        console.error("Tournament error:", error);
        // return false;
      }
      console.log("Tournament complete!");
      // return true;
    }
  }

  const newTournament = new GameController();
  newTournament.initializeTournament();
}
