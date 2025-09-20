const wordDatabase = {
    'Klasyczne Słowa': {
        'easy': { 'Jabłko': 'Owoc', 'Krzesło': 'Mebel', 'Drzwi': 'Wejście', 'Chleb': 'Piekarnia', 'Klucz': 'Zamek' },
        'medium': { 'Komputer': 'Elektronika', 'Teleskop': 'Kosmos', 'Most': 'Rzeka', 'Pustynia': 'Piasek', 'Biblioteka': 'Książki' },
        'hard': { 'Grawitacja': 'Siła', 'Metafora': 'Literatura', 'Fotosynteza': 'Roślina', 'Demokracja': 'Polityka', 'Inflacja': 'Ekonomia' }
    },
    'League of Legends': {
        'easy': { 'Baron': 'Wzmocnienie', 'Wieża': 'Struktura', 'Minion': 'Farma', 'NEXUS': 'Baza', 'Gank': 'Dżungler' },
        'medium': { 'Inhibitor': 'Superminion', 'Smok': 'Dusza', 'Dżungla': 'Potwory', 'Ward': 'Wizja', 'Flash': 'Czar' },
        'hard': { 'Kiting': 'ADC', 'Split push': 'Presja', 'Roaming': 'Wsparcie', 'Peel': 'Obrońca', 'Wave management': 'Kontrola' }
    }
};

const gameRooms = {};

function getMaxImpostors(playerCount) {
    if (playerCount < 3) return 1;
    return Math.floor((playerCount - 1) / 2);
}

function getRevealStatus(room) {
    const revealedCount = room.revealedPlayers.size;
    const totalPlayers = room.players.length;
    // Usunięto listę graczy z odpowiedzi
    return { revealedCount, totalPlayers };
}

function initiateGame(roomCode, io) {
    const room = gameRooms[roomCode];
    if (!room) return;

    room.gameState = 'revealing';
    room.revealedPlayers = new Set();
    room.eliminatedPlayers = [];
    room.votesAvailable = room.settings.randomImpostors ? room.players.length + 1 : room.settings.impostors;
    room.currentRound = (room.currentRound || 0) + 1;
    room.roundActions = { votesToEndRound: new Set(), votesToEliminate: {} };
    room.playerOrder = room.players.map(p => p.id).sort(() => Math.random() - 0.5);
    room.currentPlayerIndex = 0;

    const players = room.players;
    const settings = room.settings;

    const wordSet = wordDatabase[settings.category]?.[settings.difficulty] || wordDatabase['Klasyczne Słowa']['easy'];
    const allWords = Object.keys(wordSet);
    let availableWords = allWords.filter(word => !room.usedWords.has(word));

    if (availableWords.length === 0) {
        room.usedWords.clear();
        availableWords = allWords;
    }

    room.chosenWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    room.usedWords.add(room.chosenWord);
    const hint = wordSet[room.chosenWord];

    let impostorIds = new Set();
    let playersCopy = [...players];
    let impostorsInThisRound = settings.impostors;

    if (settings.randomImpostors) {
        const maxImpostors = players.length;
        impostorsInThisRound = Math.floor(Math.random() * (maxImpostors + 1));
    }

    for (let i = 0; i < impostorsInThisRound; i++) {
        if (playersCopy.length === 0) break;
        const randomIndex = Math.floor(Math.random() * playersCopy.length);
        impostorIds.add(playersCopy[randomIndex].id);
        playersCopy.splice(randomIndex, 1);
    }
    room.impostorIds = impostorIds;

    players.forEach(player => {
        const isImpostor = impostorIds.has(player.id);
        player.role = isImpostor ? 'impostor' : 'crewmate';
        let dataToSend = {
            role: player.role,
            password: isImpostor ? null : room.chosenWord,
            hint: (isImpostor && settings.impostorHint) ? hint : null,
            isRandomMode: settings.randomImpostors
        };
        io.to(player.id).emit('gameStarted', dataToSend);
    });

    io.to(roomCode).emit('updateRevealStatus', getRevealStatus(room));
}

function getNextStartingPlayer(room) {
    if (!room.playerOrder || room.playerOrder.length === 0) {
        const activePlayers = room.players.filter(p => !room.eliminatedPlayers.includes(p.id));
        return activePlayers[Math.floor(Math.random() * activePlayers.length)];
    }

    // Znajdź następnego gracza, który nie jest wyeliminowany
    let nextIndex = room.currentPlayerIndex;
    let loops = 0;
    do {
        nextIndex = (nextIndex + 1) % room.playerOrder.length;
        loops++;
    } while (room.eliminatedPlayers.includes(room.playerOrder[nextIndex]) && loops < room.players.length * 2);
    
    room.currentPlayerIndex = nextIndex;
    const nextPlayerId = room.playerOrder[room.currentPlayerIndex];
    return room.players.find(p => p.id === nextPlayerId);
}

