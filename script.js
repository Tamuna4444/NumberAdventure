// --- Yandex Games SDK init ---
// --- Yandex Games SDK init ---
YaGames.init().then(ysdk => {
  window.ysdk = ysdk;
  console.log("✅ Yandex SDK initialized");

  // ვაცხადებთ, რომ ჩატვირთვა დასრულებულია
  try {
  // if (ysdk.features && ysdk.features.LoadingAPI) {
      // ysdk.features.LoadingAPI.ready();
      // console.log("✅ Yandex LoadingAPI ready");
    // }
  } catch(e) {
    console.warn("LoadingAPI not available", e);
  }

  // 🔹 აქ ჩასვი ენის ავტომატური განსაზღვრა SDK-დან
  try {
    // 1) ვიღებთ SDK-დან ენის კოდს
    const sdkLang = ysdk?.environment?.i18n?.lang; // напр. "ru", "en", "tr-TR"
    // 2) სარეზერვო ვარიანტი ბრაუზერიდან
    const navLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    // 3) უბრალოდ ორი ენა გვაინტერესებს — ru / en
    const normalize = (l) => (l || '').slice(0,2);
    const detected = ({ ru:'ru', en:'en' }[ normalize(sdkLang) ]) 
                  || ({ ru:'ru', en:'en' }[ normalize(navLang) ])
                  || 'en';

    // პირველად გაშვებისას ვაწესებთ ავტომატურად SDK-ის ენას
    if (!localStorage.getItem('lang')) {
      localStorage.setItem('lang', detected);
    }

    // ამოვიღოთ უკვე შენახული ან SDK-ით დადგენილი
    const currentLang = localStorage.getItem('lang') || detected;

    // html-ში ჩავწეროთ ენა
    document.documentElement.setAttribute('lang', currentLang);

    // UI-ის თარგმნა და სათაურის განახლება
    if (typeof changeLanguage === 'function') changeLanguage(currentLang);
    if (typeof updateDocumentTitle === 'function') updateDocumentTitle(currentLang);

    console.log('🌐 Language set by SDK:', sdkLang, '→ using:', currentLang);
  } catch(err) {
    console.warn('Language autodetect failed, fallback to EN', err);
    document.documentElement.setAttribute('lang', 'en');
    if (typeof changeLanguage === 'function') changeLanguage('en');
    if (typeof updateDocumentTitle === 'function') updateDocumentTitle('en');
  }

}).catch(err => {
  console.error("❌ Yandex SDK error:", err);
});
// --- Auto-start flags for Level 2 & 3 ---
const AUTO_START_L2 = true;
const AUTO_START_L3 = true;

// --- GameReady Once helper ---
let __gameReadySent = false;
function sendGameReadyOnce() {
  if (!__gameReadySent && window.ysdk?.features?.LoadingAPI) {
    try {
      ysdk.features.LoadingAPI.ready();
      __gameReadySent = true;
      console.log("✅ GameReady sent (UI visible)");
    } catch (e) {
      console.warn("GameReady send failed:", e);
    }
  }
}


// === Persistent Session State (score/lives/level) ===
const STATE_KEY = 'ng_state_v1';

