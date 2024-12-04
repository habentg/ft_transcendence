// look for last ball position every one second. >>trans rules.

//ai view
let lastballPosition = {x: ball.X, y: ball.Y};

function startaiGame() {
    aiFlag = true; // Enable AI
    player1Score = 0;
    player2Score = 0;
    drawFlag = true;
    requestAnimationFrame(draw);
    document.getElementById("startButton").disabled = true;
    document.getElementById("aiButton").disabled = true;
}

function aiLogic() {
    const targetY = ball.y - player2.height / 2; // Aim to center the paddle on the ball
    const tolerance = 5; // Allow a small margin of error

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