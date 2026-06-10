let players = [];
let activePlayers = [];
let usedPlayerTags = new Set();

let currentPlayer = null;
let challengerPlayer = null;

let score = 0;
let answered = false;
let isFirstRound = true;
let selectedDifficulty = null;

const difficultySelector = document.getElementById('difficultySelector');
const gameArea = document.getElementById('gameArea');
const cardsArea = document.getElementById('cardsArea');
const scoreContainer = document.getElementById('scoreContainer');
const playerAButton = document.getElementById('playerA');
const playerBButton = document.getElementById('playerB');

const scoreElement = document.getElementById('score');

const gameOverArea = document.getElementById('gameOverArea');
const finalScoreElement = document.getElementById('finalScore');
const playAgainButton = document.getElementById('playAgainBtn');
const chooseDifficultyButton = document.getElementById('chooseDifficultyBtn');

const difficultyButtons = document.querySelectorAll('.difficulty-btn');

async function loadPlayers() {
    const response = await fetch('./data/players.json');
    players = await response.json();

    showDifficultyMenu();
}

function showDifficultyMenu() {
    selectedDifficulty = null;
    activePlayers = [];
    usedPlayerTags = new Set();
    scoreContainer.hidden = true;
    score = 0;
    answered = false;
    isFirstRound = true;

    currentPlayer = null;
    challengerPlayer = null;

    scoreElement.textContent = '0';

    gameArea.hidden = true;
    cardsArea.hidden = true;
    gameOverArea.hidden = true;

    difficultySelector.hidden = false;

    difficultyButtons.forEach(button => {
        button.classList.remove('active');
    });

    clearCardStates();
}

function startGame(difficulty) {
    selectedDifficulty = difficulty;
    scoreContainer.hidden = false;
    difficultySelector.hidden = true;
    gameArea.hidden = false;
    cardsArea.hidden = false;
    gameOverArea.hidden = true;

    usedPlayerTags = new Set();

    setActivePlayers();

    score = 0;
    answered = false;
    isFirstRound = true;

    scoreElement.textContent = score;

    clearCardStates();

    currentPlayer = getRandomPlayer();
    challengerPlayer = getRandomPlayerExcept(currentPlayer);

    renderRound();
}

function setActivePlayers() {
    activePlayers = players.filter(player =>
        selectedDifficulty >= player.difficulty
    );
}

function startNextRound() {
    answered = false;

    clearCardStates();

    challengerPlayer = getRandomPlayerExcept(currentPlayer);

    renderRound();
}

function renderRound() {
    renderPlayer(playerAButton, currentPlayer, !isFirstRound);
    renderPlayer(playerBButton, challengerPlayer, false);
}

function renderPlayer(button, player, showMajors = false) {
    const image = player.image ?? './images/players/default.webp';
    const name = player.name ?? '';
    const country = player.country ?? '';

    button.innerHTML = `
        <img class="player-image" src="${image}" alt="${player.tag}">
        <strong>${player.tag}</strong>
        <span>${name}</span>
        <span>${country}</span>
        ${showMajors ? `<div class="major-count">${player.majors} Majors</div>` : ''}
    `;
}

function clearCardStates() {
    playerAButton.classList.remove('correct', 'wrong');
    playerBButton.classList.remove('correct', 'wrong');
}

function choosePlayer(selectedPlayer) {
    if (answered) {
        return;
    }

    answered = true;

    const otherPlayer =
        selectedPlayer === currentPlayer
            ? challengerPlayer
            : currentPlayer;

    const isCorrect =
        selectedPlayer.majors > otherPlayer.majors;

    renderPlayer(playerAButton, currentPlayer, true);
    renderPlayer(playerBButton, challengerPlayer, true);

    usedPlayerTags.add(currentPlayer.tag);
    usedPlayerTags.add(challengerPlayer.tag);

    const currentPlayerIsHigher =
        currentPlayer.majors > challengerPlayer.majors;

    if (currentPlayerIsHigher) {
        playerAButton.classList.add('correct');
        playerBButton.classList.add('wrong');
    } else {
        playerBButton.classList.add('correct');
        playerAButton.classList.add('wrong');
    }

    if (isCorrect) {
        score++;
        scoreElement.textContent = score;

        if (isFirstRound) {
            currentPlayer = selectedPlayer;
            isFirstRound = false;
        } else {
            currentPlayer = challengerPlayer;
        }

        setTimeout(() => {
            startNextRound();
        }, 2000);
    } else {
        setTimeout(() => {
            cardsArea.hidden = true;
            scoreContainer.hidden = true;

            finalScoreElement.textContent = score;

            gameOverArea.hidden = false;
        }, 2000);
    }
}

function getRandomPlayer() {
    return activePlayers[
        Math.floor(Math.random() * activePlayers.length)
    ];
}

function getRandomPlayerExcept(excludedPlayer) {
    const availablePlayers = activePlayers.filter(player =>
        player.tag !== excludedPlayer.tag &&
        player.majors !== excludedPlayer.majors &&
        !usedPlayerTags.has(player.tag)
    );

    if (availablePlayers.length === 0) {
        cardsArea.hidden = true;
        scoreContainer.hidden = true;

        finalScoreElement.textContent = score;

        gameOverArea.hidden = false;

        throw new Error(
            'No available players left for this run.'
        );
    }

    return availablePlayers[
        Math.floor(Math.random() * availablePlayers.length)
    ];
}

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const difficulty =
            Number(button.dataset.difficulty);

        button.classList.add('active');

        startGame(difficulty);
    });
});

playerAButton.addEventListener('click', () =>
    choosePlayer(currentPlayer)
);

playerBButton.addEventListener('click', () =>
    choosePlayer(challengerPlayer)
);

playAgainButton.addEventListener('click', () => {
    startGame(selectedDifficulty);
});

chooseDifficultyButton.addEventListener(
    'click',
    showDifficultyMenu
);

loadPlayers();