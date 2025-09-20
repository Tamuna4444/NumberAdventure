/* === PERSISTENT SESSION STATE (scores/lives/level) === */
const STATE_KEY = 'ng_state_v1';

let state = {
  currentLevel: 1,
  lives: 3, // თუ იყენებ
  levelScores: { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 },
};

function loadState() {
  try {
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    // merge defensively
    state = {
      ...state,
      ...saved,
      levelScores: { ...state.levelScores, ...(saved.levelScores || {}) },
    };
  } catch(e){}
}

function saveState() {
  try {
    sessionStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch(e){}
}

function clearState() {
  sessionStorage.removeItem(STATE_KEY);
}

function getTotalScore() {
  return Object.values(state.levelScores).reduce((a,b)=>a+(b||0),0);
}

function setScoreUI(total){
  document.querySelectorAll('#scoreLabel, #totalScore, #scoreLabelL5, .scoreLabel')
    .forEach(el => el.textContent = String(total));
}

/* ქულების დამატება — ყოველთვის ინახავს sessionStorage-ში და აახლებს ჯამს */
function addPoints(points, lvl){
  const L = lvl || state.currentLevel;
  state.levelScores[L] = (state.levelScores[L] || 0) + (points||0);
  saveState();
  setScoreUI(getTotalScore());
}

/* ლეველზე გადასვლისას — მხოლოდ currentLevel ინახება. ქულებს არ ვეხებით. */
function goToLevel(n){
  state.currentLevel = n;
  saveState();
}

/* სრულ რესტარტზე — მარტო აქ ნულდება ქულები! */
function restartGameFull(){
  clearState();
  state = { currentLevel: 1, lives: 3, levelScores: {1:0,2:0,3:0,4:0,5:0,6:0} };
  saveState();
  setScoreUI(0);
}




let currentLang = localStorage.getItem("lang") || "en";

const translations = {
  en: {
    title: "Guess the Number",
    start: "Start",
    level: "Level",
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
    scoreLabel: "🏆 High Score:",
    levelScoreLabel: "🏆 Score:",
    level1to4: "Level 1–4",
    level5Label: "Level 5",
    level6Label: "Level 6",
    total: "🏆 Total",
    check: "Check",
    reset: "Reset Game",
    gameTitle: "Guess the Number!",
    levelTitle: "Level 1: The Beginning",
    levelStory: "Guess a number between 1 and 20",
    finalScore: "🎉 Final Score!",
    close: "Close",
    guessRange: (max) => `Guess a number between 1 and ${max}`,
    restartLevel: "Restart Level",
    score: "Score",
    mainMenu: " Main Menu"
  },

  ru: {
    title: "Угадай число",
    start: "Начать",
    level: "Уровень",
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
    scoreLabel: "🏆 Рекорд:",
    levelScoreLabel: "🏆 Очки:",
    level1to4: "Уровни 1–4",
    level5Label: "Уровень 5",
    level6Label: "Уровень 6",
    total: "🏆 Всего",
    check: "Проверить",
    reset: "Сбросить игру",
    gameTitle: "Угадай число!",
    levelTitle: "Уровень 1: Начало",
    levelStory: "Угадай число от 1 до 20",
    finalScore: "🎉 Финальный счёт!",
    close: "Закрыть",
    guessRange: (max) => `Угадай число от 1 до ${max}`,
    restartLevel: "Сбросить уровень",
    score: "Очки",
     mainMenu: "Главное меню"
  }
};


function changeLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");

    
    if (key === "levelTitle" || key === "levelStory") return;

    const tr = translations[lang][key];
    if (typeof tr === "function") el.textContent = tr(0);
    else if (tr) el.textContent = tr;
  });

 
  document.querySelectorAll(".levelBtn").forEach((btn) => {
    const n = btn.getAttribute("data-level");
    btn.textContent = `${translations[lang].level} ${n}`;
  });

  
  const dataNow = getLevelData(level);
  if (dataNow) {
    const t = document.getElementById("levelTitle");
    const s = document.getElementById("levelStory");
    if (t) t.innerText = dataNow.title[lang];
    if (s) s.innerText = dataNow.story[lang];
  }

  
  const l5 = getLevelData(5);
  const l5t = document.querySelector('[data-i18n="level5Title"]');
  const l5s = document.querySelector('[data-i18n="level5Subtitle"]');
  if (l5 && l5t) l5t.innerText = l5.title[lang];
  if (l5 && l5s) l5s.innerText = l5.story[lang];

  const l6 = getLevelData(6);
  const l6t = document.getElementById("level6Title");
  const l6s = document.getElementById("level6Story");
  if (l6 && l6t) l6t.innerText = l6.title[lang];
  if (l6 && l6s) l6s.innerText = l6.story[lang];
}
 