let state = {
  currentLevel: 1,
  lives: 3, // თუ იყენებ სიცოცხლეების სისტემას
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
// UI-ზე ჯამური ქულის გამოტანა (HUD + Level5/6 პატარა ქულები)
function setScoreUI(total){
  try {
    // მთავარი HUD: მიმდინარე ჯამური ქულა
    const sv = document.getElementById('scoreValue');
    if (sv) sv.textContent = String(total);

    // --- NEW: High Score განახლება/შენახვა ---
    if (total > highScore) {
      highScore = total;
      localStorage.setItem("highScore", String(highScore));
    }
    const bv = document.getElementById('bestValue');
    if (bv) bv.textContent = String(highScore);

    // Level 5/6 ქულების მცირე მაჩვენებლები (თუ არსებობენ)
    const l5 = document.getElementById('level5ScoreNum');
    if (l5) l5.textContent = String(total);
    const l6 = document.getElementById('level6ScoreNum');
    if (l6) l6.textContent = String(total);

    document.querySelectorAll('.scoreValue').forEach(el => { el.textContent = String(total); });
  } catch(e){}
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
  
}
// Level 1 – ერთიან ფროუდ (1–20 → 1–30 → 1–50 → 1–70), UI-ში სათაურების გარეშე
const LEVEL1_PHASE_MAXES = [20, 30, 50, 70];
let level1Phase = 0; // 0..3



// ენა აღარ ვაყენებთ ხელით აქ — SDK განსაზღვრავს
let currentLang = localStorage.getItem("lang") || null;

const translations = {
  en: {
    gameName: "Guess the Number",
    title: "Guess the Number",
    start: "Start",
    level: "Level",
    level1: "Level 1",
    level2: "Level 2",
    level3: "Level 3",
    start: "Start",
    mainTitle: "Guess the Number",
    
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
    // en-ში სადმე labels-ის გვერდით
    pts: "pts",
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
    mainMenu: " Main Menu",
    summary: {
      finalResultsTitle:  "💥 Final Results 💥",
      level1to4: "Levels 1–4",
      level2: "Level 2",
      level3: "Level 3",
      total: "🏆 Total Score",
      ranks: {
        grandmaster: "🏅Grandmaster of Numbers🏅",
        master: "🥈Master Strategist🥈",
        sharp: "🥉Sharp Guesser🥉",
        rising: "⭐Rising Adventurer⭐",
        new: "⭐New Explorer⭐",
      },
      rankDesc: {
        grandmaster: "Flawless intuition, memory, and speed – every stage is yours!",
        master: "Very high accuracy and excellent risk management.",
        sharp: "Fast progress – with a little practice, you’ll be at the top!",
        rising: "A great start! Try to grasp the ranges more quickly.",
        new: "The game is just beginning—try again and sharpen your accuracy!",
      },
    },
  
  },

  ru: {
  gameName: "Угадай число",
  title:      "Угадай число",
  mainTitle:  "Угадай число",
  gameTitle:  "Угадай число",
    start: "Начать",
    level: "Уровень",
    level1: "Уровень 1",
    level2: "Уровень 2",
    level3: "Уровень 3",
    start: "Старт",
    mainTitle: "Угадай число",
  
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
    // ru-ში სადმე labels-ის გვერდით
    pts: "очков",
    total: "🏆 Всего",
    check: "Проверить",
    reset: "Сбросить игру",
    gameTitle: "Угадай число",
    levelTitle: "Уровень 1: Начало",
    levelStory: "Угадай число от 1 до 20",
    finalScore: "🎉 Финальный счёт!",
    close: "Закрыть",
    guessRange: (max) => `Угадай число от 1 до ${max}`,
    restartLevel: "Сбросить уровень",
    score: "Очки",
     mainMenu: "Главное меню",
     summary: {
      finalResultsTitle: "💥 Итоговые результаты 💥",
      level1to4: "Уровни 1–4",
      level2: "Уровень 2",
      level3: "Уровень 3",
      total: "🏆 Общий счёт",
      ranks: {
        grandmaster: "🏅Грандмастер чисел🏅",
        master: "🥈 Мастер стратегии 🥈",
        sharp: "🥉Проницательный игрок🥉",
        rising: "⭐Восходящий искатель⭐",
        new: "⭐Новый исследователь⭐",
      },
      rankDesc: {
        grandmaster: "Безупречная интуиция, память и скорость – все этапы твои!",
        master: "Отличная точность и управление рисками.",
        sharp: "Быстрое продвижение – немного практики, и ты на вершине!",
        rising: "Отличное начало! Попробуй угадывать диапазоны быстрее.",
        new: "Игра только начинается — попробуй снова и улучшай точность!",
      },
    },
  },
};
 function updateDocumentTitle(lang) {
  const t = translations[lang] || translations.en;
  document.title = t.gameName || "Guess the Number";
}
  


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
  const dataNow = getLevelData(level);
  if (dataNow) {
    if (t) t.innerText = dataNow.title[lang];
    if (s) s.innerText = dataNow.story[lang];
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
updateDocumentTitle(lang);
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
let level3Score = 0;
let level4Score = 0;
let level5Part = 1; // 1=სამი ფანჯარა, 2=ოთხი ფანჯარა
let level6Score = 0;
let carryLives = 0; // დაგროვილი სიცოცხლეების ბონუსი



let soundOn = true;           
   
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


document.body.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON" && soundOn) {
    AudioBus.play('click');
  }
});
 
const settingsBtn = document.getElementById('settingsBtn');
const toggleSound = document.getElementById('toggleSound');
const settingsPanel = document.getElementById('settingsPanel');


   if (settingsBtn && settingsPanel) {
  settingsBtn.addEventListener("click", () => {
    console.log("⚙️ settingsBtn clicked!");
    settingsPanel.classList.toggle("hidden");
  });
}
if (toggleSound) {
  toggleSound.addEventListener('click', () => {
soundOn = !soundOn;
toggleSound.textContent = soundOn ? '🔊' : '🔇';
AudioBus.setEnabled(soundOn);
if (soundOn) {
  AudioBus.resumeBg(level);
} else {
  // optional: ფონის გაჩერება უფრო სწრაფად
  AudioBus.stopBg();
} 

    if (!soundOn) {
      try {
     
   
  
        if (levelSounds[level]) { levelSounds[level].loop = true; levelSounds[level].play(); }
      } catch(_) {}
    }
  });
}
      const guessInput = document.getElementById("guessInput");
      const messageEl  = document.getElementById("message");

  if (guessInput && messageEl) {
    const clearFeedback = () => {
      messageEl.textContent = "";   // წაშლის წინა ტექსტს
    };

    guessInput.addEventListener("input", clearFeedback);
    guessInput.addEventListener("focus", clearFeedback);
  }


});
const restartGame5Btn = document.getElementById("restartGame5Btn");
  if (restartGame5Btn) {
    restartGame5Btn.addEventListener("click", (e) => {
      e.preventDefault();
      resetProgress();   
    });
  }
