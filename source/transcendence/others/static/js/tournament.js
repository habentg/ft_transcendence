{
  //THIS IS THE GAME LOGIC
  let matchCount = 0; //playmatch -- add to runtournament function
  let matchHistory = []; //related to tournament function

  let tournamentElement; //used in tournament function and playmatch
  let maxPlayerNumbers = 0;
  let playersNames = ["Tofara Mususa"]; //used in fillplayernames(which is used in run tournament), then handlePlayerInput,
  // add players addToList function uses playerNames

  //Changes canvas board size and sets up key events
  function initializeGame() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    document.addEventListener("keydown", move);
    document.addEventListener("keyup", stopMovement);
  }

  //this is the function that starts the game by calling draw function and displays names at the top of the canvas
  function startGame(player1, player2) {
    drawFlag = true;
    document.getElementById("player1Name").textContent =
      "@ " + player1.playerName;
    document.getElementById("player1Name").style.display = "block";
    document.getElementById("player2Name").textContent =
      "@ " + player2.playerName;
    document.getElementById("player2Name").style.display = "block";
    document.getElementById("player1").classList.remove("d-none");
    document.getElementById("player2").classList.remove("d-none");
    requestAnimationFrame(() => draw(player1, player2));
  }

  //This modifies the map to match for only FOUR Players. Mostly CSS
  function prepTournament4() {
    var game3 = document.getElementsByClassName("game3");
    var game4 = document.getElementsByClassName("game4");
    var game6 = document.getElementsByClassName("game6");
    var game7 = document.getElementsByClassName("game7");

    for (var i = 0; i < game3.length; i++) {
      game3[i].style.display = "none";
    }
    for (var i = 0; i < game4.length; i++) {
      game4[i].style.display = "none";
    }
    for (var i = 0; i < game6.length; i++) {
      game6[i].style.display = "none";
    }
    for (var i = 0; i < game7.length; i++) {
      game7[i].style.display = "none";
    }

    // Also delete pseudo elements that start from game 5. class .connection-5-7
    var connection57 = document.getElementsByClassName("connection-5-7");
    for (var i = 0; i < connection57.length; i++) {
      connection57[i].style.display = "none";
    }

    // Adjust the position of the game 5
    var game5 = document.getElementsByClassName("game5");
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
    var connection15 = document.getElementsByClassName("connection-1-5");
    for (var i = 0; i < connection15.length; i++) {
      connection15[i].style.width = "80px";
    }

    // make the connection between game 2 and game 5 width to 80px
    var connection25 = document.getElementsByClassName("connection-2-5");
    for (var i = 0; i < connection25.length; i++) {
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

  //this our way of stopping the code flow. We wait for the button to clicked before going to the next section
  function mapContinueButton(buttonClass) {
    return new Promise((resolve, reject) => {
      const continueButton = document.querySelector(buttonClass);
      if (!continueButton) {
        reject("Not working");
        console.error("Continue button not found in the DOM.");
        return; // Exit the function early to prevent further execution
      }
      const handleClick = () => {
        continueButton.removeEventListener("click", handleClick);
        resolve();
      };
      continueButton.addEventListener("click", handleClick);
    });
  }

  //this is to remove a modal. Takes in the modalId which is id of modal html
  function closeModal(modalId) {
    console.log("closing modal");
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.hide;
      modal.remove(); // Remove the modal from the DOM
      document.body.classList.remove("modal-open"); // Remove the modal-open class from body
    } else {
      console.warn(`Modal with id "${modalId}" not found.`);
    }
  }

  //This is put the playernames in the tournament map
  function fillPlayerNames(tournamentMap) {
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

  // This is to check is number of players is 4 or 8 and if not give an error
  function validatePlayerNumber() {
    const playersNumberInput = document.getElementById("playersNumber");
    const errorMsgDiv = document.getElementById("local-game-error-msg");
    const maxPlayers = playersNumberInput.value;

    if (maxPlayers === "") return false;
    if (maxPlayers != 4 && maxPlayers != 8) {
      errorMsgDiv.textContent = "Please enter either 4 or 8";
      errorMsgDiv.style.display = "block";
      return false;
    } else {
      errorMsgDiv.style.display = "none";
      return true;
    }
  }

  //this returns the html for the playercontainer elements
  function getPlayerUiElements() {
    return {
      playerInput: document.getElementById("playerInput"),
      playerIcon: document.getElementById("playerIcon"),
      playerContainer: document.getElementById("playerContainer"),
      initTournamentButton: document.getElementById("initTournamentButton"),
    };
  }

  //checks the player name input is correct if so then add to the player list.
  function handlePlayerInput(playerInput, playerContainer, maxPlayerNumbers) {
    const playerName = playerInput.value.trim();
    const errorMsgDiv = document.getElementById("player-name-error-msg");

    // Remove any existing error message when input changes
    errorMsgDiv.textContent = "";
    errorMsgDiv.style.display = "none";
    // Validation checks
    if (!playerName) {
      return;
    }
    // Check if max players reached
    if (playersNames.length == maxPlayerNumbers) {
      errorMsgDiv.textContent = "Max Players reached";
      errorMsgDiv.style.display = "block";
      return;
    }

    // Check if name contains only letters
    const letterRegex = /^[A-Za-z]+$/;
    if (!letterRegex.test(playerName)) {
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
    if (playersNames.includes(playerName)) {
      errorMsgDiv.textContent = "Player name is taken!";
      errorMsgDiv.style.display = "block";
      return;
    }

    // If all validations pass, add player and clear input
    addPlayerToList(playerName, playerContainer);
    playerInput.value = "";
  }

  //creates the player container and elements and adds it to the list
  function addPlayerToList(playerName, playerContainer) {
    if (playersNames.includes(playerName)) {
      return;
    }
    playersNames.push(playerName);
    const playerButton = createPlayerButtonWithRemoveOption(playerName);
    playerContainer.appendChild(playerButton);
  }

  //creates the player button div returns it. Takes the name and returns html code
  function createPlayerButtonWithRemoveOption(playerName) {
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
	const deleteIcon = createRemovePlayerIcon(playerName);
  
	// Append the name container and delete icon to the player button
	playerButton.appendChild(nameContainer);
	playerButton.appendChild(deleteIcon);
  
	return playerButton;
  }
  
  function createRemovePlayerIcon(playerName) {
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
	  const index = playersNames.indexOf(playerName);
	  if (index > -1) {
		playersNames.splice(index, 1); // Remove the player from the list
	  }
  
	  // Remove the button from the DOM
	  deleteIcon.parentElement.remove();
	});
  
	return deleteIcon;
  }
  

  //Creates the first default player that is added to the start of the list that should always be added
  function createDefaultPlayer(playerContainer) {
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
  function setUpPlayerAddition(maxPlayerNumbers) {
    maxPlayerNumbers = maxPlayerNumbers === 0 ? 4 : maxPlayerNumbers;

    const uiElements = getPlayerUiElements();
    createDefaultPlayer(uiElements.playerContainer);

    uiElements.playerIcon.addEventListener("click", () => {
      handlePlayerInput(
        uiElements.playerInput,
        uiElements.playerContainer,
        maxPlayerNumbers
      );
    });

    uiElements.playerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        handlePlayerInput(
          uiElements.playerInput,
          uiElements.playerContainer,
          maxPlayerNumbers
        );
      }
    });
    uiElements.initTournamentButton.addEventListener("click", async () => {
      await startTournament(maxPlayerNumbers);
    });
  }

  //This is the main part where we create tournament map and run the tournament
  async function startTournament(maxPlayerNumbers) {
    if (playersNames.length !== parseInt(maxPlayerNumbers)) {
      const errorMsgDiv = document.getElementById("player-name-error-msg");
      errorMsgDiv.textContent = "Players do not match total number of players";
      errorMsgDiv.style.display = "block";
      return;
    }

    document.querySelector(".playerListContainer").remove();
    try {
      const champion = await runTournament();
      console.log("Champion:", champion);
      console.log("Match History:", getMatchHistory());
    } catch (error) {
      console.error("Tournament error:", error);
    }
  }

  // Initializes a tournament setup modal that prompts for the number of players, validates input, and triggers player addition setup when closed
  function onLoadTournament() {
    const existingModal = document.getElementById("tournamentModal");
    if (existingModal) {
      existingModal.remove();
    }

    const modal = getPlayerNumberModal(); //put player number modal
    document.body.appendChild(modal); //add it to the page

    const playersNumberInput = document.getElementById("playersNumber"); //get players number div container
    const submitPlayerNumBtn = document.getElementById("submitPlayerNumBtn"); //get submit player button

    // Add input event listener for real-time validation
    playersNumberInput.addEventListener("input", validatePlayerNumber); //when number is inputted check if its correct

    // Modify existing submit button event listener
    submitPlayerNumBtn.addEventListener("click", () => {
      if (!validatePlayerNumber()) {
        return;
      }

      maxPlayerNumbers = playersNumberInput.value;
      console.log("Creating tournament with ", maxPlayerNumbers, " players");
      closeModal("tournamentModal"); //close the tournament modal
      setUpPlayerAddition(maxPlayerNumbers);
    });
    // close the modal when the close button is clicked
    document
      .querySelector("#tournamentModal .btn-close")
      .addEventListener("click", () => {
        maxPlayerNumbers = playersNumberInput.value;
        console.log("Creating tournament with ", maxPlayerNumbers, " players");
        closeModal("tournamentModal");
        setUpPlayerAddition(maxPlayerNumbers);
      });

    // close the modal when the modal is clicked outside
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        maxPlayerNumbers = playersNumberInput.value;
        console.log("Creating tournament with ", maxPlayerNumbers, " players");
        closeModal("tournamentModal");
        setUpPlayerAddition(maxPlayerNumbers);
      }
    });

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

  onLoadTournament();

  //this function is used to update tournament after every game is run
  function updateTournamentMap(match) {
    matchCount += 1;

    if (playersNames.length == 4 && matchCount == 3) {
      matchCount = 5;
    }

    const gameToUpdate = tournamentElement.querySelector(`#game${matchCount}`);
    // Determine which game to update based on matchCount

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
      routeWinnerToNextRound(matchCount, match.winner);
    }
  }

  //updates the tournament map with the name of the player to play in the next match
  function routeWinnerToNextRound(currentGameNumber, winner) {
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
      const nextGameElement = tournamentElement.querySelector(
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

  // Initiates and manages a game match between two players, handles game setup, tracks scoring, and returns a promise that resolves with the winner's name when the game ends
  async function playMatch(player1Name, player2Name) {
    tournamentDiv = document.querySelector("#tournamentWrapper");
    tournamentDiv.remove();
    nextMatchModal(player1Name, player2Name);
    await waitForModal("nextMatch");
    console.log(`The two playing this game ${player1Name} vs. ${player2Name}`);
    const pageContainer = document.getElementById("background");
    const game = gameCanvas();
    pageContainer.appendChild(game);

    return new Promise((resolve, reject) => {
      try {
        // Reset game state completely
        drawFlag = true;
        let player1Obj = new Player(player1Name, "left");
        let player2Obj = new Player(player2Name, "right");

        const gameboard = document.getElementById("tableBoard");
        const canvas = document.getElementById("board");
        gameboard.style.visibility = "visible";
        canvas.style.visibility = "visible";

        initializeGame();
        startGame(player1Obj, player2Obj);

        const checkGameStatus = () => {
          if (!drawFlag) {
            const match = {
              player1: player1Obj.playerName,
              player1Score: player1Obj.finalScore,
              player2: player2Obj.playerName,
              player2Score: player2Obj.finalScore,
              winner:
                player1Obj.finalScore >= maxScore
                  ? player1Obj.playerName
                  : player2Obj.playerName,
            };
            matchHistory.push(match);
            updateTournamentMap(match);
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

  // Shuffles an array of players using the Fisher-Yates algorithm, returning a new randomized array while preserving the original
  function randomisePlayers(array) {
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

  // Returns a promise that resolves when a modal is closed, with a 10-second timeout safeguard to automatically close lingering modals
  function waitForModal(modalId) {
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
          resolve();
        } else if (elapsedTime >= timeout) {
          // If time exceeds 10 seconds, close the modal
          console.warn("Modal exists for too long. Closing modal...");
          clearInterval(checker);
          modal.hide;
          closeModal(modalId);
          resolve();
        } else {
          console.log(
            "Modal is still open or body class remains. Continue checking..."
          );
          elapsedTime += interval;
        }
      }, interval);
    });
  }

  // Orchestrates a complete tournament for 4 or 8 players, managing quarter-finals, semi-finals, and finals matches sequentially, returning the tournament champion
  async function runTournament() {
    playersNames = randomisePlayers(playersNames);
    let currentPlayers = [...playersNames];
    const tournamentContainer = document.getElementById("background");
    tournamentElement = fillPlayerNames(createTournamentMap());
    tournamentContainer.appendChild(tournamentElement);
    if (playersNames.length == 4) {
      prepTournament4();
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
        await mapContinueButton(".continueButton");
        const winner = await playMatch(
          currentPlayers[i],
          currentPlayers[i + 1]
        );
        gameWinnerModal(winner);
        await waitForModal("gameClosing");
        quarterFinalWinners.push(winner);
        tournamentContainer.appendChild(tournamentElement);
      }
      currentPlayers = quarterFinalWinners;
    }

    // Semi Finals
    const semiFinalWinners = [];
    //need to add a div saying this semifinals
    for (let i = 0; i < currentPlayers.length; i += 2) {
      await mapContinueButton(".continueButton");
      const winner = await playMatch(currentPlayers[i], currentPlayers[i + 1]);
      semiFinalWinners.push(winner);
      gameWinnerModal(winner);
      await waitForModal("gameClosing");
      tournamentContainer.appendChild(tournamentElement);
    }

    await mapContinueButton(".continueButton");
    const champion = await playMatch(semiFinalWinners[0], semiFinalWinners[1]);
    const runnerUp =
      champion === semiFinalWinners[0]
        ? semiFinalWinners[1]
        : semiFinalWinners[0];
    tournamentClosingModal(champion, runnerUp);
    await waitForModal("congratsModal");
    tournamentContainer.appendChild(tournamentElement);
    return champion;
  }

  function getMatchHistory() {
    return matchHistory;
  }
}
