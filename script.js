const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game Objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const gameWidth = canvas.width;
const gameHeight = canvas.height;

// Paddle objects
const playerPaddle = {
    x: 10,
    y: gameHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computerPaddle = {
    x: gameWidth - paddleWidth - 10,
    y: gameHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Ball object
const ball = {
    x: gameWidth / 2,
    y: gameHeight / 2,
    dx: 5,
    dy: 5,
    radius: ballSize,
    speed: 5,
    maxSpeed: 8
};

// Score
let playerScore = 0;
let computerScore = 0;
let gameRunning = false;

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
        updateGameStatus();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement for player paddle
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Smoothly move paddle to mouse position
    const paddleCenter = playerPaddle.y + playerPaddle.height / 2;
    if (mouseY < paddleCenter - 10) {
        playerPaddle.dy = -playerPaddle.speed;
    } else if (mouseY > paddleCenter + 10) {
        playerPaddle.dy = playerPaddle.speed;
    } else {
        playerPaddle.dy = 0;
    }
});

// Update game status display
function updateGameStatus() {
    const statusEl = document.getElementById('gameStatus');
    statusEl.textContent = gameRunning ? 'Game Running...' : 'Press SPACE to start';
}

// Update paddle position
function updatePaddle(paddle) {
    // Handle arrow key input for player paddle
    if (paddle === playerPaddle) {
        if (keys['ArrowUp']) {
            paddle.dy = -paddle.speed;
        } else if (keys['ArrowDown']) {
            paddle.dy = paddle.speed;
        }
    }

    // Update position
    paddle.y += paddle.dy;

    // Wall collision for paddles
    if (paddle.y < 0) {
        paddle.y = 0;
    }
    if (paddle.y + paddle.height > gameHeight) {
        paddle.y = gameHeight - paddle.height;
    }
}

// Update ball position
function updateBall() {
    if (!gameRunning) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > gameHeight) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(gameHeight - ball.radius, ball.y));
    }

    // Left and right wall collision (reset ball)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
    } else if (ball.x + ball.radius > gameWidth) {
        playerScore++;
        resetBall();
    }

    // Paddle collision - Player paddle
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        ball.dy = (collidePoint / (playerPaddle.height / 2)) * ball.maxSpeed;
        
        // Increase ball speed slightly
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.05;
        }
    }

    // Paddle collision - Computer paddle
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        ball.dy = (collidePoint / (computerPaddle.height / 2)) * ball.maxSpeed;
        
        // Increase ball speed slightly
        if (Math.abs(ball.dx) < ball.maxSpeed) {
            ball.dx *= 1.05;
        }
    }
}

// Reset ball to center
function resetBall() {
    ball.x = gameWidth / 2;
    ball.y = gameHeight / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.dy = (Math.random() * 4 - 2);
    updateScore();
}

// Computer AI
function updateComputerAI() {
    if (!gameRunning) {
        computerPaddle.dy = 0;
        return;
    }

    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballY = ball.y;

    // Simple AI: track the ball with slight delay for difficulty
    const difficulty = 0.8; // 0 = easy, 1 = hard
    const threshold = paddleHeight / 3;

    if (ballY < computerCenter - threshold) {
        computerPaddle.dy = -computerPaddle.speed * difficulty;
    } else if (ballY > computerCenter + threshold) {
        computerPaddle.dy = computerPaddle.speed * difficulty;
    } else {
        computerPaddle.dy = 0;
    }
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowBlur = 0;
}

function drawBall() {
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(gameWidth / 2, 0);
    ctx.lineTo(gameWidth / 2, gameHeight);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // Draw game elements
    drawCenterLine();
    drawPaddle(playerPaddle);
    drawPaddle(computerPaddle);
    drawBall();
}

// Main game loop
function gameLoop() {
    updatePaddle(playerPaddle);
    updatePaddle(computerPaddle);
    updateComputerAI();
    updateBall();
    draw();

    requestAnimationFrame(gameLoop);
}

// Start the game
updateGameStatus();
gameLoop();