// === Web Audio manager to avoid system media player & notifications ===
const AudioBus = (() => {
  let ctx = null;
  let masterGain = null;
  let buffers = {};
  let bgSource = null;
  let bgKey = null;
  let enabled = true;

  const fileMap = {
    start: './sounds/startgame.mp3',
    click: './sounds/click-234708.mp3',
    fail:  './sounds/spin-fail-295088.mp3',
    bg1:   './sounds/startgame.mp3',
    bg2:   './sounds/level6.mp3',
    bg3:   './sounds/level6.mp3',
  };

  async function ensureCtx() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = 1;
      masterGain.connect(ctx.destination);
      await Promise.all(Object.keys(fileMap).map(loadBuffer));
    }
    if (ctx.state === 'suspended' && enabled) {
      try { await ctx.resume(); } catch(_) {}
    }
  }

  async function loadBuffer(key) {
    if (buffers[key]) return;
    const res = await fetch(fileMap[key]);
    const arr = await res.arrayBuffer();
    buffers[key] = await (ctx || (ctx = new (window.AudioContext || window.webkitAudioContext)())).decodeAudioData(arr);
  }

  function makeSource(key, loop=false, volume=1) {
    if (!buffers[key]) return null;
    const src = ctx.createBufferSource();
    src.buffer = buffers[key];
    src.loop = !!loop;
    const g = ctx.createGain();
    g.gain.value = volume;
    src.connect(g).connect(masterGain);
    return { src, gain: g };
  }

  async function play(key, { loop=false, volume=1 } = {}) {
    if (!enabled) return;
    await ensureCtx();
    const node = makeSource(key, loop, volume);
    if (!node) return;
    node.src.start(0);
    return node;
  }

  async function startBg(level) {
    if (!enabled) return;
    await ensureCtx();
    stopBg();
    const key = (level === 2 ? 'bg2' : level === 3 ? 'bg3' : 'bg1');
    const node = await play(key, { loop:true, volume:0.6 });
    bgSource = node?.src || null;
    bgKey = key;
  }

  function stopBg() {
    try { bgSource?.stop?.(0); } catch(_) {}
    bgSource = null;
    bgKey = null;
  }

  function stopAll() {
    stopBg();
    try { ctx && ctx.close && ctx.close(); } catch(_) {}
    ctx = null; masterGain = null; buffers = {};
  }

  async function suspend() {
    try { await ctx?.suspend?.(); } catch(_) {}
  }
  async function resumeBg(level) {
    if (!enabled) return;
    try { await ctx?.resume?.(); } catch(_) {}
    if (!bgSource && (typeof level === 'number')) startBg(level);
  }

  function setEnabled(v) {
    enabled = !!v;
    if (!enabled) stopAll();
  }

return { play, startBg, stopBg, stopAll, suspend, resumeBg, setEnabled };
})();

// === Shims so existing calls keep working (no system player) ===
const startSound = { play: () => AudioBus.play('start'), pause: () => {} };
const clickSound = { play: () => AudioBus.play('click'), pause: () => {} };
const failSound  = { play: () => AudioBus.play('fail'),  pause: () => {} };

// levelSounds proxy ← background per level via Web Audio
const levelSounds = {
  1: { play: () => AudioBus.startBg(1), pause: () => AudioBus.stopBg(), loop: true },
  2: { play: () => AudioBus.startBg(2), pause: () => AudioBus.stopBg(), loop: true },
  3: { play: () => AudioBus.startBg(3), pause: () => AudioBus.stopBg(), loop: true },
};




