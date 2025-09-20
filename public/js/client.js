const socket = io();
let currentRoomCode = '';
let isHost = false;
let cardRevealed = false;
let playerCount = 0;
let isRandomMode = false;
let amI_Eliminated = false;

// Definicje elementów DOM
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
const gameActionContainer = document.getElementById('gameActionContainer');
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
const endGameInfo = document.getElementById('endGameInfo');
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

// --- GŁÓWNA LOGIKA APLIKACJI ---

window.addEventListener('load', () => {
    const sessionData = JSON.parse(sessionStorage.getItem('impostorSession'));
    if (sessionData && sessionData.roomCode && sessionData.oldSocketId) {
        socket.emit('attemptReconnect', {
            roomCode: sessionData.roomCode,
            oldSocketId: sessionData.oldSocketId
        });
    }
});

function handleLobbyUpdate({ players, settings, hostId }) {
    playerCount = players.length;
    isHost = (socket.id === hostId);
    
    playerList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        const playerNameSpan = document.createElement('span');
        playerNameSpan.innerText = player.name + (player.id === hostId ? ' 👑 (Host)' : '');
        li.appendChild(playerNameSpan);
        if (!player.connected) {
            li.style.opacity = '0.5';
            playerNameSpan.innerText += ' (rozłączony)';
        }
        if (isHost && player.id !== socket.id) {
            const kickBtn = document.createElement('button');
            kickBtn.innerText = 'Usuń';
            kickBtn.className = 'kick-btn';
            kickBtn.dataset.playerId = player.id;
            li.appendChild(kickBtn);
        }
        playerList.appendChild(li);
    });

    gameCodeDisplay.innerText = currentRoomCode;
    sessionStorage.setItem('impostorSession', JSON.stringify({ roomCode: currentRoomCode, oldSocketId: socket.id }));

    impostorsCount.innerText = settings.randomImpostors ? '?' : settings.impostors;
    roundsCount.innerText = settings.rounds;
    impostorHintCheckbox.checked = settings.impostorHint;
    randomImpostorsCheckbox.checked = settings.randomImpostors;
    impostorsMinusBtn.disabled = settings.randomImpostors;
    impostorsPlusBtn.disabled = settings.randomImpostors;
    categorySelect.value = settings.category;
    difficultySelect.value = settings.difficulty;
    currentCategoryName.innerText = settings.category;

    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
        if(btn.dataset.difficulty === settings.difficulty) {
            btn.classList.add('selected');
        }
    });

    const tile = Array.from(categoryTiles).find(t => t.dataset.category === settings.category);
    if (tile) { currentCategoryIcon.src = tile.querySelector('img').src; }
    
    hostSettings.style.display = isHost ? 'block' : 'none';
    if (isHost) {
        const connectedPlayers = players.filter(p => p.connected).length;
        if (connectedPlayers < 3) {
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
}

function updateSettings() {
    if (!isHost) return;
    const newSettings = {
        category: categorySelect.value,
        difficulty: difficultySelect.value,
        impostors: randomImpostorsCheckbox.checked ? '?' : (parseInt(impostorsCount.innerText) || 1),
        rounds: parseInt(roundsCount.innerText),
        impostorHint: impostorHintCheckbox.checked,
        randomImpostors: randomImpostorsCheckbox.checked
    };
    socket.emit('updateSettings', { roomCode: currentRoomCode, settings: newSettings });
}

function showModal(title, text, showButton = true) {
    modalTitle.innerText = title;
    modalText.innerText = text;
    modalCloseBtn.style.display = showButton ? 'inline-block' : 'none';
    modal.style.display = 'flex';
}

function showScreen(screenToShow) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screenToShow.classList.add('active');
}

