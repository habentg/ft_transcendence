function createPingPongTournament(players) {
    const matchHistory = [];
    let tournamentStage = players.length === 16 ? 'sides' : 
                           players.length === 8 ? 'quarterFinals' : 
                           players.length === 4 ? 'semiFinals' : null;

    function playMatch(player1, player2) {
		//this is the function for starting a match
		//here we announce the next match and who is supposed to play
		//here we initiate the game and we need to return to this context
		//Also great if we have a context thing to check
        const match = { player1, player2, winner: player1 }; //need to add the score we get from the match
        matchHistory.push(match); //then return the player history
        return match.winner;
    }

    function runTournament() {
        let currentPlayers = [...players];

        // Sides stage for 16 players
        if (tournamentStage === 'sides') {
            const sideWinners = [];
            for (let i = 0; i < currentPlayers.length; i += 2) {
                sideWinners.push(playMatch(currentPlayers[i], currentPlayers[i + 1]));
            }
            currentPlayers = sideWinners;
        }

        // Quarter Finals stage
        if (tournamentStage === 'sides' || tournamentStage === 'quarterFinals') {
            const quarterFinalWinners = [];
            for (let i = 0; i < currentPlayers.length; i += 2) {
                quarterFinalWinners.push(playMatch(currentPlayers[i], currentPlayers[i + 1]));
            }
            currentPlayers = quarterFinalWinners;
        }

        // Semi Finals
        const semiFinalWinners = [];
        for (let i = 0; i < currentPlayers.length; i += 2) {
            semiFinalWinners.push(playMatch(currentPlayers[i], currentPlayers[i + 1]));
        }

        // Final
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

// Example usage
function main() {
    const scenarios = [
        { players: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2', 'G1', 'G2', 'H1', 'H2'], name: '16 Players' },
        { players: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'], name: '8 Players' },
        { players: ['A1', 'A2', 'B1', 'B2'], name: '4 Players' }
    ];

    scenarios.forEach(scenario => {
        console.log(`\n${scenario.name} Tournament:`);
        const tournament = createPingPongTournament(scenario.players);
        const champion = tournament.runTournament();
        console.log('Champion:', champion);
        console.log('Match History:', tournament.getMatchHistory());
    });
}

// Uncomment to run
// main();