function checkWinConditions(room, roomCode, io) {
    const activePlayers = room.players.filter(p => !room.eliminatedPlayers.includes(p.id));
    const activeImpostors = activePlayers.filter(p => p.role === 'impostor' && !room.eliminatedPlayers.includes(p.id));
    let gameOverData = null;

    if (activeImpostors.length === 0) {
        // Detektywi wygrywają
        gameOverData = { winner: 'crewmates' };
    } else if (activeImpostors.length >= activePlayers.length / 2) {
        // Impostorzy wygrywają
        gameOverData = { winner: 'impostors' };
        // POPRAWKA: Przyznawanie punktów impostorom za wygraną
        room.players.forEach(p => {
            if (p.role === 'impostor') {
                p.score += 5; // Przykładowa liczba punktów
            }
        });
    } else if (room.votesAvailable <= 0 && !room.settings.randomImpostors) {
        // Impostorzy wygrywają przez brak głosów
        gameOverData = { winner: 'impostors' };
        room.players.forEach(p => {
            if (p.role === 'impostor') {
                p.score += 5;
            }
        });
    }

    if (gameOverData) {
        gameOverData.scores = room.players.map(p => ({ name: p.name, score: p.score, role: p.role }));
        gameOverData.currentRound = room.currentRound;
        gameOverData.totalRounds = room.settings.rounds;
        gameOverData.impostors = room.players.filter(p => room.impostorIds.has(p.id)).map(p => p.name);
        gameOverData.password = room.chosenWord;
        if (room.currentRound >= room.settings.rounds) gameOverData.isFinal = true;
        setTimeout(() => io.to(roomCode).emit('gameOver', gameOverData), 3000);
    } else {
        setTimeout(() => {
            const nextPlayer = getNextStartingPlayer(room);
            io.to(roomCode).emit('newRound', { startingPlayerName: nextPlayer.name, newPlayerCount: activePlayers.length });
        }, 3000);
    }
}

function checkActionsAndProceed(room, roomCode, io) {
    const activePlayers = room.players.filter(p => !room.eliminatedPlayers.includes(p.id));
    const totalPlayers = activePlayers.length;

    const votesToEliminateCount = Object.keys(room.roundActions.votesToEliminate).length;
    const votesToEndRoundCount = room.roundActions.votesToEndRound.size;
    const totalActionsTaken = votesToEliminateCount + votesToEndRoundCount;

    io.to(roomCode).emit('updateActionCounts', {
        toEliminate: votesToEliminateCount,
        toEndRound: votesToEndRoundCount,
        totalPlayers: totalPlayers
    });

    if (totalActionsTaken === totalPlayers && totalPlayers > 0) {
        if (votesToEliminateCount > votesToEndRoundCount) {
            // Logika eliminacji gracza
        } else if (votesToEndRoundCount > votesToEliminateCount) {
            checkWinConditions(room, roomCode, io);
        } else {
            // Remis
        }
    }
}

function removePlayer(io, roomCode, playerId) {
    const room = gameRooms[roomCode];
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;

    const disconnectedPlayerName = room.players[playerIndex].name;
    room.players.splice(playerIndex, 1);
    io.to(roomCode).emit('playerDisconnected', disconnectedPlayerName);

    if (room.players.length === 0) {
        delete gameRooms[roomCode];
        console.log(`[${roomCode}] Pokój jest pusty, usuwam.`);
        return;
    }

    if (room.hostId === playerId) {
        room.hostId = room.players[0].id;
        console.log(`[${roomCode}] Host się rozłączył. Nowym hostem jest ${room.players[0].name}`);
    }

    if (room.gameState !== 'lobby') {
        io.to(roomCode).emit('gameInterrupted', `Gracz ${disconnectedPlayerName} opuścił grę.`);
    }
    
    io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
}

function handlePlayerDisconnect(io, roomCode, playerId) {
    const room = gameRooms[roomCode];
    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.connected) return;

    player.connected = false;
    console.log(`Gracz ${player.name} rozłączony. Oczekiwanie 20 minut na powrót.`);
    
    io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
    
    player.reconnectTimer = setTimeout(() => {
        console.log(`Gracz ${player.name} nie wrócił na czas i został trwale usunięty.`);
        removePlayer(io, roomCode, playerId);
    }, 1200000); // 20 minut
}

function handlePlayerReconnect(roomCode, oldPlayerId, newSocketId) {
    const room = gameRooms[roomCode];
    if (!room) return null;

    const player = room.players.find(p => p.id === oldPlayerId);
    if (!player || player.connected) return null;

    clearTimeout(player.reconnectTimer);
    player.reconnectTimer = null;
    player.connected = true;
    player.id = newSocketId;

    console.log(`Gracz ${player.name} pomyślnie wrócił do gry!`);
    return room;
}

module.exports = {
    gameRooms,
    getMaxImpostors,
    getRevealStatus,
    initiateGame,
    getNextStartingPlayer,
    checkWinConditions,
    checkActionsAndProceed,
    handlePlayerDisconnect,
    handlePlayerReconnect
};