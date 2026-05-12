let currentLang = 'uk';

const uiStrings = {
    en: {
        title: "Howler",
        subtitle: "Roll the dice. Crack the jargon.",
        startBtn: "Start Game",
        rollingMsg: "Rolling for Word Length...",
        notEnoughMsg: "Not enough letters!",
        jackpotMsg: "JACKPOT! You cracked the code.",
        lossMsg: "House wins. The word was",
        playAgainBtn: "PLAY AGAIN"
    },
    uk: {
        title: "Кумедія!",
        subtitle: "Кидай кубик. Розгадуй слова.",
        startBtn: "Почати гру",
        rollingMsg: "Кидаємо на довжину слова...",
        notEnoughMsg: "Недостатньо літер!",
        jackpotMsg: "ДЖЕКПОТ! Ви розгадали слово.",
        lossMsg: "Казино виграє. Слово було",
        playAgainBtn: "ГРАТИ ЗНОВУ"
    }
};

const dictionaries = {
    en: {
        4: ['CODE', 'BUGS', 'LOOP', 'HACK', 'NODE', 'NULL', 'JSON', 'HTML', 'REPO'],
        5: ['ARRAY', 'LOGIC', 'ASYNC', 'TOKEN', 'REACT', 'SCOPE', 'CACHE', 'CRASH', 'MERGE'],
        6: ['SCRIPT', 'OBJECT', 'SERVER', 'TICKET', 'BRANCH', 'COMMIT', 'DEPLOY', 'SYNTAX'],
        7: ['PROMISE', 'DEFAULT', 'NULLIFY', 'COMPILE', 'REQUEST', 'RUNTIME', 'ROUTING'],
        8: ['VARIABLE', 'FUNCTION', 'DATABASE', 'FRONTEND', 'COMPILER', 'ENDPOINT', 'BACKEND'],
        9: ['ALGORITHM', 'COMPONENT', 'FRAMEWORK', 'DEBUGGING', 'INTERFACE', 'LOCALHOST', 'RECURSION']
    },
    uk: {
        4: ['ЦИЛЯ', 'ЇЖАК'],
        5: ['РАХІТ', 'ВІВЦЯ', 'АФГАН', 'КАБУЛ'],
        6: ['БАОБАБ', 'ЛЕБІДЬ', 'ВОЗДУХ'],
        7: ['ПОЛІССЯ', 'МАЙОНЕЗ'],
        8: ['КУБОМЕТР', 'ЦЕНТУРІЯ'],
        9: ['КРОТОВУХА']
    }
};

const keyboardLayouts = {
    en: ["QWERTYUIOP", "ASDFGHJKL", "ENTER ZXCVBNM BACK"],
    uk: ["ЙЦУКЕНГШЩЗХЇ", "ФІВАПРОЛДЖЄ", "ENTER ЯЧСМИТЬБЮҐ BACK"]
};

const regexPatterns = {
    en: /^[A-Z]$/,
    uk: /^[А-ЯІЇЄҐ]$/
};

const MAX_GUESSES = 6;
let targetWord = "";
let currentGuess = "";
let guesses = [];
let isGameOver = false;
let isAnimating = false;

function toggleLanguage() {
    currentLang = currentLang === 'uk' ? 'en' : 'uk';
    document.documentElement.lang = currentLang;
    
    // Оновлення текстів інтерфейсу
    document.getElementById('title').innerText = uiStrings[currentLang].title;
    document.getElementById('subtitle').innerText = uiStrings[currentLang].subtitle;
    document.getElementById('start-btn').innerText = uiStrings[currentLang].startBtn;
    document.getElementById('rolling-msg').innerText = uiStrings[currentLang].rollingMsg;
    
    // Скидання гри до стартового екрану при зміні мови
    resetToLanding();
}

function resetToLanding() {
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('dice-screen').style.display = 'none';
    document.getElementById('keyboard').style.display = 'none';
    document.getElementById('landing-screen').style.display = 'flex';
    document.getElementById('message').innerText = "";
    
    // Видаляємо кнопку "Грати знову", якщо вона є
    const playAgainBtn = document.getElementById('play-again-btn');
    if (playAgainBtn) playAgainBtn.remove();
}

function startDiceRoll() {
    document.getElementById('landing-screen').style.display = 'none';
    document.getElementById('dice-screen').style.display = 'flex';
    
    const chip = document.getElementById('chip');
    let rolls = 0;
    
    const rollInterval = setInterval(() => {
        chip.innerText = Math.floor(Math.random() * 6) + 4;
        rolls++;
        
        if (rolls > 20) {
            clearInterval(rollInterval);
            const finalLength = Math.floor(Math.random() * 6) + 4;
            chip.innerText = finalLength;
            chip.style.transform = "scale(1.2)";
            chip.style.transition = "transform 0.3s";
            
            setTimeout(() => {
                chip.style.transform = "scale(1)";
                initGame(finalLength);
            }, 1000);
        }
    }, 50);
}