function showTurnScreen(playerName) {
    votingScreen.classList.remove('active');
    showScreen(gameScreen);
    card.style.display = 'none';
    revealStatus.innerHTML = '';
    turnCountdown.innerHTML = '';

    let buttonsHTML = '<button id="goToVoteBtn">Przejdź do Głosowania</button>';
    gameActionContainer.innerHTML = `<h2>ZACZYNA GRACZ:</h2><p>${playerName}</p>${buttonsHTML}<button class="exit-button">Wyjdź z gry</button>`;
    
    gameActionContainer.querySelector('.exit-button').addEventListener('click', () => {
        confirmText.innerText = 'Czy na pewno chcesz opuścić grę i wrócić do menu głównego?';
        confirmModal.style.display = 'flex';
    });
    
    const goToVoteBtn = document.getElementById('goToVoteBtn');
    if (goToVoteBtn) {
        goToVoteBtn.disabled = amI_Eliminated;
        goToVoteBtn.addEventListener('click', () => { socket.emit('requestVoting', currentRoomCode); });
    }
}

// --- PODPIĘCIA EVENT LISTENERÓW ---

if (difficultySelector) {
    difficultySelector.addEventListener('click', (event) => {
        if (event.target.classList.contains('difficulty-btn')) {
            difficultySelector.querySelectorAll('.difficulty-btn').forEach(btn => btn.classList.remove('selected'));
            event.target.classList.add('selected');
            difficultySelect.value = event.target.dataset.difficulty;
            updateSettings();
        }
    });
}

modalCloseBtn.addEventListener('click', () => { modal.style.display = 'none'; });
createGameBtn.addEventListener('click', () => { socket.emit('createGame', { playerName: playerNameInput.value }); });
showJoinScreenBtn.addEventListener('click', () => showScreen(joinScreen));
backBtns.forEach(btn => btn.addEventListener('click', () => showScreen(startScreen)));
exitBtns.forEach(btn => btn.addEventListener('click', () => {
    confirmText.innerText = 'Czy na pewno chcesz opuścić grę i wrócić do menu głównego?';
    confirmModal.style.display = 'flex';
}));
confirmYesBtn.onclick = () => { sessionStorage.removeItem('impostorSession'); window.location.reload(); };
confirmNoBtn.onclick = () => confirmModal.style.display = 'none';
joinGameBtn.addEventListener('click', () => { socket.emit('joinGame', { code: gameCodeInput.value, playerName: playerNameInput.value }); });
startGameBtn.addEventListener('click', () => { socket.emit('startGame', currentRoomCode); });
card.addEventListener('click', () => { card.classList.toggle('is-flipped'); if (!cardRevealed) { socket.emit('playerRevealedCard', currentRoomCode); cardRevealed = true; } });
impostorsMinusBtn.addEventListener('click', () => { let count = parseInt(impostorsCount.innerText); if (count > 1) { impostorsCount.innerText = count - 1; updateSettings(); } });
impostorsPlusBtn.addEventListener('click', () => { let count = parseInt(impostorsCount.innerText); const max = getMaxImpostors(playerCount); if (count < max) { impostorsCount.innerText = count + 1; updateSettings(); } });
roundsMinusBtn.addEventListener('click', () => { let count = parseInt(roundsCount.innerText); if (count > 1) { roundsCount.innerText = count - 1; updateSettings(); } });
roundsPlusBtn.addEventListener('click', () => { roundsCount.innerText++; updateSettings(); });
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
        submitVoteBtn.disabled = true;
        voteStatus.innerHTML = 'Twój głos został oddany. Czekanie na innych...';
    } else { alert('Musisz kogoś wybrać!'); }
});
lobbyCategoryTile.addEventListener('click', () => { if (isHost) { showScreen(categoryScreen); } });
backToLobbyBtn.addEventListener('click', () => { showScreen(gameLobby); });
categoryTiles.forEach(tile => {
    tile.addEventListener('click', () => {
        currentCategoryName.innerText = tile.dataset.category;
        currentCategoryIcon.src = tile.querySelector('img').src;
        categorySelect.value = tile.dataset.category;
        updateSettings();
        showScreen(gameLobby);
    });
});
playerList.addEventListener('click', (event) => {
    if (event.target.classList.contains('kick-btn')) {
        const playerIdToKick = event.target.dataset.playerId;
        socket.emit('kickPlayer', { roomCode: currentRoomCode, playerIdToKick });
    }
});

