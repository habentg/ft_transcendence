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

			return responseData.tournament_id;
		}
		return 0;
	} catch (error) {
    createToast({type: 'error', error_message: 'Failed to create tournament', title: 'Tournament Creation Error!'});
	}
}

{
  class GameBoard {
    constructor() {
      this.game = new Game();
	  window.addEventListener("resize", () => checkScreenSize(this.game));
      this.game.initializeBoard("board");
      this.game.aiFlag = false;
      this.game.versusFlag = false;
      this.game.tournamentFlag = true;
	  this.loadGameCustomisizeSettings();
    }

    async startTournamentGame(player1Name, player2Name) {
      this.game.createPlayer(player1Name, "left");
      this.game.createPlayer(player2Name, "right");
      this.game.drawFlag = true;
      this.game.setupeventListeners();
	  addPlayerTitles(player1Name, player2Name)
      const tournament_id = document.getElementById("background").getAttribute("data-tournamentId");
      this.game.tournament_id = tournament_id;
      const ret = await createGameInDB(this.game);
      if (ret === 'start_tournament'){
        window.isGameRunning = true;
		this.game.resetValues();
        requestAnimationFrame((timestamp) => gameLoop(this.game, timestamp));
      }
      else {
        createToast({type: 'error', error_message: 'Failed to start Tournament games', title: 'Game Creating Error!'});
        return ;
      }
    }
    getPlayers() {
      return this.game.players;
    }
	loadGameCustomisizeSettings() {
		const username = document.getElementById("background").getAttribute("data-username");
		this.game.loadSettings(username);
	}
  }

  class PlayerManager {
    constructor() {
      this.playersNames = [document.getElementById("playerContainer").querySelector("button h6").textContent.trim(),];
      this.maxPlayerNumbers = 0;
	  document.getElementById("background").setAttribute("data-username", this.playersNames[0])
    }
    getPlayerUiElements() {
      return {
        playerInput: document.getElementById("playerInput"),
        playerIcon: document.getElementById("playerIcon"),
        playerContainer: document.getElementById("playerContainer"),
        initTournamentButton: document.getElementById("initTournamentButton"),
      };
    }

    createPlayerButtonWithRemoveOption(playerName) {
      const playerButton = document.createElement("button");
      playerButton.classList.add( "menu-item", "d-flex", "justify-content-between", "align-items-center", "p-3");
      const nameContainer = document.createElement("div");
      nameContainer.classList.add("d-flex", "align-items-center", "mx-auto");
      nameContainer.innerHTML = `
			  <i class="fas fa-user fa-1x me-2"></i>
			  <h6 class="mb-0">${playerName}</h6>
			`;
      const deleteIcon = this.createRemovePlayerIcon(playerName);
      playerButton.appendChild(nameContainer);
      playerButton.appendChild(deleteIcon);
      return playerButton;
    }

    createRemovePlayerIcon(playerName) {
      const deleteIcon = document.createElement("i");
      deleteIcon.classList.add("fas", "fa-times", "ms-2"); 
      deleteIcon.style.color = "rgba(255, 255, 255, 0.8)";
      deleteIcon.style.cursor = "pointer";
    
      deleteIcon.addEventListener("click", () => {
       
        const index = this.playersNames.indexOf(playerName);
        if (index > -1) {
          this.playersNames.splice(index, 1);
        }
       
        if (deleteIcon.parentElement) {
          deleteIcon.parentElement.remove();
        }
      });
      return deleteIcon;
    }
   
    handlePlayerInput(playerInput, playerContainer, maxPlayerNumbers) {
      const playerName = playerInput.value.trim();
      const errorMsgDiv = document.getElementById("player-name-error-msg");

     
      if (errorMsgDiv) {
        errorMsgDiv.textContent = "";
        errorMsgDiv.style.display = "none";
      }
     
      if (!playerName) {
        return;
      }
     
      if (this.playersNames.length == maxPlayerNumbers && errorMsgDiv) {
        errorMsgDiv.textContent = "Max Players reached";
        errorMsgDiv.style.display = "block";
        return;
      }
		if ((playerName.length > 15) && errorMsgDiv) {
			errorMsgDiv.textContent = "Player name must less than 15 characters.";
			errorMsgDiv.style.display = "block";
			return;
		}     
	  const letterRegex = /^[A-Za-z0-9]+$/;
      if (!letterRegex.test(playerName) && errorMsgDiv) {
        errorMsgDiv.textContent = "Player name should contain only letters and numbers!";
        errorMsgDiv.style.display = "block";
        return;
      }
      if (this.playersNames.includes(playerName) && errorMsgDiv) {
        errorMsgDiv.textContent = "Player name is taken!";
        errorMsgDiv.style.display = "block";
        return;
      }
      this.addPlayerToList(playerName, playerContainer);
      playerInput.value = "";
    }

    static randomisePlayers(array) {
      const shuffledArray = [...array];
      for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [ shuffledArray[j], shuffledArray[i]];
      }
      return shuffledArray;
    }
   
    addPlayerToList(playerName, playerContainer) {
      if (this.playersNames.includes(playerName)) {
        return;
      }
      this.playersNames.push(playerName);
      const playerButton = this.createPlayerButtonWithRemoveOption(playerName);
      playerContainer.appendChild(playerButton);
    }

    setUpPlayerAddition(maxPlayerNumbers, tournamentObject) {
      const uiElements = this.getPlayerUiElements();
      if (!uiElements) return;

      uiElements.playerIcon.addEventListener("click", () => {
        this.handlePlayerInput(uiElements.playerInput, uiElements.playerContainer, maxPlayerNumbers);
      });

      uiElements.playerInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.handlePlayerInput(uiElements.playerInput, uiElements.playerContainer, maxPlayerNumbers);
        }
      });
      uiElements.initTournamentButton.addEventListener("click", async () => {
        if (this.playersNames.length === parseInt(maxPlayerNumbers)) {

          const tournament_id = await createTournamentinDB(this.playersNames.length);
          if (tournament_id != 0)
            document.getElementById("background").setAttribute("data-tournamentId", tournament_id);
          else
		  	return;
        }
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

    checkGameStatus = (players, newTournamentGame, gameCanvas, warningMessage, playersNames) => {
      if (!newTournamentGame.game.drawFlag && !window.isGameRunning) {
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
		if(warningMessage)
			warningMessage.remove();
        gameCanvas.remove();
        return match.winner;
      }
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve(this.checkGameStatus(players, newTournamentGame, gameCanvas,warningMessage, playersNames));
        });
      });
    };

    async playMatch(player1Name, player2Name, playersNames) {
      let tournamentDiv = document.querySelector("#tournamentWrapper");
      if (tournamentDiv) tournamentDiv.remove();
      nextMatchModal(player1Name, player2Name);
      await UIManager.waitForModal("nextMatch");
      document.getElementById("nextMatch_modal").remove();
      const pageContainer = document.getElementById("background");
      const gameCanvas = createGameCanvas();
      const warningMessage = addWarningMessage();
      if (pageContainer) 
		{
			pageContainer.appendChild(warningMessage);
			pageContainer.appendChild(gameCanvas);
		}
      return new Promise((resolve, reject) => {
        try {
          let newTournamentGame = new GameBoard();

          let players = newTournamentGame.getPlayers();
          newTournamentGame.startTournamentGame(player1Name, player2Name);
          resolve(this.checkGameStatus(players, newTournamentGame, gameCanvas, warningMessage,playersNames));
        } catch (error) {
          createToast({type: 'error', error_message: 'Failed to play match', title: 'Game Error!'});
          reject(error);
        }
      });
    }

    updateTournamentMap(match, playersNames) {
      this.matchCount += 1;
      if (playersNames.length == 4 && this.matchCount == 3) {
        this.matchCount = 5;
      }
      const gameToUpdate = this.tournamentElement.querySelector(
        `#game${this.matchCount}`
      );
      if (gameToUpdate) {
        const teamElements = gameToUpdate.closest(".game").querySelectorAll(".team span");
        teamElements[0].textContent = match.player1.length > 8 ? match.player1.slice(0,7) + '.' : match.player1;
        teamElements[1].textContent = match.player2.length > 8 ? match.player2.slice(0,7) + '.' : match.player2;
        const scoreElement = gameToUpdate.closest(".game").querySelector(".score");
        scoreElement.innerHTML = `<span class="score-value">${match.player1Score}</span> :
			<span class="score-value">${match.player2Score}</span>`;
        this.routeWinnerToNextRound(this.matchCount, match.winner, playersNames);
      }
    }

    routeWinnerToNextRound(currentGameNumber, winner, playersNames) {
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
      const progression = gameProgressionMap[currentGameNumber];
      if (progression) {
        const nextGameElement = this.tournamentElement.querySelector(`#game${progression.nextGame}`);
        if (nextGameElement) {
          const teamElements = nextGameElement.closest(".game").querySelectorAll(".team span");
			const concatWinner = winner.length > 8 ? winner.slice(0,7) + '.' : winner
          teamElements[progression.teamPosition].textContent = concatWinner;
        }
      }
    }
    fillPlayerNames(tournamentMap, playersNames) {
      const teamSpans = tournamentMap.querySelectorAll(".team span");
      for (let i = 0; i < playersNames.length; i++) {
		playersNames[i] = playersNames[i].length > 8 ? playersNames[i].slice(0, 7) + '.' : playersNames[i];
        teamSpans[i].textContent = playersNames[i];
      }
      return tournamentMap;
    }

    prepTournament4() {
      let game3 = document.getElementsByClassName("game3");
      let game4 = document.getElementsByClassName("game4");
      let game_5 = document.getElementById("game5");
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

      if (game_5)
        game_5.textContent = "FINAL";
      let connection57 = document.getElementsByClassName("connection-5-7");
      for (let i = 0; i < connection57.length; i++) {
        connection57[i].style.display = "none";
      }
      let game5 = document.getElementsByClassName("game5");
      if (game5) {
        game5[0].style.top = "85%";
        game5[0].style.left = "45%";
        game5[0].style.transform = "translate(-50%, -50%)";
      }

      const divToDelete = document.querySelector(
        ".col-4.d-flex.justify-content-center.last"
      );
      if (divToDelete) {
        divToDelete.remove();
      }

      const divToUpdate = document.querySelector(
        ".col-4.d-flex.justify-content-center.align-items-end"
      );
      if (divToUpdate) {
        divToUpdate.classList.replace("col-4", "col-6");
      }

      const divToUpdate2 = document.querySelector(".col-4.d-flex.justify-content-center.align-items-start");
      if (divToUpdate2) {
        divToUpdate2.classList.replace("col-4", "col-6");
      }

      let connection15 = document.getElementsByClassName("connection-1-5");
      for (let i = 0; i < connection15.length; i++) {
        connection15[i].style.width = "80px";
      }

      let connection25 = document.getElementsByClassName("connection-2-5");
      for (let i = 0; i < connection25.length; i++) {
        connection25[i].style.width = "80px";
      }
      let final4 = document.getElementsByClassName("final4");
      for (let i = 0; i < final4.length; i++) {
        final4[i].classList.replace( "justify-content-center","justify-content-start");
      }
    }

    async runTournament(playersNames) {
      playersNames = PlayerManager.randomisePlayers(playersNames);
      let currentPlayers = [...playersNames];
      const tournamentContainer = document.getElementById("background");
      this.tournamentElement = this.fillPlayerNames(createTournamentMap(),playersNames);
      if (tournamentContainer) {
        tournamentContainer.appendChild(this.tournamentElement);
      }
      if (playersNames.length == 4) {
        this.prepTournament4();
      }
      if (currentPlayers.length === 8) {
        const quarterFinalWinners = [];
        for (let i = 0; i < currentPlayers.length; i += 2) {
          await UIManager.mapContinueButton(".continueButton");
          const winner = await this.playMatch(currentPlayers[i], currentPlayers[i + 1],playersNames);
          gameWinnerModal(winner);
          setTimeout(() => { UIManager.closeModal("gameClosing"); }, 1750);
          if (document.getElementById("gameClosing_modal"))
            document.getElementById("gameClosing_modal").remove();
          quarterFinalWinners.push(winner);
          if (tournamentContainer)
            tournamentContainer.appendChild(this.tournamentElement);
        }
        currentPlayers = quarterFinalWinners;
      }

      const semiFinalWinners = [];
      for (let i = 0; i < currentPlayers.length; i += 2) {
        await UIManager.mapContinueButton(".continueButton");
        const winner = await this.playMatch(currentPlayers[i], currentPlayers[i + 1], playersNames);
        semiFinalWinners.push(winner);
        gameWinnerModal(winner);
        setTimeout(() => { UIManager.closeModal("gameClosing");}, 2000);
        if (document.getElementById("gameClosing_modal"))
            document.getElementById("gameClosing_modal").remove();
        if (tournamentContainer)
          tournamentContainer.appendChild(this.tournamentElement);
      }
      await UIManager.mapContinueButton(".continueButton");
      const champion = await this.playMatch(semiFinalWinners[0], semiFinalWinners[1], playersNames);
      const runnerUp = champion === semiFinalWinners[0] ? semiFinalWinners[1] : semiFinalWinners[0];
      tournamentClosingModal(champion, runnerUp);
      await UIManager.waitForModal("congratsModal");
      updateTournamentMapAfterFinal(tournamentContainer, this.tournamentElement);
      return champion;
    }
  }

  class UIManager {
    static closeModal(modalId) {
      // const modal = document.getElementById(modalId);
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
              modal.hide();
          }
          modalElement.remove();
      }
    }

	static waitForModal(modalId) {
		return new Promise((resolve) => {
		  let elapsedTime = 0;
		  const interval = 100;
		  const timeout = 3000;
	
		  const checker = setInterval(() => {
			const modal = document.getElementById(modalId);
			const isBodyClassRemoved = !document.body.classList.contains("modal-open");
			if (isBodyClassRemoved) {
			  clearInterval(checker);
			  resolve(1);
			} else if (elapsedTime >= timeout) {
			  clearInterval(checker);
			  modal.hide;
			  UIManager.closeModal(modalId);
			  resolve(1);
			} else {
			  elapsedTime += interval;
			}
		  }, interval);
		});
	  }
    static mapContinueButton(buttonClass) {
      return new Promise((resolve, reject) => {
        const continueButton = document.querySelector(buttonClass);
        if (!continueButton) {
          reject("Not working");
          return;
        }
        const handleClick = () => {
          continueButton.removeEventListener("click", handleClick);
          resolve(1);
        };
        continueButton.addEventListener("click", handleClick);
      });
    }
  }

  class GameController {
    constructor() {
      this.playerManager = new PlayerManager();
      this.tournament = new Tournament();
      this.currentGame = null;
      this.maxPlayerNumbers = 0;
    }
    initializeTournament() {
      const existingModal = document.getElementById("tournamentModal");
      if (existingModal) {
        existingModal.remove();
      }
      const modal = getPlayerNumberModal(); 
      document.body.appendChild(modal); 
      document.getElementById("tournamentOf4").addEventListener("click", () => {
        this.maxPlayerNumbers = 4;
        UIManager.closeModal("tournamentModal");
		this.setupGameCustomization();
        this.playerManager.setUpPlayerAddition(this.maxPlayerNumbers, this);
      });
      document.getElementById("tournamentOf8").addEventListener("click", () => {
        this.maxPlayerNumbers = 8;
        UIManager.closeModal("tournamentModal");
		this.setupGameCustomization();
        this.playerManager.setUpPlayerAddition(this.maxPlayerNumbers, this);
      });
      document.querySelector(".btn-close").addEventListener("click", async (e) => {

          UIManager.closeModal("tournamentModal");
          await updateUI(`/home`);
      });
    };

	setupGameCustomization() {
		const newGame = new Game();
		newGame.createPlayer(this.playerManager.playersNames[0], "left");
		changeSetting(newGame);
	}

    async startTournament(maxPlayerNumbers, playersNames) {
      if (playersNames.length !== parseInt(maxPlayerNumbers)) {
        const errorMsgDiv = document.getElementById("player-name-error-msg");
        if (errorMsgDiv) {
          errorMsgDiv.textContent = "Players do not match total number of players";
          errorMsgDiv.style.display = "block";
        }
        return;
      }
      if (!document) return;
      document.querySelector(".playerListContainer").remove();
      try {
        const champion = await this.tournament.runTournament(playersNames);
      } catch (error) {
	  createToast({type: 'error', error_message: 'Failed to run Tournament', title: 'Tournament Error!'});
	  }
    }
  }

  const newTournament = new GameController();
  newTournament.initializeTournament();
}

// call checkScreenSize function when the window is resized
window.addEventListener("resize", () => checkScreenSize(new Game()));