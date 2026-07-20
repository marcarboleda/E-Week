// --- Game State Variables ---
let cardDataStore = [];
let activeCardIndex = null;
let scratchedSpotsCount = 0;
let isEvaluatingResult = false;

// Game feature metrics
let currentLevelTier = 1; 
let playerExtraLives = 0; 

// Background Music State
let bgMusicInstance = null;

// --- DOM References ---
const mainMenu = document.getElementById('main-menu');
const gameScreen = document.getElementById('game-screen');
const scratchModal = document.getElementById('scratch-modal');
const modalCardInner = document.getElementById('modal-card-inner');
const modalSpotsContainer = document.getElementById('modal-spots-container');
const resultOverlay = document.getElementById('result-overlay');
const resultBox = document.querySelector('.result-box');
const resultTitle = document.getElementById('result-title');
const resultDescription = document.getElementById('result-description');
const actionBtn = document.getElementById('action-btn');
const upgradeBtn = document.getElementById('upgrade-btn');
const upgradeBtnText = document.getElementById('upgrade-btn-text');
const cardGrid = document.getElementById('card-grid');

// --- Navigation & Action Event Listeners ---
mainMenu.addEventListener('click', () => {
    playSound('click');
    initBackgroundMusic();
    startGameLoop();
});

actionBtn.addEventListener('click', () => {
    playSound('click');
    processClaimAndReset();
});

upgradeBtn.addEventListener('click', () => {
    playSound('click');
    processUpgradePath();
});

// --- Background Music System Controller ---
function initBackgroundMusic() {
    if (!bgMusicInstance) {
        bgMusicInstance = new Audio('assets/sounds/bg_music.mp3'); 
        bgMusicInstance.loop = true;
        bgMusicInstance.volume = 0.4; 
        
        bgMusicInstance.play().catch(error => {
            console.log("Audio autoplay prevented. Interaction handles activation.", error);
        });
    } else if (bgMusicInstance.paused) {
        bgMusicInstance.play().catch(() => {});
    }
}

// --- Initialize Game Board ---
function startGameLoop() {
    switchPanels(mainMenu, gameScreen);

    cardGrid.innerHTML = "";
    cardDataStore = [];

    // Build 9 Interactive Blank Landscape Cards
    for (let i = 0; i < 9; i++) {
        const rolledOutcome = rollCardPatternOutcome(currentLevelTier);
        cardDataStore.push(rolledOutcome);

        const card = document.createElement('div');
        card.classList.add('scratch-card');
        card.addEventListener('click', () => openCardModal(i));

        cardGrid.appendChild(card);
    }
}

// --- Dynamic Odds System Generator Engine ---
function rollCardPatternOutcome(tier) {
    const roll = Math.random() * 100;
    let type = 'lose'; 
    let spotImages = [];

    const imagesPool = ['assets/images/RAKS.png', 'assets/images/RAKSIE.png', 'assets/images/RAKXIII.png'];

    if (tier === 1) {
        if (roll < 50) type = 'lose';               
        else if (roll < 80) type = 'win-raks';       
        else if (roll < 95) type = 'win-raksie';     
        else type = 'win-rakxiii';                   
    }
    else if (tier === 2) {
        if (roll < 35) type = 'lose';               
        else if (roll < 70) type = 'win-raks';       
        else if (roll < 90) type = 'win-raksie';     
        else type = 'win-rakxiii';                   
    }
    else {
        if (roll < 25) type = 'lose';               
        else if (roll < 60) type = 'win-raks';       
        else if (roll < 85) type = 'win-raksie';     
        else type = 'win-rakxiii';                   
    }

    let validPatternCombination = false;

    while (!validPatternCombination) {
        spotImages = [];
        let counts = { 'raks': 0, 'raksie': 0, 'rakxiii': 0 };

        if (type !== 'lose') {
            // Step 1: Injected base targets
            if (type === 'win-raks') {
                spotImages = ['assets/images/RAKS.png', 'assets/images/RAKS.png', 'assets/images/RAKS.png'];
                counts['raks'] = 3;
            } else if (type === 'win-raksie') {
                spotImages = ['assets/images/RAKSIE.png', 'assets/images/RAKSIE.png', 'assets/images/RAKSIE.png'];
                counts['raksie'] = 3;
            } else if (type === 'win-rakxiii') {
                spotImages = ['assets/images/RAKXIII.png', 'assets/images/RAKXIII.png', 'assets/images/RAKXIII.png'];
                counts['rakxiii'] = 3;
            }

            // Step 2: Randomly populate remaining slots
            for (let j = 0; j < 3; j++) {
                let randImg = imagesPool[Math.floor(Math.random() * 3)];
                spotImages.push(randImg);
                if (randImg.includes('RAKS.png')) counts['raks']++;
                if (randImg.includes('RAKSIE.png')) counts['raksie']++;
                if (randImg.includes('RAKXIII.png')) counts['rakxiii']++;
            }

            // Step 3: STRICT SECURITY FILTER - Enforces EXACTLY 3 items for winners and strictly LESS THAN 3 for the rest
            if (type === 'win-raks' && counts['raks'] === 3 && counts['raksie'] < 3 && counts['rakxiii'] < 3) {
                validPatternCombination = true;
            } else if (type === 'win-raksie' && counts['raksie'] === 3 && counts['raks'] < 3 && counts['rakxiii'] < 3) {
                validPatternCombination = true;
            } else if (type === 'win-rakxiii' && counts['rakxiii'] === 3 && counts['raks'] < 3 && counts['raksie'] < 3) {
                validPatternCombination = true;
            }
        } 
        else {
            // Generate clean complete lose structures (no icon has 3 or more)
            for (let j = 0; j < 6; j++) {
                let randImg = imagesPool[Math.floor(Math.random() * 3)];
                spotImages.push(randImg);
                if (randImg.includes('RAKS.png')) counts['raks']++;
                if (randImg.includes('RAKSIE.png')) counts['raksie']++;
                if (randImg.includes('RAKXIII.png')) counts['rakxiii']++;
            }
            if (counts['raks'] < 3 && counts['raksie'] < 3 && counts['rakxiii'] < 3) {
                validPatternCombination = true;
            }
        }
    }

    spotImages.sort(() => Math.random() - 0.5);

    return {
        type: type,
        isWin: type !== 'lose',
        spots: spotImages
    };
}

