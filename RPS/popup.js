document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("button-container");
  const resetBtn = document.getElementById("reset");

  // --- Storage wrapper ---
  const storage = (typeof chrome !== "undefined" && chrome.storage)
    ? chrome.storage.local
    : {
        get: (keys, cb) => {
          const data = {};
          keys.forEach(k => { data[k] = parseInt(localStorage.getItem(k)) || 0; });
          cb(data);
        },
        set: (data, cb) => {
          Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
          if(cb) cb();
        }
      };

  // Set button images
  document.querySelectorAll('.choice-img').forEach(img => {
    const name = img.getAttribute('data-img'); // rock, paper, scissors
    if (name) {
      img.src = (typeof chrome !== "undefined" && chrome.runtime)
        ? chrome.runtime.getURL(`images/${name}.png`)
        : `images/${name}.png`; // fallback for normal tab
    }
  });

  // Event delegation for button clicks
  container.addEventListener("click", (e) => {
    const btn = e.target.closest('button.choice-btn');
    if (!btn) return;
    const choice = btn.getAttribute('data-choice');
    if (!choice) return;
    playGame(choice, storage);
  });

  resetBtn.addEventListener("click", () => resetScore(storage));

  // Load stored score
  loadScore(storage);
});

// --- Game logic ---
function playGame(userChoice, storage) {
  const resultText = document.getElementById("result");
  const buttons = {
    rock: document.getElementById("rock"),
    paper: document.getElementById("paper"),
    scissors: document.getElementById("scissors")
  };

  // Clear previous glows
  Object.values(buttons).forEach(b => b.classList.remove("glow-win", "glow-lose", "glow-tie"));

  const choices = ["rock", "paper", "scissors"];
  const compChoice = choices[Math.floor(Math.random() * choices.length)];
  let resultType = "";
  let message = "";

  if (userChoice === compChoice) {
    resultType = "tie";
    message = `It's a <span style="color: #FFEB3B;">tie!</span>`;
  } else if (
    (userChoice === "rock" && compChoice === "scissors") ||
    (userChoice === "scissors" && compChoice === "paper") ||
    (userChoice === "paper" && compChoice === "rock")
  ) {
    resultType = "win";
    message = `You <span style="color: #4CAF50;">win!</span>`;
  } else {
    resultType = "lose";
    message =`You <span style="color: #f44336;">lose!</span>`;
  }

  updateScore(resultType, storage);
  resultText.innerHTML = `You chose <b>${userChoice}</b>. The CPU chose <b>${compChoice}</b>. <b>${message}</b>`;

  // Glow animation
  const userBtn = buttons[userChoice];
  if(userBtn) {
    userBtn.classList.add(`glow-${resultType}`);
    setTimeout(() => userBtn.classList.remove(`glow-${resultType}`), 1000);
  }
}

// --- Score tracking ---
function loadScore(storage) {
  storage.get(["wins","losses","ties"], (data) => {
    document.getElementById("wins").textContent = data.wins || 0;
    document.getElementById("losses").textContent = data.losses || 0;
    document.getElementById("ties").textContent = data.ties || 0;
  });
}

function updateScore(resultType, storage) {
  storage.get(["wins","losses","ties"], (data) => {
    const newScore = {
      wins: data.wins || 0,
      losses: data.losses || 0,
      ties: data.ties || 0
    };

    if(resultType === "win") newScore.wins++;
    else if(resultType === "lose") newScore.losses++;
    else newScore.ties++;

    storage.set(newScore, () => {
      document.getElementById("wins").textContent = newScore.wins;
      document.getElementById("losses").textContent = newScore.losses;
      document.getElementById("ties").textContent = newScore.ties;
    });
  });
}

function resetScore(storage) {
  storage.set({wins:0, losses:0, ties:0}, () => {
    document.getElementById("wins").textContent = 0;
    document.getElementById("losses").textContent = 0;
    document.getElementById("ties").textContent = 0;
    document.getElementById("result").textContent = "Scores reset!";
  });
}