function applyTranslations() {
  try { changeLanguage(currentLang); } catch (e) {}
}
function updateLevelLocks() {
const unlockedLevel = 999;
//const unlockedLevel = parseInt(localStorage.getItem("unlockedLevel")) || 1; 


  document.querySelectorAll(".levelBtn").forEach((btn) => {
    const levelNum = parseInt(btn.getAttribute("data-level"));

    if (levelNum <= unlockedLevel) {
      btn.classList.remove("locked");
      btn.disabled = false;
    } else {
      btn.classList.add("locked");
      btn.disabled = true;
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
  loadState();
  setScoreUI(getTotalScore());
 
  const settingsBtn = document.getElementById('settingsBtn');
  const toggleSound = document.getElementById('toggleSound');
  const toggleVibration = document.getElementById('toggleVibration');
  const settingsPanel = document.getElementById('settingsPanel');


    settingsBtn.addEventListener("click", () => {
    console.log("⚙️ settingsBtn clicked!"); 
    settingsPanel.classList.toggle("hidden");
    });
      const guessInput = document.getElementById("guessInput");
      const messageEl  = document.getElementById("message");

  if (guessInput && messageEl) {
    const clearFeedback = () => {
      messageEl.textContent = "";   // წაშლის წინა ტექსტს
    };

    guessInput.addEventListener("input", clearFeedback);
    guessInput.addEventListener("focus", clearFeedback);
  }
  



  toggleSound.addEventListener('click', () => {
    soundOn = !soundOn;
    toggleSound.textContent = soundOn ? '🔊' : '🔇';
   if (!soundOn) {
    Object.values(levelSounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
    startSound.pause();
    clickSound.pause();
    failSound.pause();
  } else {
    
    if (levelSounds[level]) {
      levelSounds[level].loop = true;
      levelSounds[level].play();
    }
  } 
  });

  toggleVibration.addEventListener('click', () => {
    vibrationOn = !vibrationOn;
    toggleVibration.textContent = vibrationOn ? '📳' : '❌';
  });
});
const restartGame5Btn = document.getElementById("restartGame5Btn");
  if (restartGame5Btn) {
    restartGame5Btn.addEventListener("click", (e) => {
      e.preventDefault();
      resetProgress();   
    });
  }




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
     restartGameFull(); 
  if (soundOn) clickSound.play();

  timeLeft = 50;

  document.getElementById("startScreen").style.display = "none";

  level = 1;
  const data = getLevelData(level);
  maxNumber = data.max;
  randomNumber = Math.floor(Math.random() * maxNumber) + 1;
  attempts = 0;
  lives = data.lives || 5;
  timeLeft = data.time || 50;

  document.getElementById("gameContainer").style.display = "block";
  document.getElementById("levelTitle").innerText = data.title[currentLang];
  document.getElementById("levelStory").innerText = data.story[currentLang];
  document.getElementById("guessInput").setAttribute("max", maxNumber);
  document.getElementById("guessInput").value = "";
  document.getElementById("message").innerHTML = "";
  document.getElementById("gameButton").disabled = false;

  updateBackground(level); 
  updateLivesDisplay();    
  startTimer();

    const gameBtn = document.getElementById("gameButton");
  if (gameBtn) {
    gameBtn.disabled = false;
    gameBtn.onclick = checkGuess;
  }

  applyTranslations();



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
    let timeLeft = 50



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

  if (soundOn && levelSounds[level]) {
    levelSounds[level].loop = true;
    levelSounds[level].play().catch(err => {
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
      timer = setInterval(() => {
        timeLeft--;

        const timeLabel = translations[currentLang].timerLabel || "⏱️ Time left:";
        document.getElementById("timer").innerHTML = `${timeLabel} ${timeLeft}s`;

        if (timeLeft <= 0) {
          clearInterval(timer);
        

          
          const message = document.getElementById("message");

          if (lives <= 1) {
            lives--;
            updateLivesDisplay();

            message.innerHTML = translations[currentLang].timeUp;
            message.style.color = "orange";
            timeLeft = 50; 
            startTimer();
          } else {
            lives = 0;
            updateLivesDisplay();
    
            message.innerHTML = translations[currentLang].gameOver(randomNumber);
            message.style.color = "white";
            document.getElementById("gameButton").disabled = true;
            showSummary();
          }
        }
      }, 1000);
    }

    function saveProgress() {
     // localStorage.setItem("highScore", score);
      localStorage.setItem("lastLevel", level);
      localStorage.setItem("completedLevel", level - 1);


    }

 function loadProgress() {
  // აღარ ვტვირთავთ highScore-ს
  const completedLevel = localStorage.getItem("completedLevel");

  if (completedLevel) {
    level = parseInt(completedLevel) + 1;
    const data = getLevelData(level);
    maxNumber = data.max;
    randomNumber = Math.floor(Math.random() * maxNumber) + 1;

    document.getElementById("levelTitle").innerText = getLevelData(level).title[currentLang];
    document.getElementById("levelStory").innerText = translations[currentLang].guessRange(maxNumber);
    document.getElementById("guessInput").setAttribute("max", maxNumber);
  }

  // UI მენიუზე და საწყისი ქულა ეკრანზე 0
  const sv = document.getElementById("scoreValue");
  if (sv) sv.textContent = "0";

  document.body.className = "menu";
}


function calculatePoints(level, attempts) {
  if (level === 1) {
    return (attempts <= 2) ? 20 : 10;
  }
  if (level === 2) {
    return (attempts <= 2) ? 50 : 40;
  }
  if (level === 3) {
    return (attempts <= 2) ? 100 : 80;
  }
  if (level === 4) {
    return (attempts <= 2) ? 150 : 120;
  }
  // Level 5 და 6 – სურვილისამებრ, შეგიძლია აქეც დაამატო ცალკე ლოგიკა
  return 10;
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
        
        
        
        const earnedPoints = calculatePoints(level, attempts);
            addPoints(earnedPoints, level);  // ქულა ჩაიწეროს state-ში
    document.getElementById("scoreValue").textContent = String(getTotalScore()); 
    score = getTotalScore(); // სურვილისამებრ, რომ score ცვლადიც იგივე იყოს



       
      

if (level === 1) level1Score += earnedPoints;
if (level === 2) level2Score += earnedPoints;
if (level === 3) level3Score += earnedPoints;
if (level === 4) level4Score += earnedPoints;

        saveProgress();
        document.getElementById("scoreValue").textContent = score;

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

  timeLeft = next.time || 50;        
  lives = next.lives || 1;    
      


  localStorage.setItem("completedLevel", level - 1);

     updateLevelLocks();


     document.getElementById("levelTitle").innerText = next.title[currentLang];

     document.getElementById("levelStory").textContent = next.story[currentLang];
     

   
     message.innerHTML = "";
     document.getElementById("guessInput").value = "";
     document.getElementById("guessInput").setAttribute("max", maxNumber);
   
     document.getElementById("gameButton").disabled = false;
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
          message.style.color = "white";
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
  const savedLang = localStorage.getItem("lang");
  localStorage.clear();
  if (savedLang) {
    localStorage.setItem("lang", savedLang);
  }
  location.reload();
}
function restartLevel() {
  
  try { clearInterval(timer); } catch (_) {}
  try { clearInterval(level5TimerInterval); } catch (_) {}
  try { clearInterval(level6Timer); } catch (_) {}

 
  try {
    Object.values(levelSounds).forEach(s => { s.pause(); s.currentTime = 0; });
  } catch (_) {}
  const msg = document.getElementById("message");
  if (msg) msg.innerHTML = "";
  jumpToLevel(level);
}

 
function jumpToLevel(n) {
  
  goToLevel(n);
  level = n;
  localStorage.setItem("completedLevel", n - 1);
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("level5Container").style.display = "none";
  document.getElementById("level6Container").style.display = "none";

  
  if (level === 5) {
    document.getElementById("startScreen").style.display = "none";
    renderLevel5Stage();
    return;
  }
  if (level === 6) {
    document.getElementById("startScreen").style.display = "none";
    renderLevel6Stage();
    return;
  }

  
  const next = getLevelData(level);
  maxNumber = next.max;
  randomNumber = Math.floor(Math.random() * maxNumber) + 1;
  attempts = 0;
  lives = next.lives || 5;

  
  timeLeft = (level === 1) ? 50 : (40 + level * 5);

  
  document.body.className = `level-${level}`;
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "block";
  document.getElementById("levelTitle").innerText = next.title[currentLang];
  document.getElementById("levelStory").innerText = next.story[currentLang];

  const input = document.getElementById("guessInput");
  input.setAttribute("max", maxNumber);
  input.value = "";
  document.getElementById("message").innerHTML = "";

  updateBackground(level);
  updateLivesDisplay();
  startTimer();

  
  const gameBtn = document.getElementById("gameButton");
  if (gameBtn) {
    gameBtn.disabled = false;     
    gameBtn.onclick = null;       
    gameBtn.addEventListener("click", checkGuess, { once: false });
  }

  
  input?.focus();

  applyTranslations(); 
}
function goToMainMenu() {
  // 1) გააჩერე ყველა ტაიმერი
  try { clearInterval(timer); } catch(_) {}
  try { clearInterval(level5TimerInterval); } catch(_) {}
  try { clearInterval(level6Timer); } catch(_) {}

  // 2) გააჩერე ყველა ხმა და დააბრუნე დასაწყისში
  try {
    Object.values(levelSounds).forEach(s => { s.pause(); s.currentTime = 0; });
    startSound.pause(); startSound.currentTime = 0;
    clickSound.pause(); clickSound.currentTime = 0;
    failSound.pause();  failSound.currentTime  = 0;
  } catch(_) {}

  // 3) body-ის კლასი ზუსტად "menu" იყოს (და მხოლოდ ის)
  document.body.className = "";
  document.body.classList.add("menu");

  // 4) დამალე ყველა ლეველის UI
  ["gameContainer","level5Container","level6Container","summaryModal"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // 5) აჩვენე მთავარი მენიუ
  const start = document.getElementById("startScreen");
  if (start) {
    start.style.display = "block";
    start.scrollTop = 0; // ზედა ნაწილში დაბრუნება
  }

  // 6) ლოკები/ტექსტები განახლდეს ამჟამად არჩეული ენით
  try { updateLevelLocks(); } catch(_) {}
  try { applyTranslations(); } catch(_) {}
}
 
  function completeLevel(currentLevel) {
    const nextLevel = currentLevel + 1;
    level = nextLevel;
    localStorage.setItem("completedLevel", currentLevel);
    jumpToLevel(nextLevel);
  }

    function closeModal() {
      document.getElementById("victoryModal").style.display = "none";
    }

    
    loadProgress();
   
    updateLivesDisplay();

function renderLevel5Stage() {
  
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("level6Container").style.display = "none";
  document.getElementById("level5Container").style.display = "block";

  document.body.className = "level-5";
  updateBackground(5);

  
  const data = getLevelData(5);
  document.querySelector('[data-i18n="level5Title"]').innerText = data.title[currentLang];
  document.querySelector('[data-i18n="level5Subtitle"]').innerText = data.story[currentLang];

 
  const numberOptions = document.getElementById("numberOptions");
  const level5Message = document.getElementById("level5Message");

  

  
 function updateLevel5Score(points) {
         
  addPoints(points, 5);         // საერთო state-ში ჩაიწეროს
  document.getElementById("level5ScoreNum").innerText = String(getTotalScore()); // ეკრანზე – ჯამი

  const total = getTotalScore();
  const scoreValue = document.getElementById("scoreValue");
  if (scoreValue) scoreValue.textContent = String(total);
}
  

  function renderOptions(start, end) {
    numberOptions.innerHTML = "";
    const options = new Set();

    
    correct = Math.floor(Math.random() * (end - start + 1)) + start;
    options.add(correct);

    
    while (options.size < 3) {
      options.add(Math.floor(Math.random() * (end - start + 1)) + start);
    }

   
    const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

    
    shuffled.forEach((num) => {
      const btn = document.createElement("button");
      btn.textContent = num;
      btn.classList.add("option-btn");
      btn.onclick = () => handleChoice(num);
      numberOptions.appendChild(btn);
    });
  }

  function startLevel5Timer() {
    try { clearInterval(level5TimerInterval); } catch (_) {}
    level5Time = 30;
    document.getElementById("level5Time").innerText = `🕐 ${level5Time}s`;

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
          level5Message.textContent = translations[currentLang].level5GameOver + correct;
          
          
          showSummary();
          return;
        }

        
        setTimeout(() => {
          renderOptions(rangeStart, rangeEnd);
          startLevel5Timer();
        }, 1200);
      }
    }, 1000);
  }

  function handleChoice(choice) {
    try { clearInterval(level5TimerInterval); } catch (_) {}

    
    numberOptions.querySelectorAll("button").forEach(b => b.disabled = true);

    if (choice === correct) {
      level5Message.textContent = translations[currentLang].level5Correct + correct;
      updateLevel5Score(10);

      setTimeout(() => {
        level5Message.textContent = "";
        
        if (rangeStart === 1) {
          rangeStart = 51; rangeEnd = 100;
        } else if (rangeStart === 51) {
          rangeStart = 101; rangeEnd = 200;
         } else if (rangeStart === 101) {
        if (level5Lives > 0) {
          rangeStart = 1; rangeEnd = 50;
        } else {
          level5Message.textContent = translations[currentLang].level5GameOver;
          showSummary();
          return;
        }
      }

        renderOptions(rangeStart, rangeEnd);
        startLevel5Timer();
      }, 900);
    } else {
      level5Lives--;
      document.getElementById("level5Lives").textContent = "❤️".repeat(level5Lives);
      level5Message.textContent = translations[currentLang].level5Wrong + correct;

     if (level5Lives <= 0) {
      numberOptions.innerHTML = "";
      level5Message.textContent = translations[currentLang].level5GameOver + correct;
      const r5 = document.getElementById("restartLevel5Btn");
      r5 && r5.classList.remove("hidden");
      const rg5 = document.getElementById("restartGame5Btn");
      rg5 && rg5.classList.remove("hidden");
        showSummary();
      } else {
        setTimeout(() => {
           level5Message.textContent = "";
          renderOptions(rangeStart, rangeEnd);
          startLevel5Timer();
        }, 1200);
      }
    }
  }

 
  const startBtn = document.getElementById("startBtn");
  startBtn.onclick = () => {
    startBtn.style.display = "none";
    document.getElementById("level5Lives").classList.remove("hidden");
    document.getElementById("level5Time").classList.remove("hidden");
    document.getElementById("level5ScoreValue").classList.remove("hidden");

    
    rangeStart = 1; rangeEnd = 50;
    level5Lives = 3;
    level5Score = 0;
    
    document.getElementById("level5Lives").textContent = "❤️❤️❤️";
  document.getElementById("level5ScoreNum").innerText = String(getTotalScore());
    level5Message.textContent = "";

    renderOptions(rangeStart, rangeEnd);
    startLevel5Timer();
  };

  
  const restartLevel5Btn = document.getElementById("restartLevel5Btn");
  if (restartLevel5Btn) {
    restartLevel5Btn.type = "button";
    restartLevel5Btn.classList.remove("hidden");
    restartLevel5Btn.style.display = "inline-block";
    restartLevel5Btn.onclick = (e) => {
      e.preventDefault();

      
      try { clearInterval(level5TimerInterval); } catch (_) {}
      rangeStart = 1; rangeEnd = 50;
      level5Lives = 3;
      
      level = 5;

     
      numberOptions.innerHTML = "";
      level5Message.textContent = "";
      renderLevel5Stage();
    };
  }
}
 

let level6Lives = 3;
let level6Time = 5; 
let level6Timer;
let level6Correct; 
let level6HiddenBoxIndex; 

let level6Wins = 0;
const LEVEL6_TARGET_WINS = 4;



function renderLevel6Stage() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("level5Container").style.display = "none";
  document.getElementById("level6Container").style.display = "block";

  document.body.className = "level-6";
    updateBackground(6);

    const data = getLevelData(6);
    document.getElementById("level6Title").innerText = data.title[currentLang];
    document.getElementById("level6Story").innerText = data.story[currentLang];

  document.getElementById("level6Message").textContent = "";
  document.getElementById("level6Boxes").innerHTML = "";
  document.getElementById("level6Lives").textContent = "";
  document.getElementById("level6Time").textContent = "";
   const timeEl = document.getElementById("level6Time");
  if (timeEl) { timeEl.textContent = ""; timeEl.style.display = "none"; }

  // score initially hidden (until start)
  document.getElementById("level6ScoreValue").style.display = "none";


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
  try { clearInterval(level6Timer); } catch(_) {}

  const boxesContainer = document.getElementById("level6Boxes");
  boxesContainer.innerHTML = "";

  // გამოიყენე Level 6-ის საკუთარი დიაპაზონი
  const { max } = getLevelData(6);
  level6Correct = Math.floor(Math.random() * max) + 1;

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
  startLevel6Timer(); // ← ეს ახლა ნამდვილად იარსებებს (შემდეგ ნაბიჯი)
}
function startLevel6Timer() {
  try { clearInterval(level6Timer); } catch (_) {}

  document.getElementById("level6Time").textContent = `⏱️ ${level6Time}s`;

  level6Timer = setInterval(() => {
    level6Time--;
    document.getElementById("level6Time").textContent = `⏱️ ${level6Time}s`;

    if (level6Time <= 0) {
      clearInterval(level6Timer);

    level6Lives--;

// ეკრანზე არ ჩამოვარდეს უარყოფითზე
document.getElementById("level6Lives").textContent = "❤️".repeat(Math.max(level6Lives, 0));

// თუ უკვე 0 იყო და კიდევ ერთ შეცდომას ვამატებთ → Game Over
if (level6Lives <=0) {
  document.getElementById("level6Message").textContent = translations[currentLang].level6GameOver;
  showSummary();
  return;
}

      setTimeout(() => {
        document.getElementById("level6Message").textContent = "";
        level6Time = 5;
        setupLevel6Round();
      }, 800);
    }
  }, 1000);
}


function checkLevel6Box(index, box) {
  clearInterval(level6Timer);

  if (index === level6HiddenBoxIndex) {
    box.textContent = level6Correct;
    box.style.color = "black";

 addPoints(10, 6);
document.getElementById("level6ScoreNum").textContent = String(getTotalScore());
   level6Wins += 1;  
if (level6Wins >= LEVEL6_TARGET_WINS) {
  document.getElementById("level6Message").textContent =
    `${translations[currentLang].level6Correct} (${level6Wins}/${LEVEL6_TARGET_WINS})`;
  setTimeout(() => {
    showSummary();
  }, 500);
  return;
}
     document.getElementById("level6Message").textContent = translations[currentLang].level6Correct;
  setTimeout(() => {
    document.getElementById("level6Message").textContent = "";
    setupLevel6Round();
  }, 700);
  } else {
    box.textContent = "❌";
    box.style.color = "red";

    level6Lives--;
  document.getElementById("level6Lives").textContent = "❤️".repeat(level6Lives);

  const allBoxes = document.querySelectorAll("#level6Boxes button");
  const correctBox = allBoxes[level6HiddenBoxIndex];
  correctBox.textContent = level6Correct;
  correctBox.style.color = "black";
  correctBox.style.border = "2px solid green";



 // UI—ზე 0 გულიდან ქვემოთ ნუ ჩავარდებით
document.getElementById("level6Lives").textContent = "❤️".repeat(Math.max(level6Lives, 0));

if (level6Lives <=0) {  
  document.getElementById("level6Message").textContent = translations[currentLang].level6GameOver;
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
  level6Wins  = 0; 


  document.getElementById("level6Lives").textContent = "❤️❤️❤️";
  document.getElementById("level6Message").textContent = "";

  
  document.getElementById("level6ScoreValue").style.display = "block";
  document.getElementById("level6ScoreNum").textContent = level6Score;

  setupLevel6Round();
}


function showSummary() {
  // გამოვიყენოთ state.levelScores, სადაც addPoints ინახავს ქულებს
  const s = state.levelScores || {};

  const score1to4 = (s[1]||0) + (s[2]||0) + (s[3]||0) + (s[4]||0);
  const l5        = (s[5]||0);
  const l6        = (s[6]||0);
  const total     = getTotalScore();

  document.getElementById("level1Score").textContent =
    `${translations[currentLang].level1to4}: ${score1to4} pts`;
  document.getElementById("level5Score").textContent =
    `${translations[currentLang].level5Label}: ${l5} pts`;
  document.getElementById("level6FinalScore").textContent =
    `${translations[currentLang].level6Label}: ${l6} pts`;
  document.getElementById("totalScore").textContent =
    `${translations[currentLang].total}: ${total} pts`;

  document.getElementById("summaryModal").style.display = "block";
}


function closeSummary() {
  document.getElementById("summaryModal").style.display = "none";
}


document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "ru";
  currentLang = savedLang;
  changeLanguage(savedLang);

  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.value = savedLang;
  }

  updateLevelLocks();

  document.querySelectorAll(".levelBtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!btn.classList.contains("locked")) {
        const levelNum = parseInt(btn.getAttribute("data-level"));
        jumpToLevel(levelNum);
      }
    });
  });

  
