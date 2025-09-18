const socket = io();
let currentRoomCode = '';
let isHost = false;
let cardRevealed = false;
let playerCount = 0;
let isRandomMode = false;
let amI_Eliminated = false;

const startScreen = document.getElementById('startScreen');
const joinScreen = document.getElementById('joinScreen');
const gameLobby = document.getElementById('gameLobby');
const gameScreen = document.getElementById('gameScreen');
const votingScreen = document.getElementById('votingScreen');
const endGameScreen = document.getElementById('endGameScreen');
const eliminatedScreen = document.getElementById('eliminatedScreen');
const playerNameInput = document.getElementById('playerNameInput');
const createGameBtn = document.getElementById('createGameBtn');
const showJoinScreenBtn = document.getElementById('showJoinScreenBtn');
const gameCodeInput = document.getElementById('gameCodeInput');
const joinGameBtn = document.getElementById('joinGameBtn');
const backBtns = document.querySelectorAll('.back-btn');
const exitBtns = document.querySelectorAll('.exit-button');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const playerList = document.getElementById('playerList');
const hostSettings = document.getElementById('hostSettings');
const waitingMessage = document.getElementById('waitingMessage');
const startGameBtn = document.getElementById('startGameBtn');
const categorySelect = document.getElementById('categorySelect');
const difficultySelect = document.getElementById('difficultySelect');
const impostorsMinusBtn = document.getElementById('impostorsMinusBtn');
const impostorsCount = document.getElementById('impostorsCount');
const impostorsPlusBtn = document.getElementById('impostorsPlusBtn');
const roundsMinusBtn = document.getElementById('roundsMinusBtn');
const roundsCount = document.getElementById('roundsCount');
const roundsPlusBtn = document.getElementById('roundsPlusBtn');
const impostorHintCheckbox = document.getElementById('impostorHintCheckbox');
const randomImpostorsCheckbox = document.getElementById('randomImpostorsCheckbox');
const card = document.querySelector('.card');
const roleDisplay = document.getElementById('roleDisplay');
const passwordContainer = document.getElementById('passwordContainer');
const revealStatus = document.getElementById('revealStatus');
const turnCountdown = document.getElementById('turnCountdown');
const votingOptions = document.getElementById('votingOptions');
const voteStatus = document.getElementById('voteStatus');
const submitVoteBtn = document.getElementById('submitVoteBtn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');
const toast = document.getElementById('toast');
const endGameTitle = document.getElementById('endGameTitle');
const endGameText = document.getElementById('endGameText');
const roundInfo = document.getElementById('roundInfo');
const scoreboard = document.getElementById('scoreboard');
const endGameButtons = document.getElementById('endGameButtons');
const lobbyCategoryTile = document.getElementById('lobbyCategoryTile');
const categoryScreen = document.getElementById('categoryScreen');
const backToLobbyBtn = document.getElementById('backToLobbyBtn');
const categoryTiles = document.querySelectorAll('#categoryScreen .category-tile');
const currentCategoryName = document.getElementById('currentCategoryName');
const currentCategoryIcon = document.getElementById('currentCategoryIcon');
const difficultySelector = document.querySelector('.difficulty-selector');
const settingsPanel = document.querySelector('.settings-panel');

if (difficultySelector) {
    difficultySelector.addEventListener('click', (event) => {
        if (event.target.classList.contains('difficulty-btn')) {
            difficultySelector.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
            const newDifficulty = event.target.dataset.difficulty;
            difficultySelect.value = newDifficulty;
            if(settingsPanel) {
                settingsPanel.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
                settingsPanel.classList.add(`difficulty-${newDifficulty}`);
            }
            updateSettings();
        }
    });
}

function getMaxImpostors(playerCount) { if (playerCount < 3) return 1; return Math.floor((playerCount - 1) / 2); }

