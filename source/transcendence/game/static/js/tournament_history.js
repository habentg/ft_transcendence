//This is a page to display previous tournament results

// make use of tournament map

[
  {
    player1: "dqwed",
    player1Score: 1,
    player2: "Tofara",
    player2Score: 0,
    winner: "dqwed",
  },
  {
    player1: "Mususas",
    player1Score: 1,
    player2: "Current Username",
    player2Score: 0,
    winner: "Mususas",
  },
  {
    player1: "dqwed",
    player1Score: 1,
    player2: "Mususas",
    player2Score: 0,
    winner: "dqwed",
  },
],
  [
    {
      player1: "KDot",
      player1Score: 1,
      player2: "Haben",
      player2Score: 0,
      winner: "KDot",
    },
    {
      player1: "Zenny",
      player1Score: 1,
      player2: "Nicole",
      player2Score: 0,
      winner: "Zenny",
    },
    {
      player1: "Current Username",
      player1Score: 1,
      player2: "Abel",
      player2Score: 0,
      winner: "Current Username",
    },
    {
      player1: "Tofara",
      player1Score: 1,
      player2: "Dave",
      player2Score: 0,
      winner: "Tofara",
    },
    {
      player1: "KDot",
      player1Score: 1,
      player2: "Zenny",
      player2Score: 0,
      winner: "KDot",
    },
    {
      player1: "Current Username",
      player1Score: 0,
      player2: "Tofara",
      player2Score: 1,
      winner: "Tofara",
    },
    {
      player1: "KDot",
      player1Score: 1,
      player2: "Tofara",
      player2Score: 0,
      winner: "KDot",
    },
  ];

function updateGameCard(gameNumber, matchData) {
  if (!matchData) return;

  const gameCard = document.querySelector(`.game${gameNumber}`);
  if (!gameCard) return;

  // Update player names
  const spans = gameCard.querySelectorAll(".team span");
  spans[0].textContent = matchData.player1;
  spans[1].textContent = matchData.player2;

  // Update scores
  const scores = gameCard.querySelectorAll(".score-value");
  scores[0].textContent = matchData.player1Score;
  scores[1].textContent = matchData.player2Score;

  // Add winner highlight
  const teams = gameCard.querySelectorAll(".team");
  teams.forEach((team) => team.classList.remove("winner"));
  const winnerSpan = Array.from(spans).find(
    (span) => span.textContent === matchData.winner
  );
  if (winnerSpan) {
    winnerSpan.parentElement.classList.add("winner");
  }
}

function updateTournamentMap(tournamentHistory) {
  // Helper function to update a game card
  // Update all games (rounds 1-3)
  for (let i = 0; i < tournamentHistory.length; i++) {
    updateGameCard(i + 1, tournamentHistory[i]);
  }

  // Add CSS for winner highlighting
  if (!document.getElementById("tournament-styles")) {
    const styleSheet = document.createElement("style");
    styleSheet.id = "tournament-styles";
    styleSheet.textContent = `
		.team.winner {
		  font-weight: bold;
		  color: #28a745;
		}
		.team.winner .profileIcon {
		  color: #28a745;
		}
		.card {
		  border: 1px solid #dee2e6;
		  border-radius: 0.25rem;
		  margin-bottom: 1rem;
		}
		.card-body-custom {
		  padding: 1rem;
		}
		.connection-line {
		  position: absolute;
		  border-right: 2px solid #dee2e6;
		  height: 20px;
		  right: -30px;
		  width: 30px;
		}
	  `;
    document.head.appendChild(styleSheet);
  }
}

// Example usage:
// const tournamentMap = createTournamentMap();
// document.body.appendChild(tournamentMap);
// updateTournamentMap(tournamentHistory);