// --- Open & Flip Landscape Card ---
function openCardModal(index) {
    playSound('click');
    activeCardIndex = index;
    scratchedSpotsCount = 0;
    isEvaluatingResult = false;
    
    resultOverlay.classList.add('hidden');
    const cardData = cardDataStore[index];

    modalSpotsContainer.innerHTML = '';
    modalCardInner.classList.remove('flipped');

    cardData.spots.forEach((imagePath) => {
        const spotWrapper = document.createElement('div');
        spotWrapper.className = 'spot-wrapper';
        spotWrapper.style.backgroundImage = `url('${imagePath}')`;

        const canvas = document.createElement('canvas');
        canvas.className = 'scratch-canvas';

        spotWrapper.appendChild(canvas);
        modalSpotsContainer.appendChild(spotWrapper);

        setTimeout(() => setupSmoothScratch(canvas), 50);
    });

    switchPanels(null, scratchModal);

    setTimeout(() => {
        playSound('flip');
        modalCardInner.classList.add('flipped');
    }, 250);
}

// --- Check When All 6 Circles are Scratched ---
function checkScratchProgress() {
    scratchedSpotsCount++;
    if (scratchedSpotsCount >= 6 && !isEvaluatingResult) {
        isEvaluatingResult = true;
        setTimeout(evaluateAndPromptResult, 500);
    }
}

// Custom Result UI presentation customization rules engine
function evaluateAndPromptResult() {
    const cardData = cardDataStore[activeCardIndex];
    const actionBtnSurface = actionBtn.querySelector('.btn-surface');

    if (currentLevelTier >= 3) {
        upgradeBtn.classList.add('hidden');
    } else {
        upgradeBtn.classList.remove('hidden');
        upgradeBtnText.innerText = "UPGRADE"; 
    }

    if (cardData.isWin) {
        resultBox.classList.remove('defeat-style-box');
        if (actionBtnSurface) actionBtnSurface.innerText = "REDEEM REWARDS";

        if (cardData.type === 'win-raks') {
            resultTitle.innerText = "RAKS WIN!";
            resultDescription.innerText = "You found 3 Smiling RAKS! Reward: One (1) Extra Life added to your pool.";
        } else if (cardData.type === 'win-raksie') {
            resultTitle.innerText = "RAKSIE WIN!";
            resultDescription.innerText = "You found 3 Smiling RAKSIE! Reward: An official Musikalista Sticker Pack!";
        } else if (cardData.type === 'win-rakxiii') {
            resultTitle.innerText = "RAKXIII WIN!";
            resultDescription.innerText = "Ultimate Prize! Reward: Musikalista Sticker Pack + Custom Merch Pin!";
        }
        playSound('win');
    } else {
        resultBox.classList.add('defeat-style-box');
        resultTitle.innerText = "NO MATCH";
        resultDescription.innerText = "Better luck next time! Try upgrading your card tier to boost prize probabilities.";
        if (actionBtnSurface) actionBtnSurface.innerText = "MAIN MENU";
        playSound('lose');
    }

    resultOverlay.classList.remove('hidden');
}

// --- Reward Processing Workflow ---
function processClaimAndReset() {
    const cardData = cardDataStore[activeCardIndex];
    if (cardData && cardData.type === 'win-raks') {
        playerExtraLives++;
    }
    currentLevelTier = 1;
    returnToMainMenu();
}

// --- Upgrade Tier Workflow ---
function processUpgradePath() {
    if (currentLevelTier < 3) {
        currentLevelTier++;
        resultOverlay.classList.add('hidden');
        scratchModal.classList.add('hidden');
        startGameLoop();
    }
}

// --- Navigation Back to Main Menu ---
function returnToMainMenu() {
    resultOverlay.classList.add('hidden');
    scratchModal.classList.add('hidden');
    gameScreen.classList.add('hidden');
    switchPanels(null, mainMenu);
}

function switchPanels(outgoing, incoming) {
    if (outgoing) {
        outgoing.classList.remove('active');
        outgoing.classList.add('hidden');
    }
    if (incoming) {
        incoming.classList.remove('hidden');
        incoming.classList.add('active');
    }
}

// Global Browser Autoplay Unblockers
window.addEventListener('click', () => { initBackgroundMusic(); }, { once: true });
window.addEventListener('touchstart', () => { initBackgroundMusic(); }, { once: true });