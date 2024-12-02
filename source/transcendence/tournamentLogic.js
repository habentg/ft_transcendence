class PingPongTournament {
    constructor(players) {
        this.players = players;
        this.matchHistory = [];
        this.tournamentBracket = {
            sideA: [],
            sideB: [],
            semiFinals: [],
            final: null,
            champion: null
        };
    }

    setupBracket() {
        // Split 8 players into two sides
        this.tournamentBracket.sideA = [
            { player1: this.players[0], player2: this.players[1], winner: null },
            { player1: this.players[2], player2: this.players[3], winner: null }
        ];
        this.tournamentBracket.sideB = [
            { player1: this.players[4], player2: this.players[5], winner: null },
            { player1: this.players[6], player2: this.players[7], winner: null }
        ];
    }

    playMatches(matches) {
        return matches.map(match => {
            const winner = Math.random() > 0.5 ? match.player1 : match.player2;
            match.winner = winner;
            this.matchHistory.push(match);
            return match;
        });
    }

    runTournament() {
        this.setupBracket();

        // Quarter Finals (Side A)
        const sideAWinners = this.playMatches(this.tournamentBracket.sideA);
        
        // Quarter Finals (Side B)
        const sideBWinners = this.playMatches(this.tournamentBracket.sideB);

        // Semi-Finals
        this.tournamentBracket.semiFinals = [
            { 
                player1: sideAWinners[0].winner, 
                player2: sideAWinners[1].winner, 
                winner: null 
            },
            { 
                player1: sideBWinners[0].winner, 
                player2: sideBWinners[1].winner, 
                winner: null 
            }
        ];

        // Semi-Finals Matches
        const semiFinalWinners = this.playMatches(this.tournamentBracket.semiFinals);

        // Final
        this.tournamentBracket.final = {
            player1: semiFinalWinners[0].winner,
            player2: semiFinalWinners[1].winner,
            winner: null
        };

        // Final Match
        const finalMatch = this.playMatches([this.tournamentBracket.final])[0];
        this.tournamentBracket.champion = finalMatch.winner;

        return this.tournamentBracket.champion;
    }

    getMatchHistory() {
        return this.matchHistory;
    }
}

// Example usage
const players = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Henry'];
const tournament = new PingPongKnockoutTournament(players);
const champion = tournament.runTournament();
console.log('Tournament Champion:', champion.name);
console.log('Match History:', tournament.getMatchHistory());