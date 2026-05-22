$(document).ready(function () {
  // ==========================================
// --- AUTOMATIC BACKGROUND AUDIO ENGINE ---
// ==========================================
function initiateBackgroundMusic() {
  let audio = $("#bgmusic")[0];
  
  if (audio) {
    // Attempt to play the audio file
    audio.play().then(() => {
      console.log("Audio playing successfully!");
      // Once playing, remove the click listeners so we don't restart it accidentally
      $(document).off("click keydown", initiateBackgroundMusic);
    }).catch((error) => {
      // Browser blocked it; waiting for a direct user interaction event instead
      console.log("Autoplay blocked by browser. Waiting for user interaction...");
    });
  }
}

// Trigger audio check immediately on page load, 
// and attach fallback listeners to catch the user's first click or keystroke
initiateBackgroundMusic();
$(document).on("click keydown", initiateBackgroundMusic);

  // --- UI MENU NAVIGATION ---
  /////
  // SETTINGS
  // when settings clicked settings will pop up
  ////
  $("#settings-btn").on("click", function () {
    $("#menu").fadeOut(600, function () {
      $("#settings").fadeIn();
    });
  });

  // Dynamic Volume Slider Control
$("#music-vol").on("input change", function () {
  let audio = $("#bgmusic")[0];
  if (audio) {
    // Input ranges go from 0 to 100, HTML5 Audio volume scales from 0.0 to 1.0
    audio.volume = this.value / 100;
    
    // If user turns volume up while muted, un-mute visually
    if (audio.volume > 0 && audio.muted) {
      audio.muted = false;
      $("#music-btn").attr("src", "assets/GUI/buttons/unmute.png");
    }
  }
});

// Update your existing music-btn click selector to sync correctly
$("#music-btn").on("click", function () {
  let audio = $("#bgmusic")[0];
  if (audio) {
    audio.muted = !audio.muted;
    $(this).attr("src", audio.muted ? "assets/GUI/buttons/mute.png" : "assets/GUI/buttons/unmute.png");
  }
});

  // returning to main menu
  $("#return-btn").on("click", function () {
    $("#settings").fadeOut(600, function () {
      $("#menu").fadeIn();
    });
  });

  /////
  // LEADERBOARD
  /////
  $("#leaderboard-btn").on("click", function () {
    $("#menu").fadeOut(600, function () {
      $("#leaderboard").fadeIn();
    });
  });

  // returning to menu
  $("#return-btn-leaderboard").on("click", function () {
    $("#leaderboard").fadeOut(600, function () {
      $("#menu").fadeIn();
    });
  });

  /////
  // SHOP
  ////
  $("#shop-btn").on("click", function () {
    $("#menu").fadeOut(600, function () {
      $("#shop").fadeIn();
    });
  });
  // returning to menu
  $("#return-btn-shop").on("click", function () {
    $("#shop").fadeOut(600, function () {
      $("#menu").fadeIn();
    });
  });

  /////
  // DIFFICULTY MENU
  ////
  $("#start-btn").on("click", function () {
    $("#menu").fadeOut(600, function () {
      $("#difficulty").fadeIn();
    });
  });

  // returning to menu
  $("#return-btn-difficulty").on("click", function () {
    $("#difficulty").fadeOut(600, function () {
      $("#menu").fadeIn();
    });
  });

  // --- GLOBAL ENGINE LIFECYCLE CONTROLS ---
  // Shared game variables to prevent animation frame stacking and leak bugs
  let currentGameAnimationId = null;
  let activeGlobalKeydownHandler = null;
  let activeGlobalKeyupHandler = null;

  function cleanupActiveGameInstance() {
    // Stop running requestAnimationFrame loop
    if (currentGameAnimationId) {
      cancelAnimationFrame(currentGameAnimationId);
      currentGameAnimationId = null;
    }
    // Wipe old event hooks to stop ghost movement triggers
    if (activeGlobalKeydownHandler) {
      $(window).off("keydown", activeGlobalKeydownHandler);
    }
    if (activeGlobalKeyupHandler) {
      $(window).off("keyup", activeGlobalKeyupHandler);
    }
  }

  // ==========================================
  // 1. EASY MODE GENERATOR
  // ==========================================
  $("#easy-btn").on("click", function () {
    cleanupActiveGameInstance();

    $("#difficulty").fadeOut(600, function () {
      $("#gameCanvas").fadeIn();
    });

    const canvas = $("#gameCanvas")[0];
    const ctx = canvas.getContext("2d");
    const GRAVITY = 0.3;
    const AUTO_BOUNCE_FORCE = -9.5;
    const MANUAL_JUMP_FORCE = -13.0;
    const DIVE_SPEED = 7.0;
    const MOVE_SPEED = 6.5;
    const VERTICAL_GAP = 100;
    const playerSprite = new Image();
    playerSprite.src = "path/to/your/player-image.png"; // Replace with your image path

    let player;
    let platforms = [];
    let coins = [];
    let score = 0;
    let gameOver = false;
    let cameraY = 0;
    let highestSpawnedY = 0; // Fixed endless tracker variable

    let keys = { Up: false, Down: false, Left: false, Right: false };

    class Player {
      constructor() {
        this.width = 32;
        this.height = 32;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 150;
        this.vx = 0;
        this.vy = 0;
        this.color = "#ff4757";
        this.canManualJump = true;
      }

      update() {
        this.vy += GRAVITY;
        if (keys.Up && this.canManualJump) {
          this.vy = MANUAL_JUMP_FORCE;
          this.canManualJump = false;
        }
        if (keys.Down) this.vy = DIVE_SPEED;
        if (keys.Left) this.vx = -MOVE_SPEED;
        else if (keys.Right) this.vx = MOVE_SPEED;
        else this.vx = 0;

        this.y += this.vy;
        this.x += this.vx;

        if (this.x < -this.width) this.x = canvas.width;
        if (this.x > canvas.width) this.x = -this.width;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y - cameraY, this.width, this.height);
        ctx.fillStyle = "#ffffff";
        let eyeOffset = this.vx >= 0 ? 18 : 4;
        ctx.fillRect(this.x + eyeOffset, this.y - cameraY + 6, 8, 8);
      }
    }

    class Platform {
      constructor(x, y, width = 160) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 20;
      }

      draw() {
        ctx.fillStyle = "#6d4c41";
        ctx.fillRect(this.x, this.y - cameraY, this.width, this.height);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x, this.y - cameraY, this.width, 6);
      }
    }

    class Coin {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 9;
        this.collected = false;
      }

      draw() {
        if (this.collected) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y - cameraY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd700";
        ctx.fill();
        ctx.strokeStyle = "#e6b800";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }
    }

    function init() {
      player = new Player();
      platforms = [];
      coins = [];
      score = 0;
      cameraY = 0;
      gameOver = false;

      platforms.push(new Platform(0, canvas.height - 40, canvas.width));
      highestSpawnedY = canvas.height - 40;

      for (let i = 0; i < 15; i++) {
        highestSpawnedY -= VERTICAL_GAP;
        spawnLayer(highestSpawnedY);
      }
    }

    function spawnLayer(yPos) {
      let pWidth = 140 + Math.random() * 40;
      let pX = Math.random() * (canvas.width - pWidth);
      platforms.push(new Platform(pX, yPos, pWidth));

      let patternChoice = Math.random();
      if (patternChoice < 0.45) {
        for (let k = 0; k < 3; k++) {
          coins.push(new Coin(pX + (pWidth / 4) * (k + 1), yPos - 25));
        }
      } else if (patternChoice < 0.8) {
        coins.push(new Coin(pX + pWidth / 2, yPos - 25));
        coins.push(new Coin(pX + pWidth / 2, yPos - 55));
        coins.push(new Coin(pX + pWidth / 2, yPos - 85));
      } else {
        coins.push(new Coin(pX + pWidth / 2, yPos - 25));
      }
    }

    activeGlobalKeydownHandler = function (e) {
      if (e.key === "ArrowUp" || e.key === "w") keys.Up = true;
      if (e.key === "ArrowDown" || e.key === "s") keys.Down = true;
      if (e.key === "ArrowLeft" || e.key === "a") keys.Left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.Right = true;
      if (gameOver && e.key === " ") init();
    };

    activeGlobalKeyupHandler = function (e) {
      if (e.key === "ArrowUp" || e.key === "w") {
        keys.Up = false;
        player.canManualJump = true;
      }
      if (e.key === "ArrowDown" || e.key === "s") keys.Down = false;
      if (e.key === "ArrowLeft" || e.key === "a") keys.Left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.Right = false;
    };

    $(window).on("keydown", activeGlobalKeydownHandler);
    $(window).on("keyup", activeGlobalKeyupHandler);

    function processCollisions() {
      if (player.vy > 0) {
        platforms.forEach((p) => {
          if (
            player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height >= p.y &&
            player.y + player.height - player.vy <= p.y + p.height
          ) {
            player.vy = AUTO_BOUNCE_FORCE;
          }
        });
      }

      coins.forEach((coin) => {
        if (!coin.collected) {
          let checkX = Math.max(
            player.x,
            Math.min(coin.x, player.x + player.width)
          );
          let checkY = Math.max(
            player.y,
            Math.min(coin.y, player.y + player.height)
          );
          let deltaX = coin.x - checkX;
          let deltaY = coin.y - checkY;
          if (deltaX * deltaX + deltaY * deltaY < coin.radius * coin.radius) {
            coin.collected = true;
            score += 10;
          }
        }
      });
    }

    function runGameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!gameOver) {
        player.update();
        processCollisions();

        if (player.y < cameraY + canvas.height * 0.4) {
          cameraY = player.y - canvas.height * 0.4;
        }

        // Flawless baseline clearing garbage collectors
        platforms = platforms.filter(
          (p) => p.y < cameraY + canvas.height + 200
        );
        coins = coins.filter((c) => c.y < cameraY + canvas.height + 200);

        // True Endless execution condition tracking camera positions instead of array bounds
        while (highestSpawnedY > cameraY - 200) {
          highestSpawnedY -= VERTICAL_GAP;
          spawnLayer(highestSpawnedY);
        }

        if (player.y > cameraY + canvas.height) {
          gameOver = true;
        }
      }

      platforms.forEach((p) => p.draw());
      coins.forEach((c) => c.draw());
      player.draw();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial";
      ctx.fillText("Score: " + score, 20, 45);
      ctx.font = "14px Arial";
      ctx.fillText("MODE: EASIEST", 20, 70);

      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 34px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 25);
        ctx.font = "18px Arial";
        ctx.fillText(
          "Final Score: " + score,
          canvas.width / 2,
          canvas.height / 2 + 15
        );
        ctx.fillText(
          "Press SPACEBAR to Try Again",
          canvas.width / 2,
          canvas.height / 2 + 55
        );
        ctx.textAlign = "start";
      }

      currentGameAnimationId = requestAnimationFrame(runGameLoop);
    }

    init();
    runGameLoop();
  });

  // ==========================================
  // 2. NORMAL MODE GENERATOR
  // ==========================================
  $("#normal-btn").on("click", function () {
    cleanupActiveGameInstance();

    $("#difficulty").fadeOut(600, function () {
      $("#gameCanvas").fadeIn();
    });

    const canvas = $("#gameCanvas")[0];
    const ctx = canvas.getContext("2d");
    const GRAVITY = 0.38;
    const AUTO_BOUNCE_FORCE = -10.5;
    const MANUAL_JUMP_FORCE = -13.5;
    const DIVE_SPEED = 7.5;
    const MOVE_SPEED = 6.0;
    const VERTICAL_GAP = 125;

    let player;
    let platforms = [];
    let coins = [];
    let mushrooms = [];
    let score = 0;
    let gameOver = false;
    let cameraY = 0;
    let highestSpawnedY = 0; // Fixed endless tracker variable

    let keys = { Up: false, Down: false, Left: false, Right: false };

    class Player {
      constructor() {
        this.width = 32;
        this.height = 32;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 150;
        this.vx = 0;
        this.vy = 0;
        this.color = "#ff4757";
        this.canManualJump = true;
      }

      update() {
        this.vy += GRAVITY;
        if (keys.Up && this.canManualJump) {
          this.vy = MANUAL_JUMP_FORCE;
          this.canManualJump = false;
        }
        if (keys.Down) this.vy = DIVE_SPEED;
        if (keys.Left) this.vx = -MOVE_SPEED;
        else if (keys.Right) this.vx = MOVE_SPEED;
        else this.vx = 0;

        this.y += this.vy;
        this.x += this.vx;

        if (this.x < -this.width) this.x = canvas.width;
        if (this.x > canvas.width) this.x = -this.width;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y - cameraY, this.width, this.height);
        ctx.fillStyle = "#ffffff";
        let eyeOffset = this.vx >= 0 ? 18 : 4;
        ctx.fillRect(this.x + eyeOffset, this.y - cameraY + 6, 8, 8);
      }
    }

    class Platform {
      constructor(x, y, width = 110) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 20;
      }

      draw() {
        ctx.fillStyle = "#6d4c41";
        ctx.fillRect(this.x, this.y - cameraY, this.width, this.height);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x, this.y - cameraY, this.width, 6);
      }
    }

    class Coin {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 9;
        this.collected = false;
      }

      draw() {
        if (this.collected) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y - cameraY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd700";
        ctx.fill();
        ctx.strokeStyle = "#e6b800";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }
    }

    class Mushroom {
      constructor(x, y) {
        this.width = 24;
        this.height = 24;
        this.x = x;
        this.y = y - this.height;
      }

      draw() {
        ctx.fillStyle = "#e0e0e0";
        ctx.fillRect(this.x + 8, this.y - cameraY + 12, 8, 12);
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y - cameraY + 12, 12, Math.PI, 0, false);
        ctx.fillStyle = "#d32f2f";
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x + 6, this.y - cameraY + 4, 3, 3);
        ctx.fillRect(this.x + 14, this.y - cameraY + 3, 3, 3);
        ctx.fillRect(this.x + 11, this.y - cameraY + 8, 3, 3);
      }
    }

    function init() {
      player = new Player();
      platforms = [];
      coins = [];
      mushrooms = [];
      score = 0;
      cameraY = 0;
      gameOver = false;

      platforms.push(new Platform(0, canvas.height - 40, canvas.width));
      highestSpawnedY = canvas.height - 40;

      for (let i = 0; i < 15; i++) {
        highestSpawnedY -= VERTICAL_GAP;
        spawnLayer(highestSpawnedY);
      }
    }

    function spawnLayer(yPos) {
      let pWidth = 100 + Math.random() * 30;
      let pX = Math.random() * (canvas.width - pWidth);
      platforms.push(new Platform(pX, yPos, pWidth));

      if (Math.random() < 0.4) {
        let mushX = pX + Math.random() * (pWidth - 24);
        mushrooms.push(new Mushroom(mushX, yPos));
      }

      let patternChoice = Math.random();
      if (patternChoice < 0.35) {
        coins.push(new Coin(pX + 10, yPos - 50));
        coins.push(new Coin(pX + 35, yPos - 75));
        coins.push(new Coin(pX + 60, yPos - 50));
        coins.push(new Coin(pX + 85, yPos - 25));
      } else if (patternChoice < 0.7) {
        for (let k = 0; k < 3; k++) {
          coins.push(new Coin(pX + pWidth / 2, yPos - 25 - k * 25));
        }
      } else {
        coins.push(new Coin(pX + pWidth / 2, yPos - 25));
      }
    }

    activeGlobalKeydownHandler = function (e) {
      if (e.key === "ArrowUp" || e.key === "w") keys.Up = true;
      if (e.key === "ArrowDown" || e.key === "s") keys.Down = true;
      if (e.key === "ArrowLeft" || e.key === "a") keys.Left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.Right = true;
      if (gameOver && e.key === " ") init();
    };

    activeGlobalKeyupHandler = function (e) {
      if (e.key === "ArrowUp" || e.key === "w") {
        keys.Up = false;
        player.canManualJump = true;
      }
      if (e.key === "ArrowDown" || e.key === "s") keys.Down = false;
      if (e.key === "ArrowLeft" || e.key === "a") keys.Left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.Right = false;
    };

    $(window).on("keydown", activeGlobalKeydownHandler);
    $(window).on("keyup", activeGlobalKeyupHandler);

    function processCollisions() {
      if (player.vy > 0) {
        platforms.forEach((p) => {
          if (
            player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height >= p.y &&
            player.y + player.height - player.vy <= p.y + p.height
          ) {
            player.vy = AUTO_BOUNCE_FORCE;
          }
        });
      }

      mushrooms.forEach((m) => {
        if (
          player.x < m.x + m.width &&
          player.x + player.width > m.x &&
          player.y < m.y + m.height &&
          player.y + player.height > m.y
        ) {
          gameOver = true;
        }
      });

      coins.forEach((coin) => {
        if (!coin.collected) {
          let checkX = Math.max(
            player.x,
            Math.min(coin.x, player.x + player.width)
          );
          let checkY = Math.max(
            player.y,
            Math.min(coin.y, player.y + player.height)
          );
          let deltaX = coin.x - checkX;
          let deltaY = coin.y - checkY;
          if (deltaX * deltaX + deltaY * deltaY < coin.radius * coin.radius) {
            coin.collected = true;
            score += 10;
          }
        }
      });
    }

    function runGameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!gameOver) {
        player.update();
        processCollisions();

        if (player.y < cameraY + canvas.height * 0.4) {
          cameraY = player.y - canvas.height * 0.4;
        }

        platforms = platforms.filter(
          (p) => p.y < cameraY + canvas.height + 200
        );
        coins = coins.filter((c) => c.y < cameraY + canvas.height + 200);
        mushrooms = mushrooms.filter(
          (m) => m.y < cameraY + canvas.height + 200
        );

        // Continuous procedural level generation condition evaluation
        while (highestSpawnedY > cameraY - 200) {
          highestSpawnedY -= VERTICAL_GAP;
          spawnLayer(highestSpawnedY);
        }

        if (player.y > cameraY + canvas.height) {
          gameOver = true;
        }
      }

      platforms.forEach((p) => p.draw());
      coins.forEach((c) => c.draw());
      mushrooms.forEach((m) => m.draw());
      player.draw();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial";
      ctx.fillText("Score: " + score, 20, 45);
      ctx.font = "14px Arial";
      ctx.fillText("MODE: NORMAL", 20, 70);

      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 34px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 25);
        ctx.font = "18px Arial";
        ctx.fillText(
          "Final Score: " + score,
          canvas.width / 2,
          canvas.height / 2 + 15
        );
        ctx.fillText(
          "Press SPACEBAR to Restart",
          canvas.width / 2,
          canvas.height / 2 + 55
        );
        ctx.textAlign = "start";
      }

      currentGameAnimationId = requestAnimationFrame(runGameLoop);
    }

    init();
    runGameLoop();
  });

  // ==========================================
  // 3. HARD MODE GENERATOR
  // ==========================================
  $("#hard-btn").on("click", function () {
    cleanupActiveGameInstance();

    $("#difficulty").fadeOut(600, function () {
      $("#gameCanvas").fadeIn();
    });

    const canvas = $("#gameCanvas")[0];
    const ctx = canvas.getContext("2d");
    const GRAVITY = 0.44;
    const AUTO_BOUNCE_FORCE = -11.0;
    const MANUAL_JUMP_FORCE = -14.2;
    const DIVE_SPEED = 8.5;
    const MOVE_SPEED = 5.5;
    const VERTICAL_GAP = 140;

    let player;
    let platforms = [];
    let coins = [];
    let mushrooms = [];
    let fires = [];
    let monkeys = [];
    let score = 0;
    let gameOver = false;
    let cameraY = 0;
    let highestSpawnedY = 0; // Fixed endless tracker variable

    let keys = { Up: false, Down: false, Left: false, Right: false };

    class Player {
      constructor() {
        this.width = 32;
        this.height = 32;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 150;
        this.vx = 0;
        this.vy = 0;
        this.color = "#ff4757";
        this.canManualJump = true;
      }

      update() {
        this.vy += GRAVITY;
        if (keys.Up && this.canManualJump) {
          this.vy = MANUAL_JUMP_FORCE;
          this.canManualJump = false;
        }
        if (keys.Down) this.vy = DIVE_SPEED;
        if (keys.Left) this.vx = -MOVE_SPEED;
        else if (keys.Right) this.vx = MOVE_SPEED;
        else this.vx = 0;

        this.y += this.vy;
        this.x += this.vx;

        if (this.x < -this.width) this.x = canvas.width;
        if (this.x > canvas.width) this.x = -this.width;
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y - cameraY, this.width, this.height);
        ctx.fillStyle = "#ffffff";
        let eyeOffset = this.vx >= 0 ? 18 : 4;
        ctx.fillRect(this.x + eyeOffset, this.y - cameraY + 6, 8, 8);
      }
    }

    class Platform {
      constructor(x, y, width = 90) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = 20;
      }

      draw() {
        ctx.fillStyle = "#6d4c41";
        ctx.fillRect(this.x, this.y - cameraY, this.width, this.height);
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(this.x, this.y - cameraY, this.width, 6);
      }
    }

    class Coin {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 9;
        this.collected = false;
      }

      draw() {
        if (this.collected) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y - cameraY, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd700";
        ctx.fill();
        ctx.strokeStyle = "#e6b800";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      }
    }

    class Mushroom {
      constructor(x, y) {
        this.width = 24;
        this.height = 24;
        this.x = x;
        this.y = y - this.height;
      }

      draw() {
        ctx.fillStyle = "#e0e0e0";
        ctx.fillRect(this.x + 8, this.y - cameraY + 12, 8, 12);
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y - cameraY + 12, 12, Math.PI, 0, false);
        ctx.fillStyle = "#d32f2f";
        ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x + 6, this.y - cameraY + 4, 3, 3);
        ctx.fillRect(this.x + 14, this.y - cameraY + 3, 3, 3);
      }
    }

    class Fire {
      constructor(x, y) {
        this.width = 28;
        this.height = 32;
        this.x = x;
        this.y = y - this.height;
        this.flicker = 0;
      }

      draw() {
        this.flicker = Math.sin(Date.now() / 50) * 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 14, this.y - cameraY);
        ctx.quadraticCurveTo(
          this.x + 28 + this.flicker,
          this.y - cameraY + 20,
          this.x + 20,
          this.y - cameraY + 32
        );
        ctx.lineTo(this.x + 8, this.y - cameraY + 32);
        ctx.quadraticCurveTo(
          this.x - this.flicker,
          this.y - cameraY + 20,
          this.x + 14,
          this.y - cameraY
        );
        ctx.fillStyle = "#ff5722";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x + 14, this.y - cameraY + 10);
        ctx.quadraticCurveTo(
          this.x + 22,
          this.y - cameraY + 22,
          this.x + 18,
          this.y - cameraY + 32
        );
        ctx.lineTo(this.x + 10, this.y - cameraY + 32);
        ctx.quadraticCurveTo(
          this.x + 6,
          this.y - cameraY + 22,
          this.x + 14,
          this.y - cameraY + 10
        );
        ctx.fillStyle = "#ffeb3b";
        ctx.fill();
        ctx.closePath();
      }
    }

    class HangingMonkey {
      constructor(x, y, pHeight) {
        this.width = 26;
        this.height = 36;
        this.x = x;
        this.y = y + pHeight;
      }

      draw() {
        ctx.strokeStyle = "#8d6e63";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + 13, this.y - cameraY);
        ctx.lineTo(this.x + 13, this.y - cameraY + 12);
        ctx.stroke();

        ctx.fillStyle = "#5d4037";
        ctx.beginPath();
        ctx.arc(this.x + 13, this.y - cameraY + 18, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.x + 13, this.y - cameraY + 28, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#d7ccc8";
        ctx.beginPath();
        ctx.arc(this.x + 13, this.y - cameraY + 29, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x + 10, this.y - cameraY + 27, 2, 2);
        ctx.fillRect(this.x + 14, this.y - cameraY + 27, 2, 2);
      }
    }

    function init() {
      player = new Player();
      platforms = [];
      coins = [];
      mushrooms = [];
      fires = [];
      monkeys = [];
      score = 0;
      cameraY = 0;
      gameOver = false;

      platforms.push(new Platform(0, canvas.height - 40, canvas.width));
      highestSpawnedY = canvas.height - 40;

      for (let i = 0; i < 15; i++) {
        highestSpawnedY -= VERTICAL_GAP;
        spawnLayer(highestSpawnedY);
      }
    }

    function spawnLayer(yPos) {
      let pWidth = 80 + Math.random() * 30;
      let pX = Math.random() * (canvas.width - pWidth);
      let currentPlatform = new Platform(pX, yPos, pWidth);
      platforms.push(currentPlatform);

      let hazardRoll = Math.random();
      if (hazardRoll < 0.25) {
        let mushX = pX + Math.random() * (pWidth - 24);
        mushrooms.push(new Mushroom(mushX, yPos));
      } else if (hazardRoll < 0.55) {
        let fireX = pX + Math.random() * (pWidth - 28);
        fires.push(new Fire(fireX, yPos));
      }

      if (Math.random() < 0.4) {
        let monkeyX = pX + Math.random() * (pWidth - 26);
        monkeys.push(new HangingMonkey(monkeyX, yPos, currentPlatform.height));
      }

      let patternChoice = Math.random();
      if (patternChoice < 0.5) {
        for (let k = 0; k < 4; k++) {
          coins.push(new Coin(pX + k * 22, yPos - 30 - k * 25));
        }
      } else {
        for (let k = 0; k < 3; k++) {
          coins.push(new Coin(pX + (pWidth / 4) * (k + 1), yPos - 25));
        }
      }
    }

    activeGlobalKeydownHandler = function (e) {
      if (e.key === "ArrowUp" || e.key === "w") keys.Up = true;
      if (e.key === "ArrowDown" || e.key === "s") keys.Down = true;
      if (e.key === "ArrowLeft" || e.key === "a") keys.Left = true;
      if (e.key === "ArrowRight" || e.key === "d") keys.Right = true;
      if (gameOver && e.key === " ") init();
    };

    activeGlobalKeyupHandler = function (e) {
      if (e.key === "ArrowUp" || e.key === "w") {
        keys.Up = false;
        player.canManualJump = true;
      }
      if (e.key === "ArrowDown" || e.key === "s") keys.Down = false;
      if (e.key === "ArrowLeft" || e.key === "a") keys.Left = false;
      if (e.key === "ArrowRight" || e.key === "d") keys.Right = false;
    };

    $(window).on("keydown", activeGlobalKeydownHandler);
    $(window).on("keyup", activeGlobalKeyupHandler);

    function processCollisions() {
      if (player.vy > 0) {
        platforms.forEach((p) => {
          if (
            player.x + player.width > p.x &&
            player.x < p.x + p.width &&
            player.y + player.height >= p.y &&
            player.y + player.height - player.vy <= p.y + p.height
          ) {
            player.vy = AUTO_BOUNCE_FORCE;
          }
        });
      }

      const checkHit = (rect1, rect2) => {
        return (
          rect1.x < rect2.x + rect2.width &&
          rect1.x + rect1.width > rect2.x &&
          rect1.y < rect2.y + rect2.height &&
          rect1.y + rect1.height > rect2.y
        );
      };

      mushrooms.forEach((m) => {
        if (checkHit(player, m)) gameOver = true;
      });
      fires.forEach((f) => {
        if (checkHit(player, f)) gameOver = true;
      });
      monkeys.forEach((m) => {
        if (checkHit(player, m)) gameOver = true;
      });

      coins.forEach((coin) => {
        if (!coin.collected) {
          let checkX = Math.max(
            player.x,
            Math.min(coin.x, player.x + player.width)
          );
          let checkY = Math.max(
            player.y,
            Math.min(coin.y, player.y + player.height)
          );
          let deltaX = coin.x - checkX;
          let deltaY = coin.y - checkY;
          if (deltaX * deltaX + deltaY * deltaY < coin.radius * coin.radius) {
            coin.collected = true;
            score += 10;
          }
        }
      });
    }

    function runGameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!gameOver) {
        player.update();
        processCollisions();

        if (player.y < cameraY + canvas.height * 0.4) {
          cameraY = player.y - canvas.height * 0.4;
        }

        platforms = platforms.filter(
          (p) => p.y < cameraY + canvas.height + 200
        );
        coins = coins.filter((c) => c.y < cameraY + canvas.height + 200);
        mushrooms = mushrooms.filter(
          (m) => m.y < cameraY + canvas.height + 200
        );
        fires = fires.filter((f) => f.y < cameraY + canvas.height + 200);
        monkeys = monkeys.filter((m) => m.y < cameraY + canvas.height + 200);

        // Endless tracking logic using absolute coordinates relative to the viewport
        while (highestSpawnedY > cameraY - 200) {
          highestSpawnedY -= VERTICAL_GAP;
          spawnLayer(highestSpawnedY);
        }

        if (player.y > cameraY + canvas.height) {
          gameOver = true;
        }
      }

      platforms.forEach((p) => p.draw());
      coins.forEach((c) => c.draw());
      mushrooms.forEach((m) => m.draw());
      fires.forEach((f) => f.draw());
      monkeys.forEach((m) => m.draw());
      player.draw();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial";
      ctx.fillText("Score: " + score, 20, 45);
      ctx.fillStyle = "#ff4757";
      ctx.font = "bold 14px Arial";
      ctx.fillText("MODE: HARD", 20, 70);

      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.font = "bold 34px Arial";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 25);
        ctx.font = "18px Arial";
        ctx.fillText(
          "Final Score: " + score,
          canvas.width / 2,
          canvas.height / 2 + 15
        );
        ctx.fillText(
          "Press SPACEBAR to Restart",
          canvas.width / 2,
          canvas.height / 2 + 55
        );
        ctx.textAlign = "start";
      }

      currentGameAnimationId = requestAnimationFrame(runGameLoop);
    }

    init();
    runGameLoop();
  });

  // end of script
});
