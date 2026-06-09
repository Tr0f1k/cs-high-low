import './styles/app.css';

let players = [];
let currentPlayer = null;
let challengerPlayer = null;
let score = 0;
let answered = false;
let isFirstRound = true;

const playerAButton = document.getElementById('playerA');
const playerBButton = document.getElementById('playerB');
const scoreElement = document.getElementById('score');
const resultElement = document.getElementById('result');
const nextButton = document.getElementById('nextBtn');

async function loadPlayers() {
    const response = await fetch('/data/players.json');
    players = await response.json();

    startGame();
}

function startGame() {
    score = 0;
    answered = false;
    isFirstRound = true;

    scoreElement.textContent = score;
    resultElement.textContent = '';
    nextButton.hidden = true;

    currentPlayer = getRandomPlayer();
    challengerPlayer = getRandomPlayerExcept(currentPlayer);

    renderRound();
}

function startNextRound() {
    answered = false;
    resultElement.textContent = '';
    nextButton.hidden = true;

    challengerPlayer = getRandomPlayerExcept(currentPlayer);

    renderRound();
}

function renderRound() {
    renderPlayer(playerAButton, currentPlayer);
    renderPlayer(playerBButton, challengerPlayer);
}

function renderPlayer(button, player) {
    const image = player.image ?? '/images/players/default.webp';
    const name = player.name ?? '';
    const country = player.country ?? '';

    button.innerHTML = `
        <img class="player-image" src="${image}" alt="${player.tag}">
        <strong>${player.tag}</strong>
        <span>${name}</span>
        <span>${country}</span>
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
    } else {
        resultElement.textContent =
            `Wrong! ${selectedPlayer.tag}: ${selectedPlayer.majors} vs ${otherPlayer.tag}: ${otherPlayer.majors}`;

        score = 0;
        scoreElement.textContent = score;
    }

    nextButton.hidden = false;
}

function getRandomPlayer() {
    return players[Math.floor(Math.random() * players.length)];
}

function getRandomPlayerExcept(excludedPlayer) {
    const availablePlayers = players.filter(player =>
        player.tag !== excludedPlayer.tag &&
        player.majors !== excludedPlayer.majors
    );

    if (availablePlayers.length === 0) {
        resultElement.textContent = 'No more valid players available.';
        nextButton.hidden = true;
        throw new Error('No available players with different Major count.');
    }

    return availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
}

playerAButton.addEventListener('click', () => choosePlayer(currentPlayer));
playerBButton.addEventListener('click', () => choosePlayer(challengerPlayer));
nextButton.addEventListener('click', startNextRound);

loadPlayers();