function updateSettings() {
    if (!isHost) return;
    const newSettings = {
        category: categorySelect.value,
        difficulty: difficultySelect.value,
        impostors: parseInt(impostorsCount.innerText) || 1,
        rounds: parseInt(roundsCount.innerText),
        impostorHint: impostorHintCheckbox.checked,
        randomImpostors: randomImpostorsCheckbox.checked
    };
    socket.emit('updateSettings', { roomCode: currentRoomCode, settings: newSettings });
}

function showModal(title, text, showButton = true) { modalTitle.innerText = title; modalText.innerText = text; modalCloseBtn.style.display = showButton ? 'inline-block' : 'none'; modal.style.display = 'flex'; }

function showScreen(screenToShow) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); screenToShow.classList.add('active'); }

function showTurnScreen(playerName) {
    votingScreen.classList.remove('active');
    showScreen(gameScreen);
    card.style.display = 'none';
    revealStatus.innerHTML = '';

    let buttonsHTML = '';
    if (isRandomMode) {
        const initialCounts = `(0/${playerCount})`;
        buttonsHTML = `
            <button id="goToVoteBtn">
                <span class="button-text">Przejdź do Głosowania</span>
                <div class="count-box" id="voteCountDisplay">${initialCounts}</div>
            </button>
            <button id="declareVictoryBtn">
                <span class="button-text">Nie ma więcej impostorów</span>
                <div class="count-box" id="endRoundCountDisplay">${initialCounts}</div>
            </button>
        `;
    } else {
        buttonsHTML = '<button id="goToVoteBtn">Przejdź do Głosowania</button>';
    }

    turnCountdown.innerHTML = `<div class="turn-info-container"><h2>Tura gracza:</h2><p>${playerName}</p>${buttonsHTML}</div>`;

    const goToVoteBtn = document.getElementById('goToVoteBtn');
    if (goToVoteBtn) {
        goToVoteBtn.disabled = amI_Eliminated;
        goToVoteBtn.addEventListener('click', () => { socket.emit('requestVoting', currentRoomCode); });
    }

    const declareVictoryBtn = document.getElementById('declareVictoryBtn');
    if (declareVictoryBtn) {
        declareVictoryBtn.disabled = amI_Eliminated;
        declareVictoryBtn.addEventListener('click', () => {
            socket.emit('playerVotedToEndRound', currentRoomCode);
        });
    }
}

modalCloseBtn.addEventListener('click', () => { modal.style.display = 'none'; });
createGameBtn.addEventListener('click', () => { socket.emit('createGame', { playerName: playerNameInput.value }); });
showJoinScreenBtn.addEventListener('click', () => showScreen(joinScreen));
backBtns.forEach(btn => btn.addEventListener('click', () => showScreen(startScreen)));
exitBtns.forEach(btn => btn.addEventListener('click', () => {
    confirmText.innerText = 'Czy na pewno chcesz opuścić grę i wrócić do menu głównego?';
    confirmModal.style.display = 'flex';
    confirmYesBtn.onclick = () => window.location.reload();
    confirmNoBtn.onclick = () => confirmModal.style.display = 'none';
}));
joinGameBtn.addEventListener('click', () => { socket.emit('joinGame', { code: gameCodeInput.value, playerName: playerNameInput.value }); });
startGameBtn.addEventListener('click', () => { socket.emit('startGame', currentRoomCode); });
card.addEventListener('click', () => { card.classList.toggle('is-flipped'); if (!cardRevealed) { socket.emit('playerRevealedCard', currentRoomCode); cardRevealed = true; } });
impostorsMinusBtn.addEventListener('click', () => { let count = parseInt(impostorsCount.innerText); if (count > 1) { impostorsCount.innerText = count - 1; updateSettings(); } });
impostorsPlusBtn.addEventListener('click', () => { let count = parseInt(impostorsCount.innerText); const max = getMaxImpostors(playerCount); if (count < max) { impostorsCount.innerText = count + 1; updateSettings(); } });
roundsMinusBtn.addEventListener('click', () => { let count = parseInt(roundsCount.innerText); if (count > 1) { roundsCount.innerText = count - 1; updateSettings(); } });
roundsPlusBtn.addEventListener('click', () => { roundsCount.innerText++; updateSettings(); });
difficultySelect.addEventListener('change', updateSettings);
impostorHintCheckbox.addEventListener('change', updateSettings);

