let currentLang = "ru"; 

const translations = {
  en: {
    title: "Guess the Number",
    start: "Start",
    level1: "Level 1",
    level2: "Level 2",
    level3: "Level 3",
    level4: "Level 4",
    level5: "Level 5",
    level6: "Level 6",
    welcome: "Welcome to the Adventure!",
    tooHigh: "📉 Too high! Try again.",
    tooLow: "📈 Too low! Try again.",
    correct: (attempts) => `🎉 You guessed it in ${attempts} attempts! Moving to next level...`,
    gameOver: (number) => `👻 Game Over! You lost all lives.<br>✅ The correct number was: ${number}`,
    timeUp: "🕐 Time's up! You lost 1 life.",
    enterNumber: "⛔ Please enter a number!",

    level5Correct: "✅ Correct! The number was ",
    level5Wrong: "❌ Wrong! Correct was: ",
    level5Passed: "🎉 You passed Level 5!",
    level5TimeUp: "🕐 Time’s up! You lost 1 life.",
    level5GameOver: "💀 Game Over! The correct number was: ",

    level6Correct: "✅ Correct! Next...",
    level6Wrong: "❌ Oops! Try again...",
    level6GameOver: "💀 Game Over!",
    level6TimeUp: "🕐 Time's up! You lost 1 life.",
      timerLabel: "⏱️ Time left:",
      scoreLabel: "🏆 High Score:"
  },
  ru: {
    title: "Угадай число",
    start: "Начать",
    level1: "Уровень 1",
    level2: "Уровень 2",
    level3: "Уровень 3",
    level4: "Уровень 4",
    level5: "Уровень 5",
    level6: "Уровень 6",
    welcome: "Добро пожаловать в приключение!",
    tooHigh: "📉 Слишком много! Попробуй ещё раз.",
    tooLow: "📈 Слишком мало! Попробуй ещё раз.",
    correct: (attempts) => `🎉 Угадал за ${attempts} попыток! Переход на следующий уровень...`,
    gameOver: (number) => `👻 Игра окончена! Ты потерял все жизни.<br>✅ Загаданное число было: ${number}`,
    timeUp: "🕐 Время вышло! Ты потерял 1 жизнь.",
    enterNumber: "⛔ Пожалуйста, введи число!",

    level5Correct: "✅ Верно! Число было ",
    level5Wrong: "❌ Неверно! Правильный ответ: ",
    level5Passed: "🎉 Ты прошел 5 уровень!",
    level5TimeUp: "🕐 Время вышло! Ты потерял 1 жизнь.",
    level5GameOver: "💀 Игра окончена! Правильное число было: ",

    level6Correct: "✅ Верно! Далее...",
    level6Wrong: "❌ Упс! Попробуй снова...",
    level6GameOver: "💀 Игра окончена!",
    level6TimeUp: "🕐 Время вышло! Ты потерял 1 жизнь.",
     timerLabel: "⏱️ Осталось времени:",
     scoreLabel: "🏆 Рекорд:"
  }
};

function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = translations[lang][key];
    if (typeof translation === "function") {
      el.textContent = translation(0); 
    } else if (translation) {
      el.textContent = translation;
    }
  });
}




let level1Score = 0;
let level2Score = 0;
let level3Score = 0;
let level4Score = 0;
let level5Score = 0;
let level6Score = 0;



let soundOn = true;           
let vibrationOn = true;       
let hiddenBoxIndex = 0;       


let rangeStart = 1;
let rangeEnd = 50;
let correct;
let level5Lives = 3;

let level5Time = 30;
let level5TimerInterval;

document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const toggleSound = document.getElementById('toggleSound');
  const toggleVibration = document.getElementById('toggleVibration');
  const settingsPanel = document.getElementById('settingsPanel');

    settingsBtn.addEventListener("click", () => {
    console.log("⚙️ settingsBtn clicked!"); 
    settingsPanel.classList.toggle("hidden");
  });



  toggleSound.addEventListener('click', () => {
    soundOn = !soundOn;
    toggleSound.textContent = soundOn ? '🔊' : '🔇';
  });

  toggleVibration.addEventListener('click', () => {
    vibrationOn = !vibrationOn;
    toggleVibration.textContent = vibrationOn ? '📳' : '❌';
  });
});



