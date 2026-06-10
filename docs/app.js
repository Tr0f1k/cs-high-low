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
const playerAButton = document.getElementById('playerA');
const playerBButton = document.getElementById('playerB');
const scoreElement = document.getElementById('score');
const resultElement = document.getElementById('result');

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
    cardsArea.hidden = true;
    activePlayers = [];
    usedPlayerTags = new Set();

    score = 0;
    answered = false;
    isFirstRound = true;

    currentPlayer = null;
    challengerPlayer = null;

    scoreElement.textContent = score;
    resultElement.textContent = '';
    gameOverArea.hidden = true;

    gameArea.hidden = true;
    difficultySelector.hidden = false;

    difficultyButtons.forEach(button => {
        button.classList.remove('active');
    });
}

function startGame(difficulty) {
    selectedDifficulty = difficulty;
    usedPlayerTags = new Set();
    cardsArea.hidden = false;
    difficultySelector.hidden = true;
    gameArea.hidden = false;
    gameOverArea.hidden = true;

    setActivePlayers();

    score = 0;
    answered = false;
    isFirstRound = true;

    scoreElement.textContent = score;
    resultElement.textContent = '';

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
    resultElement.textContent = '';
    cardsArea.hidden = false;
    challengerPlayer = getRandomPlayerExcept(currentPlayer);

    renderRound();
}

function renderRound() {
    renderPlayer(playerAButton, currentPlayer, !isFirstRound);
    renderPlayer(playerBButton, challengerPlayer, false);
}

function renderPlayer(button, player, showMajors = false) {
    const image = player.image ?? '/images/players/default.webp';
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

function choosePlayer(selectedPlayer) {
    if (answered) {
        return;
    }

    answered = true;

    const otherPlayer = selectedPlayer === currentPlayer
        ? challengerPlayer
        : currentPlayer;

    const isCorrect = selectedPlayer.majors > otherPlayer.majors;

    renderPlayer(playerAButton, currentPlayer, true);
    renderPlayer(playerBButton, challengerPlayer, true);

    usedPlayerTags.add(currentPlayer.tag);
    usedPlayerTags.add(challengerPlayer.tag);

    if (isCorrect) {
        score++;
        scoreElement.textContent = score;

        resultElement.textContent =
            `Correct! ${selectedPlayer.tag}: ${selectedPlayer.majors} vs ${otherPlayer.tag}: ${otherPlayer.majors}`;

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
        resultElement.textContent =
            `Wrong! ${selectedPlayer.tag}: ${selectedPlayer.majors} vs ${otherPlayer.tag}: ${otherPlayer.majors}`;

        setTimeout(() => {
            cardsArea.hidden = true;
            finalScoreElement.textContent = score;
            gameOverArea.hidden = false;
        }, 2000);
    }
}

function getRandomPlayer() {
    return activePlayers[Math.floor(Math.random() * activePlayers.length)];
}

function getRandomPlayerExcept(excludedPlayer) {
    const availablePlayers = activePlayers.filter(player =>
        player.tag !== excludedPlayer.tag &&
        player.majors !== excludedPlayer.majors &&
        !usedPlayerTags.has(player.tag)
    );

    if (availablePlayers.length === 0) {
        resultElement.textContent = 'No more valid players available.';
        finalScoreElement.textContent = score;
        cardsArea.hidden = true;
        gameOverArea.hidden = false;
        throw new Error('No available players left for this run.');
    }

    return availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
}

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        const difficulty = Number(button.dataset.difficulty);
        button.classList.add('active');
        startGame(difficulty);
    });
});

playerAButton.addEventListener('click', () => choosePlayer(currentPlayer));
playerBButton.addEventListener('click', () => choosePlayer(challengerPlayer));

playAgainButton.addEventListener('click', () => {
    startGame(selectedDifficulty);
});

chooseDifficultyButton.addEventListener('click', showDifficultyMenu);

loadPlayers();