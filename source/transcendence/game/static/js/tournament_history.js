// //This is a page to display previous tournament results
// [
//   {
//     player1: "dqwed",
//     player1Score: 1,
//     player2: "Tofara",
//     player2Score: 0,
//     winner: "dqwed",
//   },
//   {
//     player1: "Mususas",
//     player1Score: 1,
//     player2: "Current Username",
//     player2Score: 0,
//     winner: "Mususas",
//   },
//   {
//     player1: "dqwed",
//     player1Score: 1,
//     player2: "Mususas",
//     player2Score: 0,
//     winner: "dqwed",
//   },
// ],
//   [
//     {
//       player1: "KDot",
//       player1Score: 1,
//       player2: "Haben",
//       player2Score: 0,
//       winner: "KDot",
//     },
//     {
//       player1: "Zenny",
//       player1Score: 1,
//       player2: "Nicole",
//       player2Score: 0,
//       winner: "Zenny",
//     },
//     {
//       player1: "Current Username",
//       player1Score: 1,
//       player2: "Abel",
//       player2Score: 0,
//       winner: "Current Username",
//     },
//     {
//       player1: "Tofara",
//       player1Score: 1,
//       player2: "Dave",
//       player2Score: 0,
//       winner: "Tofara",
//     },
//     {
//       player1: "KDot",
//       player1Score: 1,
//       player2: "Zenny",
//       player2Score: 0,
//       winner: "KDot",
//     },
//     {
//       player1: "Current Username",
//       player1Score: 0,
//       player2: "Tofara",
//       player2Score: 1,
//       winner: "Tofara",
//     },
//     {
//       player1: "KDot",
//       player1Score: 1,
//       player2: "Tofara",
//       player2Score: 0,
//       winner: "KDot",
//     },
//   ];

// Update all game cards using a loop
function updateAllGameCards(tournamentHistory) {
  for (let i = 0; i < tournamentHistory.length; i++) {
    const gameNumber = i + 1;
    const gameCard = document.querySelector(`.game${gameNumber}`);
    const matchData = tournamentHistory[i];

	if (!gameCard || !matchData) return;

	// Update player names
	const spans = gameCard.querySelectorAll(".team span");
	if (spans.length >= 2) {
	  if (spans[0]) spans[0].textContent = matchData.player1;
	  if (spans[1]) spans[1].textContent = matchData.player2;
	}
  
	// Update scores
	const scores = gameCard.querySelectorAll(".score-value");
	if (scores.length >= 2) {
	  if (scores[0]) scores[0].textContent = matchData.player1Score;
	  if (scores[1]) scores[1].textContent = matchData.player2Score;
	}
  
	// Highlight the winner
	const teams = gameCard.querySelectorAll(".team");
  
	// Remove existing "winner" class from all teams
	for (const team of teams) {
	  team.classList.remove("winner");
	}
	// Find and highlight the winner
	for (let i = 0; i < spans.length; i++) {
	  if (spans[i].textContent === matchData.winner) {
		if(spans[i].closest(".team"))
		spans[i].closest(".team").classList.add("winner");
		break; // Exit loop after finding the winner
	  }
	}
  }
}
function addWinnerHighlightStyles() {
  if (document.getElementById("tournament-styles")) return;

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

// Main function
function updateTournamentMap(tournamentHistory) {
  addWinnerHighlightStyles();
  updateAllGameCards(tournamentHistory);
}

// Example usage:
// const tournamentHistory = [
//   { player1: 'KDot', player2: 'Haben', player1Score: 1, player2Score: 0, winner: 'KDot' },
//   { player1: 'Zenny', player2: 'Nicole', player1Score: 2, player2Score: 1, winner: 'Zenny' },
//   ...
// ];
// updateTournamentMap(tournamentHistory);