// Main Menu buttons (Level 1 / Level 5 / Level 6)
const mm1 = document.getElementById("mainMenuBtn1");
if (mm1) mm1.addEventListener("click", goToMainMenu);

const mm5 = document.getElementById("mainMenuBtn5");
if (mm5) mm5.addEventListener("click", goToMainMenu);

const mm6 = document.getElementById("mainMenuBtn6");
if (mm6) mm6.addEventListener("click", goToMainMenu);
 document.querySelectorAll(".langBtn").forEach(btn => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      changeLanguage(lang);
      localStorage.setItem("lang", lang);
    });
  });

}); // აქ იხურება DOMContentLoaded
function getLevelData(level) {
  const data = {
    1: {
      max: 20,
      lives: 5,
      title: {
        en: "Level 1: The Beginning",
        ru: "Уровень 1: Начало"
      },
      story: {
        en: "Guess a number between 1 and 20",
        ru: "Угадай число от 1 до 20"
      }
    },
    2: {
      max: 30,
      lives: 5,
      time: 50,
      title: {
        en: "Level 2: Dark Forest",
        ru: "Уровень 2: Тёмный лес"
      },
      story: {
        en: "Guess a number between 1 and 30",
        ru: "Угадай число от 1 до 30"
      }
    },
    3: {
      max: 50,
      lives: 5,
      title: {
        en: "Level 3: Dragon's Den",
        ru: "Уровень 3: Логово дракона"
      },
      story: {
        en: "Beware the fire! Guess from 1 to 50",
        ru: "Осторожно, дракон! Угадай от 1 до 50"
      }
    },
    4: {
      max: 70,
      lives: 5,
      title: {
        en: "Level 4: Spooky Forest",
        ru: "Уровень 4: Мистический лес"
      },
      story: {
        en: "Can you find your way? Guess 1 to 70",
        ru: "Найди путь! Угадай от 1 до 70"
      }
    },
    5: {
      max: 100,
      lives: 3,
      title: {
        en: "Level 5: Follow the Intuition",
        ru: "Уровень 5: Интуитивный выбор"
      },
      story: {
        en: "Choose the number that feels right",
        ru: "Выбери число, которому доверяешь"
      }
    },
    6: {
      max: 200,
      lives: 3,
      title: {
        en: "Level 6: Hidden Choice",
        ru: "Уровень 6: Скрытый выбор"
      },
      story: {
        en: "Find the hidden number",
        ru: "Найди спрятанное число"
      }
    }
  };

  return data[level];
}