const startSound = new Audio('sounds/startgame.mp3');
const clickSound = new Audio('sounds/click-234708.mp3');
const failSound = new Audio('sounds/spin-fail-295088.mp3');

const levelSounds = {
  1: new Audio('sounds/level1.mp3'),
  2: new Audio('sounds/level2.mp3'),
  3: new Audio('sounds/level3.mp3'),
  4: new Audio('sounds/level4.mp3'),
  5: new Audio('sounds/level5.mp3'),
  6: new Audio('sounds/level6.mp3')

};
   function startGame() {
  if (soundOn) clickSound.play();

  document.getElementById("startScreen").style.display = "none";

  loadProgress(); 

  if (level === 5) {
    renderLevel5Stage(); 
    return;
  }

  if (level === 6) {
    renderLevel6Stage();
    return;
  }

  document.getElementById("gameContainer").style.display = "block";
  updateBackground(level); 
  startTimer();
  updateLivesDisplay();
}

    let level = 1;
    let maxNumber = 20;
    let randomNumber = Math.floor(Math.random() * maxNumber) + 1;
    let attempts = 0;
    let lives = 5;
    let score = 0;
    let timer;
    let timeLeft = 50;

function getLevelData(level) {
  switch (level) {
    case 1:
      return { max: 20, lives: 5, title: "Level 1: The Beginning " };
    case 2:
      return { max: 30, lives: 5, title: "Level 2: Dark Forest " };
    case 3:
      return { max: 50, lives: 5, title: "Level 3: Dragon's Den 🐦‍🔥" };
    case 4:
      return { max: 70, lives: 5, title: "Level 4: Crystal Gate " };
    default:
      return { max: 100, lives: 5, title: "Level 5: Follow the Intuition" };
  }
}


    function updateLivesDisplay() {
      const heart = "❤️";
      document.getElementById("lives").innerText = heart.repeat(lives);
    }

