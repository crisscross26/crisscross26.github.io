$(document).ready(function () {

  // ==========================================
  // BACKGROUND MUSIC
  // ==========================================

  function initiateBackgroundMusic() {
    let audio = $("#bgmusic")[0];
    if (audio) {
      audio.play()
        .then(() => {
          $(document).off("click keydown", initiateBackgroundMusic);
        })
        .catch(() => {
          console.log("Waiting for interaction...");
        });
    }
  }

  initiateBackgroundMusic();
  $(document).on("click keydown", initiateBackgroundMusic);

  // ==========================================
  // COIN STORAGE, INVENTORY & UPGRADES SYSTEM
  // ==========================================

  let savedCoins = parseInt(localStorage.getItem("savedCoins")) || 0;
  let selectedSkin = localStorage.getItem("selectedSkin") || "circle";
  
  // High Score Storage System
  let highscore = parseInt(localStorage.getItem("bb_highscore")) || 0;

  // --- UPDATED: UPGRADES AND EXTRA ATTRIBUTES LOADING ---
  let magnetLevel = parseInt(localStorage.getItem("magnetLevel")) || 0; 
  const maxMagnetLevel = 5;
  const magnetBaseCost = 200;

  let hasDoubleJump = localStorage.getItem("hasDoubleJump") === "true"; 
  let extraLivesCount = parseInt(localStorage.getItem("extraLivesCount")) || 0;

  let ownedSkins = JSON.parse(localStorage.getItem("ownedSkins")) || {
    circle: true,
    square: false,
    triangle: false,
    diamond: false
  };

  let selectedBG = localStorage.getItem("selectedBG") || "default";
  let ownedBG = JSON.parse(localStorage.getItem("ownedBG")) || {
    default: true,
    bliss: false,
    valley: false,
    nightsky: false,
    beach: false,
    rosy: false
  };

  let bgImages = {};
  const bgSources = {
    default: "assets/background/bg-default.png",
    bliss: "assets/background/bg-bliss.jpg",
    valley: "assets/background/bg-valley.jpg",
    nightsky: "assets/background/bg-nightsky.jpg",
    beach: "assets/background/bg-beach.jpg",
    rosy: "assets/background/bg-rosy.jpg"
  };

  Object.keys(bgSources).forEach(key => {
    bgImages[key] = new Image();
    bgImages[key].src = bgSources[key];
  });

  // --- UPDATED: REFRESH ALL VISUAL ITEMS AND PERMANENT BUTTON LABELS ---
  function updateVisualShopLabels() {
    $(".coin-display-span").text(savedCoins);
    $("#high-score-display").text(highscore);
    
    // Double Jump Button Processing
    if (hasDoubleJump) {
      $("#buy-doublejump").text("Owned").prop("disabled", true).addClass("disabled-btn").css("background-color", "#555");
    } else {
      $("#buy-doublejump").text("Double Jump (800g)").prop("disabled", false).removeClass("disabled-btn");
    }

    // Extra Life Button Processing
    $("#buy-extralife").text("Extra Life (" + extraLivesCount + " Owned) - 300g");
  }

  function saveGameData() {
    localStorage.setItem("savedCoins", savedCoins);
    localStorage.setItem("selectedSkin", selectedSkin);
    localStorage.setItem("ownedSkins", JSON.stringify(ownedSkins));
    localStorage.setItem("selectedBG", selectedBG);
    localStorage.setItem("ownedBG", JSON.stringify(ownedBG));
    localStorage.setItem("magnetLevel", magnetLevel);
    localStorage.setItem("hasDoubleJump", hasDoubleJump);
    localStorage.setItem("extraLivesCount", extraLivesCount);
    localStorage.setItem("bb_highscore", highscore);
    updateVisualShopLabels();
  }

  // ==========================================
  // NAVIGATION ROUTER
  // ==========================================

  function openMenu(targetId) {
    updateVisualShopLabels();
    $(".general, #menu, #skins, #background, #upgrades").hide();
    $(targetId).fadeIn(300);
  }

  $("#settings-btn").on("click", function () { openMenu("#settings"); });
  $("#return-btn").on("click", function () { openMenu("#menu"); });
  $("#leaderboard-btn").on("click", function () { openMenu("#leaderboard"); });
  $("#return-btn-leaderboard").on("click", function () { openMenu("#menu"); });
  $("#shop-btn").on("click", function () { openMenu("#shop"); });
  $("#return-btn-shop").on("click", function () { openMenu("#menu"); });
  $("#skin-btn").on("click", function () { openMenu("#skins"); });
  $("#return-btn-skins").on("click", function () { openMenu("#shop"); });
  $("#bg-btn").on("click", function () { openMenu("#background"); });
  $("#return-btn-background").on("click", function () { openMenu("#shop"); });
  $("#upg-btn").on("click", function () { openMenu("#upgrades"); });
  $("#return-btn-upgrades").on("click", function () { openMenu("#shop"); });

  // ==========================================
  // CONFIG AUDIO MIXERS
  // ==========================================

  $("#music-vol").on("input change", function () {
    let audio = $("#bgmusic")[0];
    if (audio) { audio.volume = this.value / 100; }
  });

  $("#music-btn").on("click", function () {
    let audio = $("#bgmusic")[0];
    if (audio) {
      audio.muted = !audio.muted;
      $(this).attr("src", audio.muted ? "assets/GUI/buttons/mute.png" : "assets/GUI/buttons/unmute.png");
    }
  });

  // ==========================================
  // PURCHASING MECHANICS (SKINS, BGs, & UPGRADES)
  // ==========================================

  $("#buy-square").on("click", function () {
    if (!ownedSkins.square && savedCoins >= 300) {
      savedCoins -= 300; ownedSkins.square = true; selectedSkin = "square";
      saveGameData(); alert("Square skin purchased!");
    } else if (ownedSkins.square) {
      selectedSkin = "square"; saveGameData(); alert("Square skin equipped!");
    } else { alert("Not enough coins!"); }
  });

  $("#buy-triangle").on("click", function () {
    if (!ownedSkins.triangle && savedCoins >= 300) {
      savedCoins -= 300; ownedSkins.triangle = true; selectedSkin = "triangle";
      saveGameData(); alert("Triangle skin purchased!");
    } else if (ownedSkins.triangle) {
      selectedSkin = "triangle"; saveGameData(); alert("Triangle skin equipped!");
    } else { alert("Not enough coins!"); }
  });

  $("#buy-diamond").on("click", function () {
    if (!ownedSkins.diamond && savedCoins >= 300) {
      savedCoins -= 300; ownedSkins.diamond = true; selectedSkin = "diamond";
      saveGameData(); alert("Diamond skin purchased!");
    } else if (ownedSkins.diamond) {
      selectedSkin = "diamond"; saveGameData(); alert("Diamond skin equipped!");
    } else { alert("Not enough coins!"); }
  });

  $("#buy-bliss").on("click", function () {
    if (!ownedBG.bliss && savedCoins >= 300) {
      savedCoins -= 300; ownedBG.bliss = true; selectedBG = "bliss";
      saveGameData(); alert("Bliss background purchased!");
    } else if (ownedBG.bliss) {
      selectedBG = "bliss"; saveGameData(); alert("Bliss background equipped!");
    } else { alert("Not enough coins!"); }
  });

  $("#buy-valley").on("click", function () {
    if (!ownedBG.valley && savedCoins >= 300) {
      savedCoins -= 300; ownedBG.valley = true; selectedBG = "valley";
      saveGameData(); alert("Valley background purchased!");
    } else if (ownedBG.valley) {
      selectedBG = "valley"; saveGameData(); alert("Valley background equipped!");
    } else { alert("Not enough coins!"); }
  });

  $("#buy-nightsky").on("click", function () {
    if (!ownedBG.nightsky && savedCoins >= 300) {
      savedCoins -= 300; ownedBG.nightsky = true; selectedBG = "nightsky";
      saveGameData(); alert("Nightsky background purchased!");
    } else if (ownedBG.nightsky) {
      selectedBG = "nightsky"; saveGameData(); alert("Nightsky background equipped!");
    } else { alert("Not enough coins!"); }
  });

  $("#buy-beach").on("click", function () {
    if (!ownedBG.beach && savedCoins >= 400) {
      savedCoins -= 400; ownedBG.beach = true; selectedBG = "beach";
      saveGameData(); alert("Beach background purchased!");
    } else if (ownedBG.beach) {
      selectedBG = "beach"; saveGameData(); alert("Beach background equipped!");
    } else { alert("Not enough coins!"); }
  });

  $("#buy-rosy").on("click", function () {
    if (!ownedBG.rosy && savedCoins >= 400) {
      savedCoins -= 400; ownedBG.rosy = true; selectedBG = "rosy";
      saveGameData(); alert("Rosy background purchased!");
    } else if (ownedBG.rosy) {
      selectedBG = "rosy"; saveGameData(); alert("Rosy background equipped!");
    } else { alert("Not enough coins!"); }
  });

  // --- UPDATED: UPGRADES LOGIC HANDLERS ---
  $("#buy-doublejump").on("click", function() {
    if (!hasDoubleJump && savedCoins >= 800) {
      savedCoins -= 800;
      hasDoubleJump = true;
      saveGameData();
      alert("Double Jump purchased! Press UP arrow or W key while in-air to use.");
    } else if (hasDoubleJump) {
      alert("Already owned!");
    } else { alert("Not enough coins!"); }
  });

  $("#buy-extralife").on("click", function() {
    if (savedCoins >= 300) {
      savedCoins -= 300;
      extraLivesCount += 1;
      saveGameData();
      alert("Extra Life bought! You'll carry it into the match automatically.");
    } else { alert("Not enough coins!"); }
  });

  // Load initial value on screen setup
  updateVisualShopLabels();

  // ==========================================
  // DIFFICULTY NAVIGATION SELECTION
  // ==========================================

  $("#start-btn").on("click", function () {
    $("#menu").fadeOut(300, function () { $("#difficulty").fadeIn(300); });
  });

  $("#return-btn-difficulty").on("click", function () {
    $("#difficulty").fadeOut(300, function () { $("#menu").fadeIn(300); });
  });

  // ==========================================
  // GAME DESKTOP MANAGEMENT HANDLERS
  // ==========================================

  let currentGameAnimationId = null;
  let activeGlobalKeydownHandler = null;
  let activeGlobalKeyupHandler = null;

  const canvas = $("#gameCanvas")[0];
  const ctx = canvas.getContext("2d");

  function cleanupGame() {
    if (currentGameAnimationId) { cancelAnimationFrame(currentGameAnimationId); }
    if (activeGlobalKeydownHandler) { $(window).off("keydown", activeGlobalKeydownHandler); }
    if (activeGlobalKeyupHandler) { $(window).off("keyup", activeGlobalKeyupHandler); }
    $("#gameCanvas").hide();
    $("#game-return-btn").hide();
  }

  $("#game-return-btn").on("click", function () {
    cleanupGame();
    openMenu("#menu");
  });

  // ==========================================
  // INITIATE ACTIVE ENGINE RUNTIME
  // ==========================================

  function startGame(mode) {
    cleanupGame();

    $("#difficulty").fadeOut(300, function () {
      $("#gameCanvas").fadeIn(300);
      $("#game-return-btn").fadeIn(300);
    });

    let gravity = 0.25;
    let bounceForce = -8;
    let moveSpeed = 5;
    let platformGap = 85;
    let spikeChance = 0;

    if (mode === "normal") { spikeChance = 0.25; }
    if (mode === "hard") {
      spikeChance = 0.5;
      platformGap = 95;
    }

    let player = { x: 180, y: 450, radius: 20, vx: 0, vy: 0 };
    let cameraY = 0;
    let score = 0;
    let roundCoins = 0;
    let gameOver = false;

    // --- INSTANTIATING CURRENT LEVEL UPGRADE MECHANICS ---
    let magnetRadius = magnetLevel > 0 ? 20 + (magnetLevel * 30) : 0;
    let magnetPullSpeed = 4;
    
    let canDoubleJump = hasDoubleJump; // Toggled per air loop
    let sessionLives = extraLivesCount;  // Load active lives safely

    let keys = { left: false, right: false };
    let platforms = [{ x: 120, y: 520, width: 160, height: 20 }];
    let spikes = [];
    let coins = [];

    for (let i = 1; i < 200; i++) {
      let width = 100 + Math.random() * 60;
      let x = Math.random() * (canvas.width - width);
      let y = 520 - (i * platformGap);

      platforms.push({ x: x, y: y, width: width, height: 20 });
      coins.push({ x: x + width / 2, y: y - 25, collected: false });

      if (Math.random() < spikeChance) {
        spikes.push({ x: x + width / 2 - 15, y: y - 20, width: 30, height: 20 });
      }
    }

    // --- UPDATED KEY INPUT LISTENER: TRACK AIR DOUBLE JUMP MECHANIC ---
    activeGlobalKeydownHandler = function (e) {
      if (e.key === "ArrowLeft" || e.key === "a") { keys.left = true; }
      if (e.key === "ArrowRight" || e.key === "d") { keys.right = true; }
      
      // Double Jump checking: triggers on Up/W if available and character is falling/moving up
      if ((e.key === "ArrowUp" || e.key === "w") && !gameOver && canDoubleJump) {
        player.vy = bounceForce;
        canDoubleJump = false; // Expended until next bounce
      }
      
      if (gameOver && e.key === " ") { startGame(mode); }
    };

    activeGlobalKeyupHandler = function (e) {
      if (e.key === "ArrowLeft" || e.key === "a") { keys.left = false; }
      if (e.key === "ArrowRight" || e.key === "d") { keys.right = false; }
    };

    $(window).on("keydown", activeGlobalKeydownHandler);
    $(window).on("keyup", activeGlobalKeyupHandler);

    // --- ENCAPSULATED RECOVERY LOGIC (EXTRA LIFE STACK) ---
    function handlePlayerDeath() {
      if (sessionLives > 0) {
        sessionLives--;
        extraLivesCount--; // Decrement global storage inventory tracking item
        localStorage.setItem("extraLivesCount", extraLivesCount);
        
        // Bounce player upward safely out of hazard layout context
        player.vy = bounceForce * 1.3; 
        return;
      }
      
      // True Game Over
      gameOver = true;
      savedCoins += roundCoins;
      if (score > highscore) {
        highscore = score;
      }
      saveGameData();
    }

    function update() {
      if (gameOver) return;

      player.vy += gravity;
      if (keys.left) { player.vx = -moveSpeed; }
      else if (keys.right) { player.vx = moveSpeed; }
      else { player.vx = 0; }

      player.x += player.vx;
      player.y += player.vy;

      if (player.x < player.radius) { player.x = player.radius; }
      if (player.x > canvas.width - player.radius) { player.x = canvas.width - player.radius; }

      platforms.forEach((p) => {
        if (
          player.x + player.radius > p.x &&
          player.x - player.radius < p.x + p.width &&
          player.y + player.radius > p.y &&
          player.y + player.radius < p.y + p.height + 10 &&
          player.vy > 0
        ) { 
          player.vy = bounceForce; 
          if (hasDoubleJump) { canDoubleJump = true; } // Reset double jump upon safe platform contact
        }
      });

      spikes.forEach((s) => {
        if (
          player.x + player.radius > s.x &&
          player.x - player.radius < s.x + s.width &&
          player.y + player.radius > s.y &&
          player.y - player.radius < s.y + s.height
        ) {
          handlePlayerDeath();
        }
      });

      coins.forEach((c) => {
        if (!c.collected) {
          let dx = player.x - c.x;
          let dy = player.y - c.y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (magnetRadius > 0 && distance < magnetRadius) {
            c.x += (dx / distance) * magnetPullSpeed;
            c.y += (dy / distance) * magnetPullSpeed;
          }

          if (distance < player.radius + 10) {
            c.collected = true;
            score += 10;
            roundCoins += 10;
          }
        }
      });

      if (player.y < cameraY + 250) { cameraY = player.y - 250; }

      let highestPlatform = platforms[platforms.length - 1];
      while (highestPlatform.y > cameraY - 1000) {
        let width = 100 + Math.random() * 60;
        let x = Math.random() * (canvas.width - width);
        let y = highestPlatform.y - platformGap;

        let newPlatform = { x: x, y: y, width: width, height: 20 };
        platforms.push(newPlatform);
        coins.push({ x: x + width / 2, y: y - 25, collected: false });

        if (Math.random() < spikeChance) {
          spikes.push({ x: x + width / 2 - 15, y: y - 20, width: 30, height: 20 });
        }
        highestPlatform = newPlatform;
      }

      // Check falling below frame
      if (player.y > cameraY + canvas.height + 100) {
        handlePlayerDeath();
        if (!gameOver) {
          // If saved by extra life from falling, teleport back to highest nearest track line
          player.y = cameraY + 100;
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let currentImgElement = bgImages[selectedBG];
      if (currentImgElement && currentImgElement.complete && currentImgElement.naturalWidth !== 0) {
        ctx.drawImage(currentImgElement, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      platforms.forEach((p) => {
        ctx.fillStyle = "#6b4f2a";
        ctx.fillRect(p.x, p.y - cameraY, p.width, p.height);
        ctx.fillStyle = "#4CAF50";
        ctx.fillRect(p.x, p.y - cameraY, p.width, 5);
      });

      spikes.forEach((s) => {
        ctx.fillStyle = "gray";
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - cameraY + s.height);
        ctx.lineTo(s.x + s.width / 2, s.y - cameraY);
        ctx.lineTo(s.x + s.width, s.y - cameraY + s.height);
        ctx.fill();
      });

      coins.forEach((c) => {
        if (!c.collected) {
          ctx.beginPath();
          ctx.arc(c.x, c.y - cameraY, 10, 0, Math.PI * 2);
          ctx.fillStyle = "gold";
          ctx.fill();
        }
      });

      ctx.fillStyle = "#ff4d4d";
      if (selectedSkin === "circle") {
        ctx.beginPath(); ctx.arc(player.x, player.y - cameraY, player.radius, 0, Math.PI * 2); ctx.fill();
      } else if (selectedSkin === "square") {
        ctx.fillRect(player.x - player.radius, player.y - cameraY - player.radius, player.radius * 2, player.radius * 2);
      } else if (selectedSkin === "triangle") {
        ctx.beginPath(); ctx.moveTo(player.x, player.y - cameraY - player.radius); ctx.lineTo(player.x - player.radius, player.y - cameraY + player.radius); ctx.lineTo(player.x + player.radius, player.y - cameraY + player.radius); ctx.closePath(); ctx.fill();
      } else if (selectedSkin === "diamond") {
        ctx.beginPath(); ctx.moveTo(player.x, player.y - cameraY - player.radius); ctx.lineTo(player.x - player.radius, player.y - cameraY); ctx.lineTo(player.x, player.y - cameraY + player.radius); ctx.lineTo(player.x + player.radius, player.y - cameraY); ctx.closePath(); ctx.fill();
      }

      ctx.fillStyle = "white";
      ctx.beginPath(); ctx.arc(player.x - 7, player.y - cameraY - 5, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(player.x + 7, player.y - cameraY - 5, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "black";
      ctx.beginPath(); ctx.arc(player.x - 7, player.y - cameraY - 5, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(player.x + 7, player.y - cameraY - 5, 2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "black"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(player.x, player.y - cameraY + 5, 7, 0, Math.PI); ctx.stroke();
      ctx.fillStyle = "pink";
      ctx.beginPath(); ctx.arc(player.x, player.y - cameraY + 11, 4, 0, Math.PI); ctx.fill();

      // UI HUD Text Render
      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.fillText("Score: " + score, 20, 40);
      ctx.fillText("Coins: " + roundCoins, 20, 70);
      ctx.fillStyle = "lightpink";
      ctx.fillText("Lives: " + sessionLives, 20, 100);

      if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ff4d4d";
        ctx.font = "bold 35px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 80);

        ctx.fillStyle = "white";
        ctx.font = "22px Arial";
        ctx.fillText("Final Score: " + score, canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.fillStyle = "gold";
        ctx.fillText("Coins Earned: +" + roundCoins, canvas.width / 2, canvas.height / 2 + 15);
        
        ctx.fillStyle = "#aaa";
        ctx.font = "16px Arial";
        ctx.fillText("Total Bank: " + savedCoins, canvas.width / 2, canvas.height / 2 + 45);

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Press SPACE to Retry", canvas.width / 2, canvas.height / 2 + 100);
        ctx.textAlign = "left";
      }
    }

    function gameLoop() {
      update();
      draw();
      currentGameAnimationId = requestAnimationFrame(gameLoop);
    }
    gameLoop();
  }

  $("#easy-btn").on("click", function () { startGame("easy"); });
  $("#normal-btn").on("click", function () { startGame("normal"); });
  $("#hard-btn").on("click", function () { startGame("hard"); });
});