// --- OBSŁUGA ZDARZEŃ Z SERWERA (SOCKET.ON) ---

socket.on('gameCreated', code => { currentRoomCode = code; showScreen(gameLobby); });
socket.on('joinError', message => { alert(message); });
socket.on('kicked', () => {
    showModal('Informacja', 'Zostałeś usunięty z lobby przez hosta.', false);
    sessionStorage.removeItem('impostorSession');
    setTimeout(() => { window.location.reload(); }, 3000);
});
socket.on('updateLobby', handleLobbyUpdate);
socket.on('gameStarted', (data) => {
    requestWakeLock();
    amI_Eliminated = false;
    modal.style.display = 'none';
    cardRevealed = false; card.classList.remove('is-flipped'); card.style.display = 'block';
    turnCountdown.innerHTML = '';
    revealStatus.innerHTML = '';
    gameActionContainer.innerHTML = '';
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
socket.on('updateRevealStatus', ({ revealedCount, totalPlayers }) => {
    revealStatus.innerHTML = `GOTOWI GRACZE: ${revealedCount} / ${totalPlayers}`;
});
socket.on('startTurnCountdown', (countdown) => {
    // ZMIANA: Karta pozostaje widoczna, a licznik pojawia się pod nią
    revealStatus.innerHTML = ''; // Ukryj status "GOTOWI GRACZE"
    turnCountdown.innerHTML = `<h2>Gra rozpocznie się za</h2><p>${countdown}</p>`;
});
socket.on('turnStarted', (playerName) => { showTurnScreen(playerName); });
socket.on('votingStarted', (players) => {
    showScreen(votingScreen);
    submitVoteBtn.disabled = false;
    voteStatus.innerHTML = '';
    votingOptions.innerHTML = '';
    players.forEach(player => {
        if (player.id !== socket.id) {
            const label = document.createElement('label');
            label.className = 'player-vote-label';
            const radio = document.createElement('input');
            radio.type = 'radio'; radio.name = 'vote'; radio.value = player.id;
            const span = document.createElement('span');
            span.innerText = player.name;
            label.appendChild(radio); label.appendChild(span);
            votingOptions.appendChild(label);
        }
    });
});
socket.on('updateVoteStatus', ({ votedCount, totalPlayers, unvotedNames }) => {
    let statusText = `Zagłosowało: ${votedCount} / ${totalPlayers}`;
    if (unvotedNames && unvotedNames.length > 0 && unvotedNames.length < 4) {
        statusText += `<br><small>Oczekuję na:</small><div>${unvotedNames.join(', ')}</div>`;
    }
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
socket.on('newRound', ({ startingPlayerName }) => {
    if (amI_Eliminated) return;
    amI_Eliminated = false;
    modal.style.display = 'none';
    showTurnScreen(startingPlayerName);
});
socket.on('gameOver', ({ winner, impostors, password, scores, currentRound, totalRounds, isFinal }) => {
    releaseWakeLock();
    modal.style.display = 'none';
    showScreen(endGameScreen);
    const myPlayerObject = scores.find(p => p.name === playerNameInput.value);
    const amIImpostor = myPlayerObject ? myPlayerObject.role === 'impostor' : false;
    if (winner === 'crewmates') {
        endGameTitle.innerText = amIImpostor ? '☠️ PRZEGRANA ☠️' : '🎉 WYGRANA! 🎉';
    } else {
        endGameTitle.innerText = amIImpostor ? '🏆 WYGRANA! 🏆' : '☠️ PRZEGRANA ☠️';
    }
    endGameInfo.innerHTML = `<p class="endgame-info-label">Hasłem było:</p><p class="endgame-password">${password}</p><p class="endgame-info-label">Impostorami byli:</p><p class="endgame-impostors">${impostors.join(', ')}</p>`;
    if (isFinal) {
        roundInfo.innerText = `Ostateczny wynik po ${totalRounds} rundach.`;
        endGameButtons.innerHTML = `<button id="playAgainFinalBtn">Wróć do lobby</button>`;
        document.getElementById('playAgainFinalBtn').addEventListener('click', () => socket.emit('requestReturnToLobby', currentRoomCode));
    } else {
        roundInfo.innerText = `Koniec rundy ${currentRound} / ${totalRounds}`;
        endGameButtons.innerHTML = `<button id="playAgainBtn">Następna runda</button><div id="readyStatus"></div>`;
        const playAgainBtn = document.getElementById('playAgainBtn');
        playAgainBtn.addEventListener('click', () => { playAgainBtn.disabled = true; socket.emit('requestNewGame', currentRoomCode); });
    }
    scoreboard.innerHTML = '';
    scores.sort((a, b) => b.score - a.score).forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${player.name}</span> <span>${player.score} pkt</span>`;
        scoreboard.appendChild(li);
    });
});
socket.on('updateReadyCount', (readyCount, totalPlayers, waitingFor) => {
    const readyStatus = document.getElementById('readyStatus');
    if (readyStatus) {
        let statusText = `Gotowi: ${readyCount} / ${totalPlayers}`;
        if (waitingFor.length > 0 && waitingFor.length < 4) { 
            statusText += `<br><small>Oczekuję na: ${waitingFor.join(', ')}</small>`;
        }
        readyStatus.innerHTML = statusText;
    }
});
socket.on('newGameCountdown', (countdown) => {
    showModal('Nowa gra!', `Nowa runda rozpocznie się za: ${countdown}`, false);
    if (countdown <= 0) { setTimeout(() => { modal.style.display = 'none'; }, 500); }
});
socket.on('returnToLobby', () => {
    releaseWakeLock();
    showScreen(gameLobby);
    cardRevealed = false; card.classList.remove('is-flipped'); card.style.display = 'block';
});
socket.on('playerDisconnected', (playerName) => {
    if (!gameLobby.classList.contains('active')) {
        toast.innerText = `Gracz ${playerName} opuścił grę.`;
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); }, 3000);
    }
});
socket.on('gameInterrupted', (message) => {
    releaseWakeLock();
    showModal('Gra przerwana!', message, true);
    setTimeout(() => {
        modal.style.display = 'none';
        showScreen(gameLobby);
    }, 4000);
});
socket.on('reconnectSuccess', (room) => {
    console.log('Udało się wrócić do gry!', room);
    const session = JSON.parse(sessionStorage.getItem('impostorSession'));
    if (session) { currentRoomCode = session.roomCode; }
    sessionStorage.setItem('impostorSession', JSON.stringify({ roomCode: currentRoomCode, oldSocketId: socket.id }));
    handleLobbyUpdate({ players: room.players, settings: room.settings, hostId: room.hostId });
    showScreen(gameLobby);
});
socket.on('reconnectFailed', () => {
    console.log('Nie udało się wrócić do gry. Sesja mogła wygasnąć.');
    sessionStorage.removeItem('impostorSession');
    showModal('Błąd', 'Nie udało się wrócić do gry. Dołącz ponownie.', false);
    setTimeout(() => { window.location.reload(); }, 3000);
});

let wakeLock = null;
const requestWakeLock = async () => {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      console.log('Blokada wygaszania ekranu aktywowana!');
    } catch (err) { console.error(`${err.name}, ${err.message}`); }
  }
};
const releaseWakeLock = async () => {
  if (wakeLock !== null) {
    await wakeLock.release();
    wakeLock = null;
    console.log('Blokada wygaszania ekranu zwolniona.');
  }
};