function updateBackground(level) {
  document.body.className = `level-${level}`;

  
  Object.values(levelSounds).forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });

  
  if (levelSounds[level]) {
    levelSounds[level].loop = true;
    levelSounds[level].play().catch((err) => {
      console.warn("🔇 Level sound autoplay was blocked:", err);
    });
  }


  
  if (soundOn && levelSounds[level]) {
    levelSounds[level].loop = true;
    levelSounds[level].play();
  }
  
}

    function startTimer() {
      clearInterval(timer);
      document.getElementById("timer").innerText = `⏱ Time left: ${timeLeft}s`;
      timer = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = `⏱ Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
          clearInterval(timer);
          lives--;
          updateLivesDisplay();
          const message = document.getElementById("message");
          if (lives <= 0) {
            clearInterval(timer);
            message.innerHTML = `👻 Game Over! You lost all lives.<br>✅ The correct number was: ${randomNumber}`;
            message.style.color = "black";
            document.getElementById("gameButton").disabled = true;

            showSummary();


            return;
          } else {
            message.innerHTML = translations[currentLang].timeUp;
            message.style.color = "orange";
            startTimer();
          }
        }
      }, 1000);
    }

    function saveProgress() {
      localStorage.setItem("highScore", score);
      localStorage.setItem("lastLevel", level);
      localStorage.setItem("completedLevel", level - 1);
    }

  function loadProgress() {
  const savedScore = localStorage.getItem("highScore");
  const completedLevel = localStorage.getItem("completedLevel");

  if (savedScore) {
    score = parseInt(savedScore);
    document.getElementById("score").innerText = `${translations[currentLang].highScore}: ${score}`;
  }

  if (completedLevel) {
    level = parseInt(completedLevel) + 1;
    const data = getLevelData(level);
    maxNumber = data.max;
    randomNumber = Math.floor(Math.random() * maxNumber) + 1;
   document.getElementById("levelTitle").innerText = translations[currentLang][`level${level}`];
   document.getElementById("levelStory").innerText = `Guess a number between 1 and ${maxNumber}`;

    document.getElementById("guessInput").setAttribute("max", maxNumber);
  }

  updateBackground(level); 
}
    function checkGuess() {
      const userGuess = Number(document.getElementById("guessInput").value);
      const message = document.getElementById("message");

      if (!userGuess) {
       message.innerHTML = translations[currentLang].enterNumber;
        return;
      }

      attempts++;

      if (userGuess === randomNumber) {
        clearInterval(timer);
        
        const earnedPoints = Math.max(10 - attempts + 1, 1);
score += earnedPoints;

if (level === 1) level1Score += earnedPoints;
if (level === 2) level2Score += earnedPoints;
if (level === 3) level3Score += earnedPoints;
if (level === 4) level4Score += earnedPoints;
        saveProgress();
        document.getElementById("score").innerText = `🏆 High Score: ${score}`;
        message.innerHTML = translations[currentLang].correct(attempts);
        message.style.color = "green";

      if (level === 4) {
    setTimeout(() => {
      level = 5;
      document.getElementById("gameContainer").style.display = "none";
      renderLevel5Stage();
    }, 2000);
  } else {
    setTimeout(() => {
      level++;
      const next = getLevelData(level);
      maxNumber = next.max;
      randomNumber = Math.floor(Math.random() * maxNumber) + 1;
      attempts = 0;
      updateBackground(level);
      timeLeft = level === 2 ? 60 : level === 3 ? 70 : 60 + level * 5;
      lives = next.lives || 5;
      document.getElementById("levelTitle").innerText = next.title;
      document.getElementById("levelStory").innerText = `Guess a number between 1 and ${maxNumber}`;
      message.innerHTML = "";
      document.getElementById("guessInput").value = "";
      document.getElementById("guessInput").setAttribute("max", maxNumber);
            startTimer();
      updateLivesDisplay();
    }, 2000);
  }

 } else {
        lives--;
        updateLivesDisplay();

        if (lives <= 0) {
          clearInterval(timer);
           Object.values(levelSounds).forEach(sound => {
    sound.pause();
    sound.currentTime = 0;
  });

  
  if (soundOn) failSound.play();


  
         message.innerHTML = translations[currentLang].gameOver(randomNumber);
          message.style.color = "black";
          document.getElementById("gameButton").disabled = true;


          showSummary();
          return;
        }

        if (userGuess > randomNumber) {
          message.innerHTML = translations[currentLang].tooHigh;
          message.style.color = "red";
        } else {
          message.innerHTML = translations[currentLang].tooLow;
          message.style.color = "red";
        }
      }
    }

    function resetProgress() {
      localStorage.clear();
      location.reload();
    }
function jumpToLevel(n) {
  level = n;
  localStorage.setItem("completedLevel", n - 1);
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("level5Container").style.display = "none";
  document.getElementById("level6Container").style.display = "none";

  if (level === 5) {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "none";
    renderLevel5Stage(); 
    return;
  }
  if (level === 6) {
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameContainer").style.display = "none";
    document.getElementById("level5Container").style.display = "none";
    renderLevel6Stage(); 
    return;
  }
  
  const next = getLevelData(level);
  maxNumber = next.max;
  randomNumber = Math.floor(Math.random() * maxNumber) + 1;
  attempts = 0;
  lives = next.lives || 5;
  timeLeft = 60 + level * 5;
  
  document.body.className = `level-${level}`;
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";
  document.getElementById("levelTitle").innerText = next.title;
  document.getElementById("levelStory").innerText = `Guess a number between 1 and ${maxNumber}`;
  document.getElementById("guessInput").setAttribute("max", maxNumber);
  document.getElementById("guessInput").value = "";
  document.getElementById("message").innerHTML = "";
  
  updateBackground(level);
  updateLivesDisplay();
  startTimer();
}

 

      if (level === 5) {
    renderLevel5Stage();
  }


    function closeModal() {
      document.getElementById("victoryModal").style.display = "none";
    }

    // Initialize
    loadProgress();
    startTimer();
    updateLivesDisplay();
    function renderLevel5Stage() {
      document.getElementById("startScreen").style.display = "none";
      document.getElementById("gameContainer").style.display = "none";
      document.getElementById("level6Container").style.display = "none";
      document.getElementById("level5Container").style.display = "block";
  document.body.className = `level-5`;
  updateBackground(5);

  const numberOptions = document.getElementById("numberOptions");
  const level5Message = document.getElementById("level5Message");

  function updateLevel5Score(points) {
    level5Score += points;
    document.getElementById("level5ScoreValue").innerText = level5Score;
  }

  function renderOptions(start, end) {
    numberOptions.innerHTML = '';
    const options = new Set();

    correct = Math.floor(Math.random() * (end - start + 1)) + start;
    options.add(correct);

    while (options.size < 3) {
      options.add(Math.floor(Math.random() * (end - start + 1)) + start);
    }

    const shuffled = Array.from(options).sort(() => 0.5 - Math.random());

    shuffled.forEach(num => {
      const btn = document.createElement("button");
      btn.textContent = num;
      btn.classList.add("option-btn");
      btn.disabled = false;
      btn.addEventListener("click", () => handleChoice(num));
      numberOptions.appendChild(btn);
    });
  }

  function startLevel5Timer() {
    clearInterval(level5TimerInterval);
    level5Time = 30;
    document.getElementById("level5Time").innerText = level5Time;

    level5TimerInterval = setInterval(() => {
      level5Time--;
      document.getElementById("level5Time").innerText = `🕐 ${level5Time}s`;


      if (level5Time <= 0) {
        clearInterval(level5TimerInterval);
        level5Lives--;
        document.getElementById("level5Lives").textContent = "❤️".repeat(level5Lives);
        level5Message.textContent = translations[currentLang].level5TimeUp;
        if (level5Lives <= 0) {
          numberOptions.innerHTML = "";
          level5Message.textContent = translations[currentLang].level5GameOver;
          showSummary();
        
        } else {
          setTimeout(() => {
            renderOptions(rangeStart, rangeEnd);
            startLevel5Timer();
          }, 1500);
        }
      }
    }, 1000);
  }

  function handleChoice(choice) {
    clearInterval(level5TimerInterval);

    const buttons = document.querySelectorAll("#numberOptions button");
    buttons.forEach(btn => btn.disabled = true);

    if (choice === correct) {
    level5Message.textContent = translations[currentLang].level5Correct + correct;
      updateLevel5Score(10);

      setTimeout(() => {
        if (rangeStart === 1) {
          rangeStart = 51;
          rangeEnd = 100;
        } else if (rangeStart === 51) {
          rangeStart = 101;
          rangeEnd = 200;
  } else {
  level5Message.textContent = translations[currentLang].level5Passed;
  setTimeout(() => {
    document.getElementById("level5Container").style.display = "none";
    level = 6; 
    renderLevel6Stage(); 
  }, 1500);
  return;
}

        renderOptions(rangeStart, rangeEnd);
        startLevel5Timer();
      }, 2000);
    } else {
      level5Lives--;
      document.getElementById("level5Lives").textContent = "❤️".repeat(level5Lives);
      level5Message.textContent = translations[currentLang].level5Wrong + correct;

      if (level5Lives <= 0) {
        numberOptions.innerHTML = "";
        level5Message.textContent = `💀 Game Over! The correct number was: ${correct}`;
        document.getElementById("restartLevel5Btn").classList.remove("hidden");
        showSummary();
      } else {
        setTimeout(() => {
          renderOptions(rangeStart, rangeEnd);
          startLevel5Timer();
        }, 2000);
      }
    }
  }

  const startBtn = document.getElementById("startBtn");

  startBtn.onclick = () => {
    startBtn.style.display = "none"; 
    document.getElementById("level5Lives").classList.remove("hidden");
    document.getElementById("level5Time").classList.remove("hidden");
    document.getElementById("level5ScoreValue").classList.remove("hidden");
    renderOptions(rangeStart, rangeEnd);
    startLevel5Timer();
  };
}
let level6Lives = 3;
let level6Time = 5; 
let level6Timer;
let level6Correct; 
let level6HiddenBoxIndex; 



function renderLevel6Stage() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("level5Container").style.display = "none";
  document.getElementById("level6Container").style.display = "block";

  document.body.className = "level-6";
    updateBackground(6);

  document.getElementById("level6Message").textContent = "";
  document.getElementById("level6Boxes").innerHTML = "";
  document.getElementById("level6Lives").textContent = "";
  document.getElementById("level6Time").textContent = "";

  const startBtn = document.getElementById("level6StartBtn");
  startBtn.style.display = "inline-block";
  startBtn.onclick = startLevel6;
}

function startLevel6() {
  document.getElementById("level6StartBtn").style.display = "none";
  level6Lives = 3;
  document.getElementById("level6Lives").textContent = "❤️❤️❤️";
  document.getElementById("level6Message").textContent = "";
  setupLevel6Round();
}

function setupLevel6Round() {
  const boxesContainer = document.getElementById("level6Boxes");
  boxesContainer.innerHTML = "";

 
  level6Correct = Math.floor(Math.random() * (rangeEnd - rangeStart + 1)) + rangeStart;
  
  
  level6HiddenBoxIndex = Math.floor(Math.random() * 3);

  for (let i = 0; i < 3; i++) {
    const box = document.createElement("button");
    box.textContent = "";
    box.style.fontSize = "40px";
    box.style.width = "80px";
    box.style.height = "80px";
    box.onclick = () => checkLevel6Box(i, box);
    boxesContainer.appendChild(box);
  }

  level6Time = 5;
  startLevel6Timer();
}



function checkLevel6Box(index, box) {
  clearInterval(level6Timer);

  if (index === level6HiddenBoxIndex) {
    box.textContent = level6Correct;
    box.style.color = "black";

    level6Score += 10;
    document.getElementById("level6ScoreValue").textContent = `🏆Score: ${level6Score}`;
     

document.getElementById("level6Message").textContent = translations[currentLang].level6Correct;
  if (level6Score >= 50) {
    document.getElementById("level6Message").textContent = "🏆 You completed Level 6!";
    document.getElementById("restartLevel6Btn").classList.remove("hidden");
    showSummary();
    return;
  }

    setTimeout(() => {
      document.getElementById("level6Message").textContent = "";
      setupLevel6Round();
    }, 1000);

  } else {
    box.textContent = "❌";
    box.style.color = "red";

    level6Lives--;
    document.getElementById("level6Lives").textContent = "❤️".repeat(level6Lives);

    if (level6Lives <= 0) {
      document.getElementById("level6Message").textContent = translations[currentLang].level6GameOver;
        document.getElementById("restartLevel6Btn").classList.remove("hidden");
      showSummary();
    } else {
document.getElementById("level6Message").textContent = translations[currentLang].level6Wrong;
      setTimeout(() => {
        document.getElementById("level6Message").textContent = "";
        setupLevel6Round();
      }, 1000);
    }
  }
}



function startLevel6() {
  document.getElementById("level6StartBtn").style.display = "none";
  
  
  level6Lives = 3;
  level6Score = 0; 


  document.getElementById("level6Lives").textContent = "❤️❤️❤️";
  document.getElementById("level6Message").textContent = "";

  
  document.getElementById("level6ScoreValue").style.display = "block";
  document.getElementById("level6ScoreValue").textContent = `🏆Score: ${level6Score}`;
  
 
  setupLevel6Round();
}

function showSummary() {
  const score1to4 = level1Score + level2Score + level3Score + level4Score;

  document.getElementById("level1Score").textContent = `Level 1–4: ${score1to4} pts`;
  document.getElementById("level5Score").textContent = `Level 5: ${level5Score} pts`;
  document.getElementById("level6FinalScore").textContent = `Level 6: ${level6Score} pts`;
  document.getElementById("totalScore").textContent = `🏆 Total: ${score1to4 + level5Score + level6Score} pts`;

  document.getElementById("summaryModal").style.display = "block";
}


function closeSummary() {
  document.getElementById("summaryModal").style.display = "none";
}


document.addEventListener('DOMContentLoaded', function () {
  const savedLang = localStorage.getItem("lang") || "en";
  currentLang = savedLang;
  changeLanguage(savedLang);
  document.getElementById("langSelect").value = savedLang;
});