function restartLevelTo(n) {
  
  try { clearInterval(timer); } catch(_) {}
  try { clearInterval(level5TimerInterval); } catch(_) {}
  try { clearInterval(level6Timer); } catch(_) {}

  attempts = 0;

  if (n === 5) {
    level = 5;
    
    rangeStart  = 1;
    rangeEnd    = 50;
    level5Lives = 3;
    level5Score = 0;

    
    renderLevel5Stage();

    
    requestAnimationFrame(() => {
      const startBtn = document.getElementById("startBtn");
      if (startBtn) startBtn.click();
    });
    return;
  }

  if (n === 6) {
    level = 6;
    level6Lives = 3;
    level6Score = 0;
    renderLevel6Stage();
    return;
  }

 
  level = n;
  jumpToLevel(n);
}


document.addEventListener("DOMContentLoaded", () => {
  const modalRestartLevelBtn = document.getElementById("restartLevelBtn");
  const modalRestartGameBtn  = document.getElementById("restartGameBtn");

  if (modalRestartLevelBtn) {
    modalRestartLevelBtn.addEventListener("click", () => {
      closeSummary();
        if (typeof level !== "undefined" && level === 5) {
      return restartLevelTo(5); 
    }
      restartLevel(); 
    });
  }
  if (modalRestartGameBtn) {
    modalRestartGameBtn.addEventListener("click", () => {
      closeSummary();
      restartGameFull();
      goToMainMenu();
    
    const start = document.getElementById("startScreen");
    if (start) start.style.display = "block";

    try { updateLevelLocks(); } catch(_) {}
    try { applyTranslations(); } catch(_) {}
      
    });
  }
});