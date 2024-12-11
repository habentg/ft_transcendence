

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
		const friendBoard = document.getElementById('friendBoard');
		friendBoard.remove();        
		console.log(`\n${scenario.name} Tournament:`);
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
    
	// this is the part l need to add the game playing
    function playMatch(player1, player2) {
		//make canvas visible and start game
		const gameBoard = getElementById('canvasBoard')
		gameBoard.style.visibility = 'visible';

		// Start the game
		drawFlag = true;
		requestAnimationFrame(draw);

        const match = { 
            player1, 
            player2, 
            winner: player1, // This needs to be replaced with actual match result
            score: null // Add score tracking
        };
		gameBoard.style.visibility = 'hidden';
        matchHistory.push(match);
        return match.winner;
    }

    function runTournament() {
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
                roundOf16Winners.push(playMatch(currentPlayers[i], currentPlayers[i + 1]));
            }
            currentPlayers = roundOf16Winners;
        }

        // Quarter Finals (if applicable)
        if (currentPlayers.length === 8) {
			//need to add a div saying that we are the quarter finals
            const quarterFinalWinners = [];
            for (let i = 0; i < currentPlayers.length; i += 2) {
                quarterFinalWinners.push(playMatch(currentPlayers[i], currentPlayers[i + 1]));
            }
            currentPlayers = quarterFinalWinners;
        }

        // Semi Finals
        const semiFinalWinners = [];
		//need to add a div saying this semifinals
        for (let i = 0; i < currentPlayers.length; i += 2) {
            semiFinalWinners.push(playMatch(currentPlayers[i], currentPlayers[i + 1]));
        }

        // Final
		// add the finals div here saying there are the players playing
        const champion = playMatch(semiFinalWinners[0], semiFinalWinners[1]);

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
