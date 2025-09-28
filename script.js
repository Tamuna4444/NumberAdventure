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

// UI-ზე ჯამური ქულის გამოტანა (HUD + Level5/6 პატარა ქულები)
function setScoreUI(total){
  try {
    // მთავარი HUD:  <span id="scoreValue">...</span>
    const sv = document.getElementById('scoreValue');
    if (sv) sv.textContent = String(total);

    // Level 5 ბლოკის პატარა ქულა (არსებობისას)
    const l5 = document.getElementById('level5ScoreNum');
    if (l5) l5.textContent = String(total);

    // Level 6 ბლოკის პატარა ქულა (არსებობისას)
    const l6 = document.getElementById('level6ScoreNum');
    if (l6) l6.textContent = String(total);

    // სურვილისამებრ: თუ სადმე გაქვს .scoreValue კლასი
    document.querySelectorAll('.scoreValue').forEach(el => {
      el.textContent = String(total);
    });
  } catch (e) {}
}

/* ქულების დამატება — ყოველთვის ინახავს sessionStorage-ში და აახლებს ჯამს */
function addPoints(points, lvl){
  const L = lvl || state.currentLevel;
  state.levelScores[L] = (state.levelScores[L] || 0) + (points||0);
  saveState();
  setScoreUI(getTotalScore()); // ← ეს ტოვი
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
// Level 1 – ერთიან ფროუდ (1–20 → 1–30 → 1–50 → 1–70), UI-ში სათაურების გარეშე
const LEVEL1_PHASE_MAXES = [20, 30, 50, 70];
let level1Phase = 0; // 0..3



let currentLang = localStorage.getItem("lang") || "en";

const translations = {
  en: {
    title: "Guess the Number",
    start: "Start",
    level: "Level",
    level1: "Level 1",
    level2: "Level 2",
    level3: "Level 3",
    
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

  
const t = document.getElementById("levelTitle");
const s = document.getElementById("levelStory");
if (level === 1) {
  if (t) t.innerText = "";
  if (s) s.innerText = translations[lang].guessRange(typeof maxNumber === "number" ? maxNumber : 20);
} else {
const t = document.getElementById("levelTitle");
const s = document.getElementById("levelStory");
if (level === 1) {
  if (t) t.innerText = "";
  if (s) s.innerText = translations[lang].guessRange(typeof maxNumber === "number" ? maxNumber : 20);
} else {
  const dataNow = getLevelData(level);
  if (dataNow) {
    if (t) t.innerText = dataNow.title[lang];
    if (s) s.innerText = dataNow.story[lang];
  }
}
}

  
  const l5 = getLevelData(5);
  const l5t = document.querySelector('[data-i18n="level5Title"]');
  const l5s = document.querySelector('[data-i18n="level5Subtitle"]');
  if (l5 && l5t) l5t.innerText = l5.title[lang];
  if (l5 && l5s) l5s.innerText = l5.story[lang];

  
 const l3 = getLevelData(3);
const l6t = document.getElementById("level6Title");
const l6s = document.getElementById("level6Story");
if (l3 && l6t) l6t.innerText = l3.title[lang];
if (l3 && l6s) l6s.innerText = l3.story[lang];
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

let level5Score = 0;
let level5Part = 1; // 1=სამი ფანჯარა, 2=ოთხი ფანჯარა
let level6Score = 0;
let carryLives = 0; // დაგროვილი სიცოცხლეების ბონუსი



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
level1Phase = 0;
maxNumber = LEVEL1_PHASE_MAXES[level1Phase];
randomNumber = Math.floor(Math.random() * maxNumber) + 1;
attempts = 0;
lives = (getLevelData(1).lives || 5);
timeLeft = (getLevelData(1).time || 50);

document.getElementById("gameContainer").style.display = "block";
// 🔕 სათაურები გავთიშოთ Level 1-ზე — ვაჩვენოთ მხოლოდ დიაპაზონი
const tEl = document.getElementById("levelTitle");
const sEl = document.getElementById("levelStory");
if (tEl) tEl.innerText = "";
if (sEl) sEl.innerText = translations[currentLang].guessRange(maxNumber);
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

const t = document.getElementById("levelTitle");
const s = document.getElementById("levelStory");
if (level === 1) {
  if (t) t.innerText = "";
  if (s) s.innerText = translations[currentLang].guessRange(maxNumber);
} else {
  const dataNow = getLevelData(level);
  if (dataNow) {
    if (t) t.innerText = dataNow.title[currentLang];
    if (s) s.innerText = dataNow.story[currentLang];
  }
}
  }

 const sv = document.getElementById("scoreValue");
if (sv) sv.textContent = String(getTotalScore());

  document.body.className = "menu";
}


function calculatePoints(level, attempts) {
  if (level === 1) {
    return (attempts <= 2) ? 20 : 10;
  }

  // Level 5 და 6 – სურვილისამებრ, შეგიძლია აქეც დაამატო ცალკე ლოგიკა
  return 10;
}
// === L2 Stage2 config ===
const L2_STAGE2_LIFE_CAP = 10;

// "❤️" რენდერი — 10-ზე მეტი მოკლედ აჩვენოს
function renderHearts(n) {
  const v = Math.max(0, n|0);
  if (v <= 10) return "❤️".repeat(v);
  return `❤️ x${v}`;
}

// სიცოცხლის გადატანა მომდევნო სტეიჯში cap-ით
function carryLivesToNextStage(currentLives, nextMax) {
  const v = Math.max(0, currentLives || 0);
  return Math.max(1, Math.min(nextMax, v));
}
function calculatePointsPhase(phase, attempts){
  const lvl = phase + 1; // phase0≈L1, phase1≈L2, phase2≈L3, phase3≈L4
  if (lvl === 1) return (attempts <= 2) ? 20  : 10;
  if (lvl === 2) return (attempts <= 2) ? 50  : 40;
  if (lvl === 3) return (attempts <= 2) ? 100 : 80;
  if (lvl === 4) return (attempts <= 2) ? 150 : 120;
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
          // === NEW: Level 1 – გაერთიანებული დინება (1–20 → 1–30 → 1–50 → 1–70) ===
  if (level === 1) {
    // ქულა ფაზის მიხედვით Level 1-ში ჩაიწეროს
    const earnedPhasePoints = calculatePointsPhase(level1Phase, attempts);
    addPoints(earnedPhasePoints, 1);

    // მცირე მწვანე feedback
    const msg = document.getElementById("message");
    if (msg) { msg.innerHTML = translations[currentLang].correct(attempts); msg.style.color = "green"; }

    // გადავიდეთ შემდეგ დიაპაზონზე თუ ეს ბოლო არაა
    if (level1Phase < 3) {
      setTimeout(() => {
        level1Phase++;
        maxNumber    = LEVEL1_PHASE_MAXES[level1Phase];
        randomNumber = Math.floor(Math.random() * maxNumber) + 1;
        attempts = 0;

 // Level 1-ის პარამეტრები ხელახლა
const l1 = getLevelData(1);
timeLeft = l1.time || 50;

// ⚙️ ახალი მოთხოვნა: შემდეგი ფაზა იწყება "ბეისით" + წინა ფაზის დარჩენილი სიცოცხლეებით (cap = 10)
const baseL1Lives = (l1.lives || 5);
const prevLives   = Math.max(0, lives|0);
lives = Math.min(10, baseL1Lives + prevLives);  // напр. 5 (ბეისი) + 4 (დარჩენილი) = 9, მაგრამ ≤10

updateLivesDisplay();

        // სათაურები ისევ არ გვინდა — მხოლოდ დიაპაზონი
        const tEl = document.getElementById("levelTitle");
        const sEl = document.getElementById("levelStory");
        if (tEl) tEl.innerText = "";
        if (sEl) sEl.innerText = translations[currentLang].guessRange(maxNumber);

        const input = document.getElementById("guessInput");
        if (input) { input.value = ""; input.setAttribute("max", maxNumber); }

        document.getElementById("gameButton").disabled = false;
        if (msg) msg.innerHTML = "";
        startTimer();
      }, 800);
      return; // ვრჩებით Level 1-ში
    }

    // ბოლო დიაპაზონიც დასრულდა (1–70) → გადადი Level 2-ზე
    setTimeout(() => {
       carryLives += lives;   // დავამატოთ რაც Level 1-ზე დაგვრჩა
       jumpToLevel(2);
    }, 800);
    return; // მნიშვნელოვანია!
  }
  
        
        
        const earnedPoints = calculatePoints(level, attempts);
            addPoints(earnedPoints, level);  // ქულა ჩაიწეროს state-ში
    document.getElementById("scoreValue").textContent = String(getTotalScore()); 
    score = getTotalScore(); // სურვილისამებრ, რომ score ცვლადიც იგივე იყოს



       
      

if (level === 1) level1Score += earnedPoints;
if (level === 2) level5Score += earnedPoints;
if (level === 3) level3Score += earnedPoints;
if (level === 4) level4Score += earnedPoints;

        saveProgress();
        document.getElementById("scoreValue").textContent = score;

        message.innerHTML = translations[currentLang].correct(attempts);
        message.style.color = "green";

      if (level === 4) {
    setTimeout(() => {
      level = 2;
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
     


     if (level === 1) {
  // Level 1-ზე სათაურები გამორთულია — ვაჩვენოთ მხოლოდ დიაპაზონი
  const tEl = document.getElementById("levelTitle");
  const sEl = document.getElementById("levelStory");
  if (tEl) tEl.innerText = "";
  if (sEl) sEl.innerText = translations[currentLang].guessRange(maxNumber);
} else {
  // სხვა ლეველებზე შეგიძლია დარჩეს როგორც გაქვს, ან იგივე მინიმალისტური ტექსტი გაზარდო სურვილისამებრ
  const tEl = document.getElementById("levelTitle");
  const sEl = document.getElementById("levelStory");
  if (tEl) tEl.innerText = next.title[currentLang];  // ან "" თუ საერთოდ არ გინდა სათაურები
  if (sEl) sEl.innerText = next.story[currentLang];  // ან guessRange(next.max)
}

   
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
   if (level === 1) {
    level1Phase = 0;   // <<< დაამატე ეს
  }
  jumpToLevel(level);
}

 
function jumpToLevel(n) {
  
  goToLevel(n);
  level = n;
  localStorage.setItem("completedLevel", n - 1);

    if (level === 1) {
    level1Phase = 0;   
  }
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("level5Container").style.display = "none";
  document.getElementById("level6Container").style.display = "none";

  
  if (level === 2) {
    document.getElementById("startScreen").style.display = "none";
    renderLevel5Stage();
    return;
  }
  if (level === 3) {
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

  // 2) გააჩერე ხმები
  try {
    Object.values(levelSounds).forEach(s => { s.pause(); s.currentTime = 0; });
    startSound.pause(); startSound.currentTime = 0;
    clickSound.pause(); clickSound.currentTime = 0;
    failSound.pause();  failSound.currentTime  = 0;
  } catch(_) {}

  // 3) მხოლოდ menu კლასი
  document.body.className = "";
  document.body.classList.add("menu");

  // 4) დამალე ყველა ლეველის UI
  ["gameContainer","level5Container","level6Container","summaryModal"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });

  // 5) აჩვენე სტარტსქრინი
  const start = document.getElementById("startScreen");
  if (start) {
    start.style.display = "block";   // ან "flex" თუ ასე გინდა
    start.scrollTop = 0;
  }

  // 6) განაახლე HUD სკორი (ჯამური)
  setScoreUI(getTotalScore()); // ეს გაავსებს #scoreValue, #level5ScoreNum და სხვას

  // 7) ენა/ტექსტები
  try { updateLevelLocks(); } catch(_) {}
  try { applyTranslations(); } catch(_) {}
}
 

 


 // === FIX: Main Menu click handler ===
function handleMainMenuClick(e) {
  if (e) e.preventDefault();
 restartGameFull();
  resetLevel2UIAndState();
  level5Part = 1;

    ["gameContainer","level5Container","level6Container","summaryModal"].forEach(id=>{
    const el=document.getElementById(id);
    if (el) el.style.display="none";
  });
  // გაჩერება ყველა ტაიმერის/ხმის
  try { clearInterval(timer); } catch(_) {}
  try { clearInterval(level5TimerInterval); } catch(_) {}
  try { clearInterval(level6Timer); } catch(_) {}
  try {
    Object.values(levelSounds).forEach(s => { s.pause(); s.currentTime = 0; });
    startSound.pause(); startSound.currentTime = 0;
    clickSound.pause(); clickSound.currentTime = 0;
    failSound.pause();  failSound.currentTime  = 0;
  } catch(_) {}

  // State reset
  restartGameFull();
  resetLevel2UIAndState();      // Level 2 UI/vars clean (გაქვს უკვე)


  // დამალე ყველა კონტეინერი
  ["gameContainer","level5Container","level6Container","summaryModal"].forEach(id=>{
    const el=document.getElementById(id);
    if (el) el.style.display="none";
  });

  // Body იყოს მენიუ და სტარტი გამოჩნდეს ცენტრში
  document.body.className = "menu";
 

  // Start ტექსტები განახლდეს არჩეული ენით
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

  document.body.className = "level-2";
  updateBackground(2);

  
  const data = getLevelData(2);
  document.querySelector('[data-i18n="level5Title"]').innerText = data.title[currentLang];
  document.querySelector('[data-i18n="level5Subtitle"]').innerText = data.story[currentLang];

 
  const numberOptions = document.getElementById("numberOptions");
  const level5Message = document.getElementById("level5Message");
  
// ჯერ ცარიელი ღილაკები (count = 3 ან 4), გათიშული
function renderBlankOptions(count) {
  numberOptions.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const btn = document.createElement("button");
    btn.classList.add("option-btn");
    btn.textContent = "";   // ცარიელი
    btn.disabled = true;    // ჯერ არაა აქტიური
    numberOptions.appendChild(btn);
  }
}

// 300ms-ის შემდეგ ჩავანაცვლოთ ციფრებით და ჩავრთოთ კლიკები
function renderOptions(start, end, count, afterReveal) {
  renderBlankOptions(count);

  // უნიკალური რიცხვები (ერთ-ერთი იქნება correct)
  const options = new Set();
  correct = Math.floor(Math.random() * (end - start + 1)) + start;
  options.add(correct);
  while (options.size < count) {
    options.add(Math.floor(Math.random() * (end - start + 1)) + start);
  }
  const shuffled = Array.from(options).sort(() => Math.random() - 0.5);

  setTimeout(() => {
    const btns = numberOptions.querySelectorAll("button");
    btns.forEach((btn, idx) => {
      const num = shuffled[idx];
      btn.textContent = num;
      btn.disabled = false;
      btn.onclick = () => handleChoice(num);
    });
    if (typeof afterReveal === "function") afterReveal();
  }, 300);
}
function updateLevel5Score(points) {
  // დაამატე ქულა Level 2-ს (state-ში)
  addPoints(points, 2);

  const total = getTotalScore();

  // Level 2-ის პატარა მაჩვენებელი (თუ ხმარობ)
  const l5 = document.getElementById("level5ScoreNum");
  if (l5) l5.innerText = String(total);

  // მთავარი HUD (ზედა "🏆 High Score:")
  const sv = document.getElementById("scoreValue");
  if (sv) sv.textContent = String(total);

  // სურვილისამებრ თანმიმდევრული განახლება ყველა .scoreValue-ზე
  try { setScoreUI(total); } catch(_) {}
}

function startLevel5Timer() {
  try { clearInterval(level5TimerInterval); } catch (_) {}

  // Stage-ზე დამოკიდებული დრო: Part1 = 30s, Part2 = 40s
  level5Time = (level5Part === 2) ? 40 : 30;
  const timeEl = document.getElementById("level5Time");
  if (timeEl) timeEl.innerText = `🕐 ${level5Time}s`;

  level5TimerInterval = setInterval(() => {
    level5Time--;
    if (timeEl) timeEl.innerText = `🕐 ${level5Time}s`;

    if (level5Time <= 0) {
      clearInterval(level5TimerInterval);
if (level5Part === 1) {
  // ⏱ Stage 1 დასრულდა დროთი → ყოველთვის გადავდივართ Stage 2-ზე
  level5Part = 2;

  // Stage2 სიცოცხლე = Stage1 ნაშთი + 4 (cap = 10), თუნდაც Stage1 დაიხურა 0-ზე
  level5Lives = Math.min(L2_STAGE2_LIFE_CAP, (level5Lives || 0) + 4);
  const livesEl = document.getElementById("level5Lives");
  if (livesEl) livesEl.textContent = renderHearts(level5Lives);

  setTimeout(() => {
    renderBlankOptions(4);
    // Stage 2 – ახალი 40წმ ტაიმერი იწყება
    renderOptions(rangeStart, rangeEnd, 4, startLevel5Timer);
  }, 400);
  return;
} else {
        // ✅ Stage 2: დროზე ამოწურვა → პირდაპირ Level 3-ზე (უსაფრთხოდ გადავიტანოთ სიცოცხლე)
try { numberOptions.innerHTML = ""; } catch(_) {}
level5Message.textContent = (translations[currentLang]?.level5Passed || "🎉 You passed Level 2!");

setTimeout(() => {
  level5Message.textContent = "";
  const l5c = document.getElementById("level5Container");
  if (l5c) l5c.style.display = "none";

  //➡ Level 2-დან გადავიტანოთ დარჩენილი სიცოცხლე Level 3-ზე (cap = 10)
  window.pendingLivesToL3 = Math.min(10, Math.max(0, level5Lives|0));

  jumpToLevel(3);
}, 400);
return;
        return;
      }
    }
  }, 1000);
}
function handleChoice(choice) {
  // თავიდან დავბლოკოთ ღილაკები, რომ ორჯერ არ დააჭირონ
  try { numberOptions.querySelectorAll("button").forEach(b => b.disabled = true); } catch(_) {}

  if (choice === correct) {
    // ✅ სწორი — ქულა სტეიჯის მიხედვით (Stage1=20, Stage2=30)
    const pts = (level5Part === 2) ? 30 : 20;
    level5Message.textContent = translations[currentLang].level5Correct + String(correct);
    updateLevel5Score(pts);

    // Stage 2 – სწორისას სიცოცხლე +1 (cap = 10)
    if (level5Part === 2) {
      level5Lives = Math.min(L2_STAGE2_LIFE_CAP, (level5Lives || 0) + 1);
      const livesEl = document.getElementById("level5Lives");
      if (livesEl) livesEl.textContent = renderHearts(level5Lives);
    }

    // სწრაფი რეფრეში — ტაიმერი არ ვაწყდეთ თავიდან!
    setTimeout(() => {
      level5Message.textContent = "";
      const count = (level5Part === 2 ? 4 : 3);
      renderBlankOptions(count);
      renderOptions(rangeStart, rangeEnd, count);
    }, 400);
    return;

  } else {
    // ❌ არასწორი — დააკლე სიცოცხლე (ორივე სტეიჯში)
    level5Lives = Math.max(0, (level5Lives || 0) - 1);
    const livesEl = document.getElementById("level5Lives");
    if (livesEl) livesEl.textContent = renderHearts(level5Lives);

    const wrongMsg = (translations[currentLang]?.level5Wrong || "❌ Wrong! Correct was: ");
    level5Message.textContent = wrongMsg + String(correct);

    // Stage 1: თუ დაცავ 0-ზე დასრულებას, აქ ჩაამატე showSummary(); სურვილისამებრ
    // Stage 2: არ ვამთავრებთ სიცოცხლებით — სთეიჯი მთავრდება დროთი.

    setTimeout(() => {
      level5Message.textContent = "";
      const count = (level5Part === 2 ? 4 : 3);
      renderBlankOptions(count);
      renderOptions(rangeStart, rangeEnd, count);
    }, 700);
    return;
  }
}


  const startBtn = document.getElementById("startBtn");
startBtn.onclick = () => {
  startBtn.style.display = "none";
  document.getElementById("level5Lives").classList.remove("hidden");
  document.getElementById("level5Time").classList.remove("hidden");
  const scoreBox = document.getElementById("level5ScoreValue");
  if (scoreBox) { scoreBox.classList.remove("hidden"); scoreBox.style.display = "block"; }

  rangeStart = 1; rangeEnd = 50;
  level5Part  = 1;                 // Stage 1 (3 ფანჯარა)
  level5Score = 0;

 // Level 2 იწყებს: თავის ბეის lives + Level 1-ის ბონუსი; cap = 10
const baseL2Lives = (getLevelData(2)?.lives ?? 3);
level5Lives = Math.min(L2_STAGE2_LIFE_CAP, baseL2Lives + (carryLives || 0));
carryLives = 0; // გამოვიყენეთ – გავანულოთ, რომ ორჯერ არ დაემატოს

const l5LivesEl = document.getElementById("level5Lives");
if (l5LivesEl) l5LivesEl.textContent = renderHearts(level5Lives);


  
  level5Message.textContent = "";

  renderOptions(rangeStart, rangeEnd, 3);
  startLevel5Timer();
};


  
  const restartLevel5Btn = document.getElementById("restartLevel5Btn");
  if (restartLevel5Btn) {
    restartLevel5Btn.type = "button";
    restartLevel5Btn.classList.remove("hidden");
    restartLevel5Btn.style.display = "inline-block";
    restartLevel5Btn.onclick = (e) => {
      e.preventDefault();

      
      
      rangeStart = 1; rangeEnd = 50;
      level5Lives = 3;
      
      level = 2;

     
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

  document.body.className = "level-3";
    updateBackground(3);

    const data = getLevelData(3);
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


function setupLevel6Round() {
  try { clearInterval(level6Timer); } catch(_) {}

  const boxesContainer = document.getElementById("level6Boxes");
  boxesContainer.innerHTML = "";

  // გამოიყენე Level 6-ის საკუთარი დიაპაზონი
  const { max } = getLevelData(3);
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

 addPoints(10, 3);
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
  
  
 const baseL3Lives = (getLevelData(3)?.lives ?? 3);

// თუ L2-დან გვაქვს pendingLivesToL3 → L3 იწყებს base + pendingLives (cap=10)
if (typeof window.pendingLivesToL3 === "number") {
  level6Lives = Math.min(10, baseL3Lives + (window.pendingLivesToL3|0));
  window.pendingLivesToL3 = null; // გამოვიყენეთ
} else {
  level6Lives = baseL3Lives;
}

level6Score = 0; 
level6Wins  = 0; 

document.getElementById("level6Lives").textContent = renderHearts(level6Lives);
  document.getElementById("level6Message").textContent = "";

  
  document.getElementById("level6ScoreValue").style.display = "block";
  document.getElementById("level6ScoreNum").textContent = level6Score;

  setupLevel6Round();
}


function showSummary() {
  // გამოვიყენოთ state.levelScores, სადაც addPoints ინახავს ქულებს
  const s = state.levelScores || {};

  const score1to4 = (s[1]||0) + (s[4]||0); // თუ 4 აღარ გვჭირდება, დატოვე მხოლოდ s[1]
 const l2        = (s[2]||0);             // Level 2 = ინტუიციის დონე
 const l3        = (s[3]||0);             // Level 3 = სამი ფანჯარა

  const total     = getTotalScore();

  document.getElementById("level1Score").textContent =
    `${translations[currentLang].level1to4}: ${score1to4} pts`;
  document.getElementById("level5Score").textContent =
   `${(translations[currentLang].level2 || "Level 2")}: ${l2} pts`;
 document.getElementById("level6FinalScore").textContent =
   `${(translations[currentLang].level3 || "Level 3")}: ${l3} pts`;
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
        en: " The Beginning",
        ru: " Начало"
      },
      story: {
        en: "Guess a number between 1 and 20",
        ru: "Угадай число от 1 до 20"
      }
    },
    2: {
      max: 100,
      lives: 3,
      title: {
        en: " Follow the Intuition",
        ru: " Интуитивный выбор"
      },
      story: {
        en: "Choose the number that feels right",
        ru: "Выбери число, которому доверяешь"
      }
    },
    3: {
  max: 150,
  lives: 3,
  title: {
    en: " Advanced Guessing",
    ru: " Продвинутое угадывание"
  },
  story: {
    en: "Choose the window that feels right",
    ru: "Выберите правильное окно",
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

  if (n === 2) {
    level = 2;
    
    rangeStart  = 1;
    rangeEnd    = 50;
    level5Lives = 3;
    level5Score = 0;

    
    renderLevel5Stage();

    

    return;
  }

  if (n === 3) {
    level = 3;
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
  const restartLevel5Btn     = document.getElementById("restartLevel5Btn");
  const restartGame5Btn      = document.getElementById("restartGame5Btn");

  if (modalRestartLevelBtn) {
    modalRestartLevelBtn.addEventListener("click", () => {
      closeSummary();
      if (level === 2) return restartLevelTo(2);
      if (level === 6) return restartLevelTo(6);
      restartLevel();
    });
  }

  if (modalRestartGameBtn) {
    modalRestartGameBtn.addEventListener("click", () => {
      closeSummary();
      restartGameFull();
      goToMainMenu();
      try { updateLevelLocks(); } catch(_) {}
      try { applyTranslations(); } catch(_) {}
    });
  }

  if (restartLevel5Btn) {
    restartLevel5Btn.addEventListener("click", () => {
      closeSummary();
      restartLevelTo(2);
    });
  }

  if (restartGame5Btn) {
    restartGame5Btn.addEventListener("click", () => {
      closeSummary();
      restartGameFull();
      goToMainMenu();
    });
  }


// მიამაგრე ღილაკებზე
const mm1 = document.getElementById("mainMenuBtn1");
if (mm1) mm1.addEventListener("click", handleMainMenuClick);

const mm5 = document.getElementById("mainMenuBtn5");
if (mm5) mm5.addEventListener("click", handleMainMenuClick);

const mm6 = document.getElementById("mainMenuBtn6");
if (mm6) mm6.addEventListener("click", handleMainMenuClick);
});
function resetLevel2UIAndState() {
  try { clearInterval(level5TimerInterval); } catch (_) {}

  // ცვლადები
  rangeStart = 1; rangeEnd = 50;
  level5Lives = 3;
  level5Time  = 30;
  level5Score = 0;
  level5Part = 1;

  // UI გასუფთავება
  const c = document.getElementById("level5Container");
  if (c) c.style.display = "none";          // <<< დამალე მთლიანად

  const opts = document.getElementById("numberOptions");
  if (opts) opts.innerHTML = "";

  const msg = document.getElementById("level5Message");
  if (msg) msg.textContent = "";

  const tEl = document.getElementById("level5Time");
  if (tEl) tEl.textContent = "";

  const livesEl = document.getElementById("level5Lives");
  if (livesEl) livesEl.textContent = "";

const sBox = document.getElementById("level5ScoreValue");
// მხოლოდ კლასით დავმალოთ; display არ დავუწეროთ, რომ მერე ადვილად გამოვაჩინოთ
if (sBox) { sBox.classList.add("hidden"); sBox.style.display = ""; }

const sNum = document.getElementById("level5ScoreNum");
// გადავწეროთ ჯამური ქულით, რომ 1 ლეველიდან გადმოყოლილი ჩანდა
if (sNum) sNum.textContent = String(getTotalScore());

  // Start ღილაკი ისევ გამოჩნდეს, როცა დაბრუნდები Level 2-ში
  const startBtn = document.getElementById("startBtn");
  if (startBtn) startBtn.style.display = "inline-block";

  // რესტარტ ღილაკები დაიმალოს
  const rL = document.getElementById("restartLevel5Btn");
  if (rL) rL.classList.add("hidden");
  const rG = document.getElementById("restartGame5Btn");
  if (rG) rG.classList.add("hidden");
}