function initGame(wordLength) {
    document.getElementById('dice-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'flex';
    document.getElementById('keyboard').style.display = 'flex';
    
    const words = dictionaries[currentLang][wordLength];
    targetWord = words[Math.floor(Math.random() * words.length)];
    currentGuess = "";
    guesses = [];
    isGameOver = false;
    isAnimating = false;
    document.getElementById('message').innerText = "";

    renderGrid(wordLength);
    buildKeyboard();
}

function renderGrid(length) {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${length}, 1fr)`;
    
    for (let r = 0; r < MAX_GUESSES; r++) {
        for (let c = 0; c < length; c++) {
            const cell = document.createElement('span');
            cell.className = 'cell';
            cell.id = `cell-${r}-${c}`;
            grid.appendChild(cell);
        }
    }
}

function buildKeyboard() {
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    const layout = keyboardLayouts[currentLang];
    
    layout.forEach(rowStr => {
        const rowMenu = document.createElement('menu');
        rowMenu.className = 'keyboard-row';
        
        let keys = rowStr.split('');
        if (rowStr.includes("ENTER")) {
            if(currentLang === 'uk') keys = ["ENTER", "Я", "Ч", "С", "М", "И", "Т", "Ь", "Б", "Ю", "Ґ", "BACK"];
            if(currentLang === 'en') keys = ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"];
        }

        keys.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key';
            if (key === "ENTER" || key === "BACK") {
                btn.classList.add('wide');
            }
            btn.innerText = key === "BACK" ? "⌫" : key;
            btn.id = `key-${key}`;
            btn.onclick = () => handleInput(key);
            rowMenu.appendChild(btn);
        });
        kb.appendChild(rowMenu);
    });
}

function handleInput(key) {
    if (isGameOver || isAnimating) return;

    if (key === 'BACK' || key === 'BACKSPACE') {
        currentGuess = currentGuess.slice(0, -1);
    } else if (key === 'ENTER') {
        submitGuess();
    } else if (regexPatterns[currentLang].test(key) && currentGuess.length < targetWord.length) {
        currentGuess += key;
    }
    
    updateGrid();
}

function updateGrid() {
    for (let c = 0; c < targetWord.length; c++) {
        const cell = document.getElementById(`cell-${guesses.length}-${c}`);
        if (cell) cell.innerText = currentGuess[c] || "";
    }
}

function submitGuess() {
    if (currentGuess.length !== targetWord.length) {
        showMessage(uiStrings[currentLang].notEnoughMsg);
        return;
    }

    isAnimating = true;
    const row = guesses.length;
    let targetArray = targetWord.split('');
    let guessArray = currentGuess.split('');
    let statuses = Array(targetWord.length).fill('gray');

    for (let i = 0; i < targetWord.length; i++) {
        if (guessArray[i] === targetArray[i]) {
            statuses[i] = 'green';
            targetArray[i] = null;
        }
    }

    for (let i = 0; i < targetWord.length; i++) {
        if (statuses[i] !== 'green' && targetArray.includes(guessArray[i])) {
            statuses[i] = 'yellow';
            targetArray[targetArray.indexOf(guessArray[i])] = null;
        }
    }

    for (let i = 0; i < targetWord.length; i++) {
        setTimeout(() => {
            const cell = document.getElementById(`cell-${row}-${i}`);
            cell.classList.add('flip');

            setTimeout(() => {
                cell.classList.add(statuses[i]);
                updateKeyboardKey(guessArray[i], statuses[i]);
            }, 250);

        }, i * 300);
    }

    setTimeout(() => {
        guesses.push(currentGuess);
        isAnimating = false;
        checkWinCondition();
    }, targetWord.length * 300 + 250);
}

function updateKeyboardKey(letter, status) {
    const keyBtn = document.getElementById(`key-${letter}`);
    if (!keyBtn) return;

    if (status === 'green') {
        keyBtn.classList.remove('yellow', 'gray');
        keyBtn.classList.add('green');
    } else if (status === 'yellow' && !keyBtn.classList.contains('green')) {
        keyBtn.classList.remove('gray');
        keyBtn.classList.add('yellow');
    } else if (status === 'gray' && !keyBtn.classList.contains('green') && !keyBtn.classList.contains('yellow')) {
        keyBtn.classList.add('gray');
    }
}

function checkWinCondition() {
    if (currentGuess === targetWord) {
        showMessage(uiStrings[currentLang].jackpotMsg);
        endGame();
    } else if (guesses.length === MAX_GUESSES) {
        showMessage(`${uiStrings[currentLang].lossMsg} ${targetWord}.`);
        endGame();
    } else {
        currentGuess = "";
    }
}

function showMessage(msg) {
    document.getElementById('message').innerText = msg;
    setTimeout(() => {
        if (!isGameOver) document.getElementById('message').innerText = "";
    }, 2000);
}

function endGame() {
    isGameOver = true;
    setTimeout(() => {
        const playAgain = document.createElement('button');
        playAgain.innerText = uiStrings[currentLang].playAgainBtn;
        playAgain.className = "btn";
        playAgain.id = "play-again-btn";
        playAgain.style.marginTop = "20px";
        playAgain.onclick = () => resetToLanding();
        document.getElementById('game-screen').appendChild(playAgain);
    }, 1000);
}

window.addEventListener('keydown', (e) => {
    const key = e.key.toUpperCase();
    if (key === 'ENTER' || key === 'BACKSPACE' || regexPatterns[currentLang].test(key)) {
        handleInput(key === 'BACKSPACE' ? 'BACK' : key);
    }
});

// Ініціалізація UI при завантаженні сторінки
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('title').innerText = uiStrings[currentLang].title;
    document.getElementById('subtitle').innerText = uiStrings[currentLang].subtitle;
    document.getElementById('start-btn').innerText = uiStrings[currentLang].startBtn;
});