randomImpostorsCheckbox.addEventListener('change', () => {
    const isRandom = randomImpostorsCheckbox.checked;
    impostorsMinusBtn.disabled = isRandom;
    impostorsPlusBtn.disabled = isRandom;
    if (isRandom) {
        impostorsCount.dataset.savedValue = impostorsCount.innerText;
        impostorsCount.innerText = '?';
    } else {
        impostorsCount.innerText = impostorsCount.dataset.savedValue || '1';
    }
    updateSettings();
});

submitVoteBtn.addEventListener('click', () => {
    const selectedPlayer = document.querySelector('input[name="vote"]:checked');
    if (selectedPlayer) {
        const votedPlayerId = selectedPlayer.value;
        socket.emit('playerVoted', { roomCode: currentRoomCode, votedPlayerId });
        if (isRandomMode) {
            showScreen(gameScreen);
        } else {
            submitVoteBtn.disabled = true;
            voteStatus.innerHTML = 'Twój głos został oddany. Czekanie na innych...';
        }
    } else { alert('Musisz kogoś wybrać!'); }
});

lobbyCategoryTile.addEventListener('click', () => {
    if (isHost) {
        showScreen(categoryScreen);
    }
});

backToLobbyBtn.addEventListener('click', () => {
    showScreen(gameLobby);
});

categoryTiles.forEach(tile => {
    tile.addEventListener('click', () => {
        const selectedCategory = tile.dataset.category;
        const selectedIconSrc = tile.querySelector('img').src;
        currentCategoryName.innerText = selectedCategory;
        currentCategoryIcon.src = selectedIconSrc;
        categorySelect.value = selectedCategory;
        updateSettings();
        showScreen(gameLobby);
    });
});