/* === Helpers ხმებისთვის === */
function playSafe(audio, loop = false) {
  if (!audio) return;
  try {
    audio.loop = loop;
    audio.currentTime = 0;
    audio.play().catch(() => {
      const resume = () => {
        audio.play().catch(() => {});
        document.removeEventListener("click", resume);
      };
      document.addEventListener("click", resume, { once: true });
    });
  } catch (e) {
    console.warn("Sound play error:", e);
  }
}
function stopSafe(audio) {
  try { audio.pause(); audio.currentTime = 0; } catch (_) {}
}

   function startGame() {
     restartGameFull(); 
  if (soundOn) AudioBus.play('click');

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
    let highScore = Number(localStorage.getItem("highScore")) || 0;
    let timer;
    let timeLeft = 50



    function updateLivesDisplay() {
      const heart = "❤️";
      document.getElementById("lives").innerText = heart.repeat(lives);
    }

function updateBackground(level) {
  document.body.className = `level-${level}`;
  // Web Audio ფონი (სისტემურ პლეერს აღარ აჩენს)
  try { AudioBus.startBg(level); } catch(_) {}


  // გავაჩუმოთ სხვა level-ების ფონები
  Object.values(levelSounds).forEach(s => { try{s.pause(); s.currentTime=0;}catch(_){}});

  // ჩავრთოთ მიმდინარე Level-ის ფონური ხმა (თუ გვაქვს და ხმა ჩართულია)
  const bg = levelSounds[level];
  if (soundOn && bg) {
    try {
      bg.loop = true;
      bg.currentTime = 0;
      bg.play().catch(() => {
        const once = () => { bg.play().catch(()=>{}); document.removeEventListener('click', once); };
        document.addEventListener('click', once, { once:true });
      });
    } catch(_) {}
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

  if (lives > 1) {            // იყო: if (lives <= 1)
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


  }

 const sv = document.getElementById("scoreValue");
if (sv) sv.textContent = String(getTotalScore());

  document.body.className = "menu";
}
const t = document.getElementById("levelTitle");

function calculatePoints(level, attempts) {
  if (level === 1) {
    return (attempts <= 2) ? 20 : 10;
  }

  // Level 5 და 6 – სურვილისამებრ, შეგიძლია აქეც დაამატო ცალკე ლოგიკა
  return 10;
}
function getRankByTotal(total) {
  const ts = translations[currentLang].summary;
  if (!ts) return { title: "", desc: "" };

  if (total >= 600) return { title: ts.ranks.grandmaster, desc: ts.rankDesc.grandmaster };
  if (total >= 400) return { title: ts.ranks.master,      desc: ts.rankDesc.master };
  if (total >= 200) return { title: ts.ranks.sharp,       desc: ts.rankDesc.sharp };
  if (total >= 100) return { title: ts.ranks.rising,      desc: ts.rankDesc.rising };
  return { title: ts.ranks.new, desc: ts.rankDesc.new };
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

 if (soundOn) { AudioBus.play('fail'); }

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
AudioBus.stopAll();
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
AudioBus.stopAll();
 
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
  const sv = document.getElementById('scoreValue');
 if (sv) sv.textContent = String(highScore);
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
  // --- UI toggle ---
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("level6Container").style.display = "none";
  document.getElementById("level5Container").style.display = "block";

  document.body.className = "level-2";
  updateBackground(2);

  // --- Texts ---
  const data = getLevelData(2);
  document.querySelector('[data-i18n="level5Title"]').innerText = data.title[currentLang];
  document.querySelector('[data-i18n="level5Subtitle"]').innerText = data.story[currentLang];

  // --- Grab HUD elements once ---
  const livesEl   = document.getElementById("level5Lives");
  const timeEl    = document.getElementById("level5Time");
  const scoreBox  = document.getElementById("level5ScoreValue");
  const msgEl     = document.getElementById("level5Message");
  const optionsEl = document.getElementById("numberOptions");

  // --- Reset containers ---
  if (optionsEl) optionsEl.innerHTML = "";
  if (msgEl)     msgEl.textContent = "";

  // --- Ensure HUD is visible (could be hidden before) ---
  [livesEl, timeEl, scoreBox].forEach(el => {
    if (!el) return;
    el.classList?.remove("hidden");
    // lives/time ინახება ჰედერივით — მივანიჭოთ inline-block
    el.style.display = (el === scoreBox) ? "block" : "inline-block";
  });

  // --- GameReady: UI already visible ---
  sendGameReadyOnce();

  // --- Autostart ---
  AudioBus.play('start', { loop:true, volume:0.5 });

  // Params
  rangeStart   = 1;
  rangeEnd     = 50;
  level5Part   = 1;
  level5Score  = 0;

  // Lives (base + carry, cap 10)
  const baseL2Lives = (getLevelData(2)?.lives ?? 3);
  level5Lives = Math.min(L2_STAGE2_LIFE_CAP, baseL2Lives + (carryLives || 0));
  carryLives  = 0;

  // ⏱ Init time BEFORE starting timer (Stage1 = 30s)
  level5Time = 30;

  // --- Paint initial HUD values ---
  if (livesEl) livesEl.textContent = renderHearts(level5Lives);
  if (timeEl)  timeEl.textContent  = `🕐 ${level5Time}s`;
  if (scoreBox){ scoreBox.style.display = "block"; } // პატარა ქულის ყუთი თუ გაქვს

  // Build choices and start timer (once!)
  renderOptions(rangeStart, rangeEnd, 3);
  startLevel5Timer();


  

  
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
// ⏱ დრო ამოიწურა
if (level5Time <= 0) {
  clearInterval(level5TimerInterval);

  if (level5Part === 1) {
    // ✅ NEW: თუ Stage1-ზე სიცოცხლე ნულია → ვასრულებთ ლეველს (Summary)
    if ((level5Lives || 0) <= 0) {
      try { numberOptions.innerHTML = ""; } catch(_) {}
      const l5c = document.getElementById("level5Container");
      if (l5c) l5c.style.display = "none";
      showSummary();               // ← აქ დასრულება გვინდა, არა Stage 2
      return;
    }

    // ✅ NEW: თუ სიცოცხლე დარჩა → გადავდივართ Stage 2-ზე
    level5Part = 2;

    // Stage2 სიცოცხლე = Stage1 ნაშთი + 4 (cap = 10)
    level5Lives = Math.min(L2_STAGE2_LIFE_CAP, (level5Lives || 0) + 4);
    const livesEl = document.getElementById("level5Lives");
    if (livesEl) livesEl.textContent = renderHearts(level5Lives);

    // Stage 2-ის დრო — 40 წმ
    level5Time = 40;
    const timeEl2 = document.getElementById("level5Time");
    if (timeEl2) timeEl2.innerText = `🕐 ${level5Time}s`;

    setTimeout(() => {
      renderBlankOptions(4);
      renderOptions(rangeStart, rangeEnd, 4, startLevel5Timer);
    }, 400);
    return;
  }

  // 🔚 Stage 2: დროზე ამოწურვა → გადასვლა Level 3-ზე
  try { numberOptions.innerHTML = ""; } catch(_) {}
  const l5c = document.getElementById("level5Container");
  if (l5c) l5c.style.display = "none";

  // სიცოცხლე გადავიტანოთ Level 3-ზე (cap 10)
  window.pendingLivesToL3 = Math.min(10, Math.max(0, level5Lives|0));

  jumpToLevel(3);
  return;
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

     if (soundOn) {
    try { failSound.currentTime = 0; failSound.play().catch(()=>{}); } catch(_){}
  }
    const livesEl = document.getElementById("level5Lives");
    if (livesEl) livesEl.textContent = renderHearts(level5Lives);

    const wrongMsg = (translations[currentLang]?.level5Wrong || "❌ Wrong! Correct was: ");
    level5Message.textContent = wrongMsg + String(correct);
// ✅ Stage 1-ზე თუ სიცოცხლე ნულზე ჩამოვიდა — ვასრულებთ Level 2-ს ახლავე
if (level5Part === 1 && level5Lives <= 0) {
  try { clearInterval(level5TimerInterval); } catch (_) {}
  try { numberOptions.innerHTML = ""; } catch (_) {}
  const l5c = document.getElementById("level5Container");
  if (l5c) l5c.style.display = "none";
  showSummary();
  return; // აღარ ვაგრძელებთ რენდერს
}
    

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
 
let level6Part = 1;        // 1 = 3 ფანჯარა, 2 = 4 ფანჯარა
const L3_LIFE_CAP = 10;
let level6Lives = 3;
let level6Time = 5; 
let level6Timer;
let level6Correct; 
let level6HiddenBoxIndex; 

let level6Wins = 0;
const LEVEL6_TARGET_WINS = 4;
// === L3 HYBRID FINISH HELPERS (ONLY FOR LEVEL 3) ===
// === L3 HYBRID helpers ===
let level6Ended = false;

function disableLevel6Buttons() {
  document.querySelectorAll("#level6Boxes button").forEach(b => {
    b.disabled = true;
    b.style.pointerEvents = "none";
  });
}
function enableLevel6Buttons() {
  document.querySelectorAll("#level6Boxes button").forEach(b => {
    b.disabled = false;
    b.style.pointerEvents = "auto";
  });
}

function endLevel3(reasonText) {
  if (level6Ended) return;
  level6Ended = true;
  try { clearInterval(level6Timer); } catch(_) {}
  disableLevel6Buttons();
  const msg = document.getElementById("level6Message");
  if (msg) msg.textContent = reasonText || "✔️ Level 3 complete!";
  setTimeout(() => {
    if (msg) msg.textContent = "";
    showSummary(); // ან jumpToLevel(4);
  }, 600);
}

function renderLevel6Stage() {
  document.getElementById("startScreen").style.display = "none";
  document.getElementById("gameContainer").style.display = "none";
  document.getElementById("level5Container").style.display = "none";
  document.getElementById("level6Container").style.display = "block";

  document.body.className = "level-3";
  updateBackground(3);

  const data = getLevelData(3);
  document.getElementById("level6Title").innerText  = data.title[currentLang];
  document.getElementById("level6Story").innerText  = data.story[currentLang];

  document.getElementById("level6Message").textContent = "";
  document.getElementById("level6Boxes").innerHTML     = "";
  document.getElementById("level6Lives").textContent   = "";
  const timeEl = document.getElementById("level6Time");
  if (timeEl) { timeEl.style.display = "inline-block"; timeEl.textContent = ""; }

  document.getElementById("level6ScoreValue").style.display = "none";
sendGameReadyOnce(); // UI უკვე ჩანს → ახლა ვაგზავნით GameReady-ს
startLevel6();       // ავტოსტარტი L3-ზე
}
function setupLevel6Round() {
  if (level6Ended) return;

  const boxesContainer = document.getElementById("level6Boxes");
  boxesContainer.innerHTML = "";

  const { max } = getLevelData(3);
  level6Correct = Math.floor(Math.random() * max) + 1;

  const boxCount = (level6Part === 2) ? 4 : 3;
  level6HiddenBoxIndex = Math.floor(Math.random() * boxCount);

  for (let i = 0; i < boxCount; i++) {
    const box = document.createElement("button");
    box.textContent   = "";
    box.style.fontSize = "40px";
    box.style.width    = "80px";
    box.style.height   = "80px";
    box.onclick = () => checkLevel6Box(i, box);
    boxesContainer.appendChild(box);
  }

  // აი აქ, რენდერის შემდეგ ვრთავთ კლიკებს
  enableLevel6Buttons();
}
function startLevel6Timer() {
  try { clearInterval(level6Timer); } catch (_) {}

  const timeEl = document.getElementById("level6Time");
  if (timeEl) {
    timeEl.style.display = "inline-block";
    timeEl.textContent = `⏱️ ${level6Time}s`;
  }

  level6Timer = setInterval(() => {
    level6Time--;
    if (timeEl) timeEl.textContent = `⏱️ ${level6Time}s`;

    if (level6Time <= 0) {
      clearInterval(level6Timer);
      disableLevel6Buttons();

      if (level6Part === 1) {
        // Stage1 → Stage2
        level6Part  = 2;
        level6Lives = Math.min(L3_LIFE_CAP, (level6Lives || 0) + 4);
        const lbox = document.getElementById("level6Lives");
        if (lbox) lbox.textContent = renderHearts(level6Lives);

        level6Time = 40;
        if (timeEl) timeEl.textContent = `⏱️ ${level6Time}s`;

        setupLevel6Round();
        startLevel6Timer();
        return;
      }

      // Stage 2 – HYBRID: დროზე ამოწურვა → დასრულება
      endLevel3("⏱️ Time up — Level 3 complete!");
    }
  }, 1000);
}
function checkLevel6Box(index, box) {
  if (level6Ended) return;
  disableLevel6Buttons();         // არ გააორმაგოს კლიკი
    

  const all = document.querySelectorAll("#level6Boxes button");

  if (index === level6HiddenBoxIndex) {
    // ✅ Correct
    box.textContent = String(level6Correct);
    box.style.color = "black";

    addPoints((level6Part === 2) ? 30 : 20, 3);
    const l6num = document.getElementById("level6ScoreNum");
    if (l6num) l6num.textContent = String(getTotalScore());

    // Stage2-ზე სწორისას +1 სიცოცხლე (cap 10)
    if (level6Part === 2) {
      level6Lives = Math.min(L3_LIFE_CAP, (level6Lives || 0) + 1);
      const lbox = document.getElementById("level6Lives");
      if (lbox) lbox.textContent = renderHearts(level6Lives);
    }

    const m = document.getElementById("level6Message");
    if (m) m.textContent = translations[currentLang]?.level6Correct || "✅ Correct!";

    setTimeout(() => {
      if (m) m.textContent = "";
      if (level6Ended) return;
      setupLevel6Round();
      enableLevel6Buttons();
      // ტაიმერი Stage-ზე უკვე მუშაობს — თავიდან არ ვრთავთ
    }, 700);

 } else {
  // ❌ Wrong
  box.textContent = "❌";
  box.style.color = "red";

 if (soundOn) { AudioBus.play('fail'); }

  level6Lives = Math.max(0, (level6Lives || 0) - 1);
  const livesEl = document.getElementById("level6Lives");
  if (livesEl) livesEl.textContent = renderHearts(level6Lives);

  const correctBox = all[level6HiddenBoxIndex];
  correctBox.textContent = String(level6Correct);
  correctBox.style.color = "black";
  correctBox.style.border = "2px solid green";

  // 🔴 NEW: Stage 1-ზე თუ სიცოცხლე გათავდა → მთლიანად ვასრულებთ Level 3-ს
  if (level6Part === 1 && level6Lives <= 0) {
    endLevel3("💀 Out of lives — Level 3 over!");
    return;
  }

  // HYBRID: მხოლოდ Stage 2-ზე სიცოცხლე == 0 → მაშინვე დასრულება
  if (level6Part === 2 && level6Lives <= 0) {
    endLevel3("💀 Out of lives — Level 3 over!");
    return;
  }

  const m = document.getElementById("level6Message");
  if (m) m.textContent = translations[currentLang]?.level6Wrong || "❌ Wrong!";

  setTimeout(() => {
    if (m) m.textContent = "";
    if (level6Ended) return;
    setupLevel6Round();
    enableLevel6Buttons();
  }, 900);
}
}
function startLevel6() {
  level6Ended = false;

 

  level6Part = 1;

  const l3Data = getLevelData(3);
  const baseL3Lives = (l3Data?.lives ?? 3);

  // თუ Level 2-დან გადმოგაქვს სიცოცხლე:
  if (typeof window.pendingLivesToL3 === "number") {
    level6Lives = Math.min(L3_LIFE_CAP, baseL3Lives + (window.pendingLivesToL3|0));
    window.pendingLivesToL3 = null;
  } else {
    level6Lives = baseL3Lives;
  }
  const lbox = document.getElementById("level6Lives");
  if (lbox) lbox.textContent = renderHearts(level6Lives);

  const scoreBox = document.getElementById("level6ScoreValue");
  if (scoreBox) scoreBox.style.display = "block";

  level6Time = 30;       // Stage 1 = 30s
  setupLevel6Round();    // ფანჯრები
  startLevel6Timer();    // ტაიმერი
}
function showSummary() {
  const s = state.levelScores || {};
  const score1to4 = (s[1] || 0) + (s[4] || 0);
  const l2 = (s[2] || 0);
  const l3 = (s[3] || 0);
  const total = (typeof getTotalScore === "function")
    ? getTotalScore()
    : ((score1to4 + l2 + l3) | 0);

  const t  = translations[currentLang] || translations.en || {}; // root
  const ts = t.summary || {};                                    // summary
  const unit = t.pts || "pts";

  // ✅ სათაური: ვეძებთ id-საც და data-i18n-საც; ვიღებთ root/summary გასაღებებს
  const st = document.getElementById("summaryTitle")
          || document.querySelector('[data-i18n="finalResultsTitle"]');
  if (st) {
    st.textContent =
      t.finalResultsTitle                 // root (სწორია data-i18n-სთვის)
      || ts.finalResultsTitle             // summary (თუ ასე გინდა)
      || t.finalScore
      || "Final Results";
  }

  // ⭐ წოდება (შენი ფუნქცია უკვე აბრუნებს თარგმნილ სათაურს/აღწერას)
  const rank = getRankByTotal(total);
  const rt = document.getElementById("rankTitle");
  const rd = document.getElementById("rankDesc");
  if (rt) rt.textContent = rank.title || "";
  if (rd) rd.textContent = rank.desc  || "";

  // 📊 ქულების ხაზები — მხოლოდ თარგმნადი ლეიბლები + ციფრები ცალკე
  const l14El = document.getElementById("level1Score");
  const l2El  = document.getElementById("level5Score");
  const l3El  = document.getElementById("level6FinalScore");
  const totEl = document.getElementById("totalScore");

  const labelL14 = t.level1to4 || ts.level1to4 || "Levels 1–4";
  const labelL2  = (ts.level2 || "Level 2");
  const labelL3  = (ts.level3 || "Level 3");
  const labelTot = t.total     || ts.total     || "Total";

  if (l14El) l14El.textContent = `${labelL14}: ${score1to4} ${unit}`;
  if (l2El)  l2El .textContent = `${labelL2}: ${l2} ${unit}`;
  if (l3El)  l3El .textContent = `${labelL3}: ${l3} ${unit}`;
  if (totEl) totEl.textContent = `${labelTot}: ${total} ${unit}`;

  // 🔘 ღილაკები
  const rLevelBtn = document.getElementById("restartLevelBtn");
  const rGameBtn  = document.getElementById("restartGameBtn");
  const mainBtn   = document.getElementById("summaryMainMenuBtn");
  if (rLevelBtn) rLevelBtn.textContent = t.restartLevel || "Restart Level";
  if (rGameBtn)  rGameBtn .textContent = t.restartGame  || t.reset || "Restart Game";
  if (mainBtn)   mainBtn  .textContent = t.mainMenu     || "Main Menu";

  // 🔓 ვაჩვენებთ მოდალს და ერთხელ კიდევ გავუშვათ i18n, რომ ავიღოს ყველა data-i18n
  const modal = document.getElementById("summaryModal");
  if (modal) {
    modal.style.display = "flex";
    try { applyTranslations(); } catch(_) {}
  }
  
}

function closeSummary() {
  document.getElementById("summaryModal").style.display = "none";
}


document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "ru";
  currentLang = savedLang;
  changeLanguage(savedLang);
  updateDocumentTitle(savedLang);

  const sv = document.getElementById("scoreValue");
  if (sv) sv.textContent = String(highScore);



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
    currentLang = (lang === 'ru') ? 'ru' : 'en';
    changeLanguage(currentLang);
    localStorage.setItem("lang", currentLang);
    document.documentElement.setAttribute('lang', currentLang);
    if (typeof updateDocumentTitle === 'function') updateDocumentTitle(currentLang);
  });
});
// DOMContentLoaded-ის ბოლოს:
const bv = document.getElementById('bestValue');
if (bv) bv.textContent = String(highScore);

}); // აქ იხურება DOMContentLoaded
// Auto-hide red messages after a short delay (no changes elsewhere required)
(function () {
  function attachAutoHide(el) {
    if (!el) return;

    // როცა ტექსტი შეიცვლება, დავიწყოთ "ქრობა"
    const obs = new MutationObserver(() => {
      const text = el.textContent.trim();
      if (text) {
        el.classList.remove('auto-hide');    // reset (თუ მომდევნო მესიჯია)
        void el.offsetWidth;                 // reflow hack
        el.classList.add('auto-hide');
      }
    });

    obs.observe(el, { childList: true, characterData: true, subtree: true });

    // ანიმაციის ბოლოს გავასუფთავოთ ელემენტი (რომ ადგილი აღარ დაიკავოს)
    el.addEventListener('animationend', (e) => {
      if (e.animationName === 'msgFadeOut') {
        el.textContent = '';
        el.style.opacity = '1';
        el.classList.remove('auto-hide');
      }
    });
  }

  // ვუერთდებით სამივე მესიჯ-ელემენტს
  attachAutoHide(document.getElementById('message'));        // Level 1
  attachAutoHide(document.getElementById('level5Message'));  // Level 2
  attachAutoHide(document.getElementById('level6Message'));  // Level 3
})();
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
// NEW: Summary modal-ის Main Menu ღილაკი
const mmSummary = document.getElementById("summaryMainMenuBtn");
if (mmSummary) {
  mmSummary.addEventListener("click", (e) => {
    e.preventDefault();
    closeSummary();         // დახურე მოდალი
    handleMainMenuClick(e); // დაბრუნდეს მთავარ მენიუზე
  });
}
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

 

  // რესტარტ ღილაკები დაიმალოს
  const rL = document.getElementById("restartLevel5Btn");
  if (rL) rL.classList.add("hidden");
  const rG = document.getElementById("restartGame5Btn");
  if (rG) rG.classList.add("hidden");
}
// 🌟 მთავარი გვერდის ლოგიკა
// 🌟 Home Settings ფუნქციონალი
document.addEventListener('DOMContentLoaded', () => {
  const homeBtn = document.getElementById('homeSettingsBtn');
  const homePanel = document.getElementById('homeSettingsPanel');
  const soundBtn = document.getElementById('homeToggleSound');
  const langBtns = document.querySelectorAll('.homeLang');
AudioBus.setEnabled(soundOn);
if (soundOn) { AudioBus.resumeBg(level); }
  if (homeBtn && homePanel) {
    homeBtn.addEventListener('click', () => {
      homePanel.classList.toggle('hidden');
    });
  }

 // ერთი წყარო სიმართლისთვის — იგივე soundOn ცვლადს ვიყენებთ ყველგან
if (soundBtn) {
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? '🔊' : '🔇';
    AudioBus.setEnabled(soundOn);
    if (soundOn) {
      AudioBus.resumeBg(level);
    } else {
      AudioBus.stopBg();
    }
  });
}

  langBtns.forEach(b => {
    b.addEventListener('click', () => {
      const lang = b.dataset.lang;
      if (typeof changeLanguage === 'function') changeLanguage(lang);
    });
  });
});
// === AUTO PAUSE MUSIC WHEN TAB IS HIDDEN ===
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    AudioBus.suspend();
  } else {
    if (soundOn) AudioBus.resumeBg(level);
  }
});
// HOME → GAME გადართვა
document.addEventListener('DOMContentLoaded', () => {
  const homeStart = document.getElementById('homeStartBtn');
  if (homeStart) {
    homeStart.addEventListener('click', () => {
      document.body.classList.remove('home');   // ქრება Home overlay
      // სურვილისამებრ შეგიძლია აქვე დაიწყოს Level 1:
      // startGame();
    });
  }
});
// === MAIN HOME SCREEN → GAME ===
function enterGame() {
  // დამალე მთავარი ეკრანი
  const home = document.getElementById('mainHomeScreen');
  if (home) home.style.display = 'none';

  // აჩვენე თამაშის ფანჯარა
  const startScreen = document.getElementById('startScreen');
  if (startScreen) {
    startScreen.style.display = 'flex'; // აჩვენებს მთავარ სტარტ ეკრანს
  }

  // სურვილისამებრ შეგიძლია აქვე დაიწყოს თამაში:
  // startGame();
}
// რეალური vh კლავიატურისასაც
(function fixViewportHeight(){
  const root = document.documentElement;
  function apply() {
    const h = (window.visualViewport ? visualViewport.height : window.innerHeight);
    root.style.setProperty('--vh', h + 'px');
  }
  apply();
  window.addEventListener('resize', apply);
  if (window.visualViewport) visualViewport.addEventListener('resize', apply);
})();

