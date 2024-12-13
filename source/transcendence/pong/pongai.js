// look for last ball position every one second. >>trans rules.

//ai view
let lastballPosition = {x: 0, y: 0};

function startaiGame() {
    aiFlag = true; // Enable AI
    player1Score = 0;
    player2Score = 0;
    drawFlag = true;
    setInterval(aiView, 50);
    setInterval(aiLogic, 50);
    requestAnimationFrame(draw);
    document.getElementById("startButton").disabled = true;
    document.getElementById("aiButton").disabled = true;
}

function aiLogic() {
    const tolerance = 5; // Allow a small margin of error
    const currentBallY = ball.y; // Current ball Y position
    const previousBallY = lastballPosition.y; // Last recorded ball Y position
    const direction = currentBallY - previousBallY; // Determine ball movement direction

    // Calculate predicted target position based on the direction and speed of the ball
    const targetY = currentBallY + direction - player2.height / 2;

    if (targetY > player2.y - 40 && targetY < player2.y + 40)
        return ;
    if (player2.y + tolerance < targetY) {
        aikeyEvents('down');
    } else if (player2.y - tolerance > targetY) {
        aikeyEvents('up');
    } else {
        aikeyEvents('stop');
    }
}



function aikeyEvents(moveDirection) {
    let event;

    // Simulate 'keydown' for up or down based on moveDirection
    if (moveDirection === 'up') {
        event = new KeyboardEvent('keydown', {
            key: 'ArrowUp',
            code: 'ArrowUp',
            keyCode: 38, // Deprecated but still included for backward compatibility
            bubbles: true,
            cancelable: true
        });
    } else if (moveDirection === 'down') {
        event = new KeyboardEvent('keydown', {
            key: 'ArrowDown',
            code: 'ArrowDown',
            keyCode: 40,
            bubbles: true,
            cancelable: true
        });
    } else if (moveDirection === 'stop') {
        // Simulate 'keyup' for stopping movement
        event = new KeyboardEvent('keyup', {
            key: 'ArrowUp',
            code: 'ArrowUp',
            keyCode: 38,
            bubbles: true,
            cancelable: true
        });
    }

    // Dispatch the event
    if (event) document.dispatchEvent(event);
}

// function to check/store balls last position every 1 second.
function aiView() {
    if (aiFlag) {
        lastballPosition.x = ball.x;
        lastballPosition.y = ball.y;
    }
}