socket.on('gameCreated', code => { currentRoomCode = code; showScreen(gameLobby); });
socket.on('joinError', message => { alert(message); });
socket.on('updateLobby', ({ players, settings, hostId }) => {
    playerCount = players.length;
    
    playerList.innerHTML = '';
    players.forEach(player => { const li = document.createElement('li'); li.innerText = player.name + (player.id === hostId ? ' 👑 (Host)' : ''); playerList.appendChild(li); });
    gameCodeDisplay.innerText = currentRoomCode;
    impostorsCount.innerText = settings.randomImpostors ? '?' : settings.impostors;
    roundsCount.innerText = settings.rounds;
    impostorHintCheckbox.checked = settings.impostorHint;
    randomImpostorsCheckbox.checked = settings.randomImpostors;
    impostorsMinusBtn.disabled = settings.randomImpostors;
    impostorsPlusBtn.disabled = settings.randomImpostors;
    categorySelect.value = settings.category;
    difficultySelect.value = settings.difficulty;
    currentCategoryName.innerText = settings.category;
    const tile = document.querySelector(`.category-tile[data-category="${settings.category}"]`);
    if (tile) { currentCategoryIcon.src = tile.querySelector('img').src; }
    isHost = (socket.id === hostId);
    hostSettings.style.display = isHost ? 'block' : 'none';
    if (isHost) {
        if (playerCount < 3) {
            startGameBtn.disabled = true;
            startGameBtn.innerText = 'Potrzeba min. 3 graczy';
        } else {
            startGameBtn.disabled = false;
            startGameBtn.innerText = 'Start!';
        }
    }

    waitingMessage.style.display = isHost ? 'none' : 'block';
    if (!isHost) {
        const hostPlayer = players.find(p => p.id === hostId);
        waitingMessage.innerHTML = `Oczekiwanie na rozpoczęcie gry przez hosta (<strong>${hostPlayer ? hostPlayer.name : ''}</strong>)...`;
    }

    if(settingsPanel) {
        settingsPanel.classList.remove('difficulty-easy', 'difficulty-medium', 'difficulty-hard');
        settingsPanel.classList.add(`difficulty-${settings.difficulty}`);
    }
});
socket.on('gameStarted', (data) => {
    amI_Eliminated = false;
    modal.style.display = 'none';
    cardRevealed = false; card.classList.remove('is-flipped'); card.style.display = 'block';
    turnCountdown.innerHTML = '';
    revealStatus.innerHTML = '';
    isRandomMode = data.isRandomMode;
    showScreen(gameScreen);
    if (data.role === 'impostor') {
        roleDisplay.innerText = 'Jesteś Impostorem!'; roleDisplay.parentElement.className = 'card-front role-impostor';
        passwordContainer.innerHTML = data.hint ? `Podpowiedź: <strong>${data.hint}</strong>` : 'Musisz zgadnąć hasło!';
    } else {
        roleDisplay.innerText = 'Zapamiętaj Hasło!'; roleDisplay.parentElement.className = 'card-front role-crewmate';
        passwordContainer.innerHTML = `Hasło: <strong>${data.password}</strong>`;
    }
});
socket.on('updateRevealStatus', ({ revealedCount, totalPlayers, unrevealedNames }) => {
    let statusText = `Odkryto kart: ${revealedCount} / ${totalPlayers}`;
    if (totalPlayers - revealedCount <= 3 && unrevealedNames.length > 0) {
        statusText += `<br><small>Oczekuję na:</small><div class="unrevealed-list-container"><ul id="unrevealedList">${unrevealedNames.map(name => `<li>${name}</li>`).join('')}</ul></div>`;
    }
    revealStatus.innerHTML = statusText;
});
socket.on('startTurnCountdown', (countdown) => {
    card.style.display = 'none';
    revealStatus.innerHTML = '';
    turnCountdown.innerHTML = `Gra rozpocznie się za: <strong>${countdown}</strong>`;
});
socket.on('turnStarted', (playerName) => { showTurnScreen(playerName); });
socket.on('votingStarted', (players) => {
    showScreen(votingScreen);
    submitVoteBtn.disabled = false;
    voteStatus.innerHTML = '';
    votingOptions.innerHTML = '';
    players.forEach(player => {
        if (player.id !== socket.id) {
            const label = document.createElement('label'); label.className = 'player-vote-label';
            const radio = document.createElement('input'); radio.type = 'radio'; radio.name = 'vote'; radio.value = player.id;
            const span = document.createElement('span'); span.innerText = ` ${player.name}`;
            label.appendChild(radio); label.appendChild(span);
            votingOptions.appendChild(label);
        }
    });
});
socket.on('updateActionCounts', ({ toEliminate, toEndRound, totalPlayers }) => {
    const voteCountDisplay = document.getElementById('voteCountDisplay');
    const endRoundCountDisplay = document.getElementById('endRoundCountDisplay');
    if (voteCountDisplay) voteCountDisplay.innerText = `(${toEliminate}/${totalPlayers})`;
    if (endRoundCountDisplay) endRoundCountDisplay.innerText = `(${toEndRound}/${totalPlayers})`;
});
socket.on('updateVoteStatus', ({ votedCount, totalPlayers, unvotedNames }) => {
    let statusText = `Zagłosowało: ${votedCount} / ${totalPlayers}`;
    if (unvotedNames && unvotedNames.length > 0) { statusText += `<br><small>Oczekuję na:</small><div>${unvotedNames.join(', ')}</div>`; }
    voteStatus.innerHTML = statusText;
});
socket.on('voteResult', ({ outcome, playerName, eliminatedPlayerId }) => {
    if (outcome === 'eliminated') {
        if (eliminatedPlayerId === socket.id) {
            amI_Eliminated = true;
            showScreen(eliminatedScreen);
        } else {
            showModal('Wynik głosowania', `Większością głosów wyrzucono gracza: ${playerName}!`);
        }
    } else if (outcome === 'tie') {
        showModal('Remis!', 'Nikt nie został wyrzucony. Runda toczy się dalej.');
    }
});
socket.on('newRound', ({ startingPlayerName, newPlayerCount }) => {
    if (amI_Eliminated) return;
    amI_Eliminated = false;
    if (newPlayerCount) playerCount = newPlayerCount;
    modal.style.display = 'none';
    showTurnScreen(startingPlayerName);
});
socket.on('gameOver', ({ winner, impostors, password, scores, currentRound, totalRounds, isFinal }) => {
    modal.style.display = 'none';
    showScreen(endGameScreen);
    
    const myName = playerNameInput.value || `Gracz_${socket.id.substring(0, 4)}`;
    const myPlayerObject = scores.find(p => p.name === myName);
    const amIImpostor = myPlayerObject ? myPlayerObject.role === 'impostor' : false;

    if (isFinal) {
        endGameTitle.innerText = "🏁 KONIEC GRY! 🏁";
        roundInfo.innerText = `Ostateczny wynik po ${totalRounds} rundach.`;
        endGameButtons.innerHTML = `<button id="playAgainFinalBtn">Wróć do lobby</button><button id="exitFinalBtn">Wyjdź do menu</button>`;
        document.getElementById('playAgainFinalBtn').addEventListener('click', () => socket.emit('requestReturnToLobby', currentRoomCode));
        document.getElementById('exitFinalBtn').addEventListener('click', () => window.location.reload());
    } else {
        roundInfo.innerText = `Koniec rundy ${currentRound} / ${totalRounds}`;
        endGameButtons.innerHTML = `<button id="playAgainBtn">Następna runda</button><div id="readyStatus"></div>`;
        const playAgainBtn = document.getElementById('playAgainBtn');
        playAgainBtn.addEventListener('click', () => { playAgainBtn.disabled = true; socket.emit('requestNewGame', currentRoomCode); });
        
        const impostorNames = impostors.join(', ');
        if (winner === 'crewmates') {
            endGameTitle.innerText = amIImpostor ? '☠️ RUNDĘ PRZEGRALIŚCIE! ☠️' : '🎉 RUNDĘ WYGRALIŚCIE! 🎉';
            endGameText.innerText = amIImpostor ? `Zostaliście zdemaskowani! Prawdziwe hasło to: "${password}".` : `Udało się! Impostorami byli: ${impostorNames}.`;
        } else { // Impostors won
            endGameTitle.innerText = amIImpostor ? '🏆 RUNDĘ WYGRALIŚCIE! 🏆' : '☠️ RUNDĘ PRZEGRALIŚCIE! ☠️';
            endGameText.innerText = `Impostorzy wygrali rundę! Prawdziwe hasło to było "${password}". Impostorami byli: ${impostorNames}.`;
        }
    }
    scoreboard.innerHTML = '';
    scores.sort((a, b) => b.score - a.score).forEach(player => { const li = document.createElement('li'); li.innerHTML = `<span>${player.name}</span> <span>${player.score} pkt</span>`; scoreboard.appendChild(li); });
});
socket.on('updateReadyCount', (readyCount, totalPlayers, waitingFor) => {
    let statusText = `Gotowi: ${readyCount} / ${totalPlayers}`;
    if (waitingFor.length > 0) { statusText += `<br><small>Oczekuję na: ${waitingFor.join(', ')}</small>` }
    const readyStatus = document.getElementById('readyStatus');
    if (readyStatus) readyStatus.innerHTML = statusText;
});
socket.on('newGameCountdown', (countdown) => {
    showModal('Nowa gra!', `Nowa runda rozpocznie się za: ${countdown}`, false);
    if (countdown <= 0) {
        setTimeout(() => { modal.style.display = 'none'; }, 500);
    }
});
socket.on('returnToLobby', () => {
    showScreen(gameLobby);
    cardRevealed = false; card.classList.remove('is-flipped'); card.style.display = 'block';
});
socket.on('playerDisconnected', (playerName) => {
    toast.innerText = `Gracz ${playerName} opuścił grę.`;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
});
socket.on('gameInterrupted', () => {
    showModal('Gra przerwana!', 'Jeden z graczy opuścił grę. Wracacie do lobby.');
    setTimeout(() => {
        modal.style.display = 'none';
        showScreen(gameLobby);
    }, 3000);
});