// არავის მიეცეს focus ავტომატურად (Android-ზე კლავიატურას ხსნის)
document.addEventListener('DOMContentLoaded', () => {
  const gi = document.getElementById('guessInput');
  if (gi) gi.addEventListener('pointerdown', () => gi.focus(), { once: true });
});
// === Block selection / long-press menu inside the game (1.6.2.7) ===
document.addEventListener('DOMContentLoaded', () => {
  // მოასუსტი UI ყველა ძირითადი კონტეინერისთვის
  const containers = ['startScreen','gameContainer','level5Container','level6Container','summaryModal'];

  // გლობალურად – RIGHT-CLICK/long-press menu აიკრძალოს, მაგრამ ინპუტებში დარჩეს
  document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('input, textarea')) return; // ინპუტებში დავუშვათ
    e.preventDefault();
  }, { capture: true });

  // გლობალურად – ტექსტის выделение და drag აიკრძალოს, მაგრამ ინპუტებში დარჩეს
  const blockers = ['selectstart','dragstart'];
  blockers.forEach(type => {
    document.addEventListener(type, (e) => {
      if (e.target.closest('input, textarea')) return; // ინპუტებში ნებადართულია
      e.preventDefault();
    }, { capture: true });
  });

  // თითო კონტეინერის სტილები (user-select/touch-callout/touch-action)
  containers.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.userSelect = 'none';
    el.style.webkitUserSelect = 'none';
    el.style.msUserSelect = 'none';
    el.style.WebkitTouchCallout = 'none';
    el.style.touchAction = 'manipulation';
  });

  // ინპუტებში — პირიქით, არჩევა/მენიუ ნებადართულია
  document.querySelectorAll('input, textarea').forEach(inp => {
    inp.style.userSelect = 'text';
    inp.style.webkitUserSelect = 'text';
    // კონტეინერის ბლოკერები არ გადმოიტანონ
    ['contextmenu','selectstart','dragstart'].forEach(type => {
      inp.addEventListener(type, (e) => e.stopPropagation(), { capture: true });
    });
  });

  // iOS tap highlight გაქრეს
  const style = document.createElement('style');
  style.textContent = `
    * { -webkit-tap-highlight-color: rgba(0,0,0,0); }
    #startScreen, #gameContainer, #level5Container, #level6Container, #summaryModal {
      -webkit-user-select: none !important; user-select: none !important;
      -webkit-touch-callout: none !important; touch-action: manipulation !important;
    }
    #startScreen input, #gameContainer input, #level5Container input, #level6Container input, #summaryModal input,
    #startScreen textarea, #gameContainer textarea, #level5Container textarea, #level6Container textarea, #summaryModal textarea {
      -webkit-user-select: text !important; user-select: text !important;
      -webkit-touch-callout: default !important;
    }
  `;
    // სურათების, ლინკების და ვიდეოების გადათრევის აკრძალვა
  document.querySelectorAll('img, a, video').forEach(el => {
    el.setAttribute('draggable', 'false');
    el.style.webkitUserDrag = 'none';
    el.style.userDrag = 'none';
  });

  // ინპუტებში გლობალური ბლოკერები არ ავიდეს (დამატებით contenteditable-სთვისაც)
  document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach(inp => {
    ['contextmenu','selectstart','dragstart'].forEach(type => {
      inp.addEventListener(type, (e) => e.stopPropagation(), { capture: true });
    });
  });
  document.head.appendChild(style);
});