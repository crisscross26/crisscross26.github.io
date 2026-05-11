$(document).ready(function () {
  // SETTINGS FUNCTION
  $("#settings-btn").on("click", function () {
    $("#menu").fadeOut(600, function () {
      $("#settings").fadeIn();
    });
  });

  $("#return-btn").on("click", function () {
    $("#settings").fadeOut(600, function () {
      $("#menu").fadeIn();
    });
  });

  $("#music-btn").on("click", function () {
    $("#settings").fadeOut(600, function () {
      $("#menu").fadeIn();
    });
  });

  // LEADERBOARD
  $("#leaderboard-btn").on("click", function () {
    $("#menu").fadeOut(600, function () {
      $("#leaderboard").fadeIn();
    });
  });

  $("#return-btn-leaderboard").on("click", function () {
    $("#leaderboard").fadeOut(600, function () {
      $("#menu").fadeIn();
    });
  });

  // DIFFICULTY
  $("#start-btn").on("click", function () {
    $("#menu").fadeOut(600, function () {
      $("#difficulty").fadeIn();
    });
  });

  $("#return-btn-difficulty").on("click", function () {
    $("#difficulty").fadeOut(600, function () {
      $("#menu").fadeIn();
    });
  });
  $("#easy-btn").on("click", function () {});

  $("#normal-btn").on("click", function () {});

  $("#hard-btn").on("click", function () {});
});
