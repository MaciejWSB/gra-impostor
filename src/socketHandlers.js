const {
    gameRooms,
    getMaxImpostors,
    initiateGame,
    getNextStartingPlayer,
    checkWinConditions,
    handlePlayerDisconnect,
    handlePlayerReconnect,
    getRevealStatus
} = require('../src/gameLogic.js');

const socketToRoomMap = {};

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log(`✅ Gracz połączył się: ${socket.id}`);

        socket.on('attemptReconnect', ({ roomCode, oldSocketId }) => {
            const room = handlePlayerReconnect(roomCode, oldSocketId, socket.id);
            if (room) {
                socketToRoomMap[socket.id] = roomCode;
                socket.join(roomCode);
                socket.emit('reconnectSuccess', room);
                io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
            } else {
                socket.emit('reconnectFailed');
            }
        });

        socket.on('createGame', (data) => {
            let playerName = data.playerName || `Gracz_${socket.id.substring(0, 4)}`;
            if (playerName.length > 12) {
                playerName = playerName.substring(0, 12);
            }

            const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            gameRooms[roomCode] = {
                hostId: socket.id, players: [],
                settings: { category: 'Klasyczne Słowa', difficulty: 'easy', impostors: 1, rounds: 5, impostorHint: false, randomImpostors: false },
                gameState: 'lobby', usedWords: new Set()
            };
            const room = gameRooms[roomCode];
            socket.join(roomCode);
            socketToRoomMap[socket.id] = roomCode;
            const player = { id: socket.id, name: playerName, score: 0, connected: true, reconnectTimer: null };
            room.players.push(player);
            socket.emit('gameCreated', roomCode);
            io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
        });

        socket.on('joinGame', (data) => {
            const roomCode = data.code.toUpperCase();
            const room = gameRooms[roomCode];
            if (room) {
                if (room.players.length >= 15) {
                    socket.emit('joinError', 'Lobby jest pełne.');
                    return;
                }
                const nameExists = room.players.some(p => p.name.toLowerCase() === (data.playerName || '').toLowerCase());
                if (nameExists) {
                    socket.emit('joinError', 'Gracz o takiej nazwie jest już w lobby.');
                    return;
                }
                
                let playerName = data.playerName || `Gracz_${socket.id.substring(0, 4)}`;
                if (playerName.length > 12) {
                    playerName = playerName.substring(0, 12);
                }

                socket.join(roomCode);
                socketToRoomMap[socket.id] = roomCode;
                const player = { id: socket.id, name: playerName, score: 0, connected: true, reconnectTimer: null };
                room.players.push(player);
                socket.emit('gameCreated', roomCode);
                io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
            } else { socket.emit('joinError', 'Nie znaleziono gry o takim kodzie.'); }
        });

        socket.on('kickPlayer', ({ roomCode, playerIdToKick }) => {
            const room = gameRooms[roomCode];
            if (room && room.hostId === socket.id) {
                const playerIndex = room.players.findIndex(p => p.id === playerIdToKick);
                if (playerIndex > -1) {
                    const kickedSocketId = room.players[playerIndex].id;
                    room.players.splice(playerIndex, 1);
                    const kickedSocket = io.sockets.sockets.get(kickedSocketId);
                    if(kickedSocket) {
                       kickedSocket.emit('kicked');
                       kickedSocket.leave(roomCode);
                    }
                    io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
                }
            }
        });

        socket.on('updateSettings', ({ roomCode, settings }) => {
            const room = gameRooms[roomCode];
            if (room && room.hostId === socket.id) {
                if (!settings.randomImpostors) {
                    const maxImpostors = getMaxImpostors(room.players.length);
                    if (settings.impostors > maxImpostors) { settings.impostors = maxImpostors; }
                }
                room.settings = settings;
                io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
            }
        });

        socket.on('startGame', (roomCode) => {
            const room = gameRooms[roomCode];
            if (room && room.hostId === socket.id) {
                const connectedPlayers = room.players.filter(p => p.connected);
                if (connectedPlayers.length < 3) { return; }
                room.players.forEach(p => {
                    p.score = 0;
                    if(p.connected) {
                       clearTimeout(p.reconnectTimer);
                       p.reconnectTimer = null;
                    }
                });
                room.currentRound = 0;
                room.usedWords = new Set();
                initiateGame(roomCode, io);
            }
        });

        socket.on('playerRevealedCard', (roomCode) => {
            const room = gameRooms[roomCode];
            if (room && !room.revealedPlayers.has(socket.id)) {
                room.revealedPlayers.add(socket.id);
                io.to(roomCode).emit('updateRevealStatus', getRevealStatus(room));
                
                const connectedPlayersCount = room.players.filter(p => p.connected).length;
                if (room.revealedPlayers.size === connectedPlayersCount) {
                    let countdown = 5;
                    // ZMIANA: Wysyłamy odliczanie od razu, bez czekania
                    const interval = setInterval(() => {
                        io.to(roomCode).emit('startTurnCountdown', countdown);
                        countdown--;
                        if (countdown < 0) {
                            clearInterval(interval);
                            const startingPlayer = getNextStartingPlayer(room);
                            io.to(roomCode).emit('turnStarted', startingPlayer.name);
                        }
                    }, 1000);
                }
            }
        });

        socket.on('requestVoting', (roomCode) => {
            const room = gameRooms[roomCode];
            if (room) {
                const activePlayers = room.players.filter(p => p.connected && !room.eliminatedPlayers.includes(p.id));
                room.gameState = 'voting';
                room.votes = {};
                room.votedPlayers = new Set();
                io.to(roomCode).emit('votingStarted', activePlayers);
            }
        });

        socket.on('playerVoted', ({ roomCode, votedPlayerId }) => {
            const room = gameRooms[roomCode];
            if (!room) return;
    
            const activePlayers = room.players.filter(p => p.connected && !room.eliminatedPlayers.includes(p.id));
            if (room.gameState === 'voting' && !room.votedPlayers.has(socket.id)) {
                room.votedPlayers.add(socket.id);
                room.votes[socket.id] = votedPlayerId;
                
                const unvotedNames = activePlayers.filter(p => !room.votedPlayers.has(p.id)).map(p => p.name);
                io.to(roomCode).emit('updateVoteStatus', { votedCount: room.votedPlayers.size, totalPlayers: activePlayers.length, unvotedNames });

                if (room.votedPlayers.size === activePlayers.length) {
                    const voteCounts = {};
                    Object.values(room.votes).forEach(votedId => { voteCounts[votedId] = (voteCounts[votedId] || 0) + 1; });

                    let maxVotes = 0; let playerToEliminateId = null;
                    for (const playerId in voteCounts) { if (voteCounts[playerId] > maxVotes) { maxVotes = voteCounts[playerId]; playerToEliminateId = playerId; } }
                    
                    const multipleMax = Object.values(voteCounts).filter(v => v === maxVotes).length > 1;

                    if (playerToEliminateId && !multipleMax) {
                        room.votesAvailable--; 
                        const eliminatedPlayer = room.players.find(p => p.id === playerToEliminateId);
                        
                        if (eliminatedPlayer.role === 'impostor') {
                            room.players.forEach(voter => {
                                if(room.votes[voter.id] === playerToEliminateId) {
                                    voter.score += 2;
                                }
                            });
                        }
                        room.eliminatedPlayers.push(eliminatedPlayer.id);
                        io.to(roomCode).emit('voteResult', { outcome: 'eliminated', playerName: eliminatedPlayer.name, eliminatedPlayerId: eliminatedPlayer.id });

                        if (!checkWinConditions(room, roomCode, io)) {
                            setTimeout(() => {
                                const startingPlayer = getNextStartingPlayer(room);
                                io.to(roomCode).emit('newRound', { startingPlayerName: startingPlayer.name });
                            }, 3000);
                        }
                    } else {
                        io.to(roomCode).emit('voteResult', { outcome: 'tie' });
                        setTimeout(() => {
                            const startingPlayer = getNextStartingPlayer(room);
                            io.to(roomCode).emit('newRound', { startingPlayerName: startingPlayer.name });
                        }, 3000);
                    }
                }
            }
        });

        socket.on('requestNewGame', (roomCode) => {
            const room = gameRooms[roomCode];
            if (room) {
                room.readyForNewGame = room.readyForNewGame || new Set();
                room.readyForNewGame.add(socket.id);
                
                const connectedPlayers = room.players.filter(p => p.connected);
                const readyPlayersCount = room.readyForNewGame.size;
                const waitingFor = connectedPlayers.filter(p => !room.readyForNewGame.has(p.id)).map(p => p.name);
                io.to(roomCode).emit('updateReadyCount', readyPlayersCount, connectedPlayers.length, waitingFor);

                if (readyPlayersCount === connectedPlayers.length) {
                    room.readyForNewGame.clear();
                    let countdown = 3;
                    const interval = setInterval(() => {
                        io.to(roomCode).emit('newGameCountdown', countdown);
                        countdown--;
                        if (countdown < 0) {
                            clearInterval(interval);
                            initiateGame(roomCode, io);
                        }
                    }, 1000);
                }
            }
        });

        socket.on('requestReturnToLobby', (roomCode) => {
            const room = gameRooms[roomCode];
            if (room) {
                room.players.forEach(p => p.score = 0);
                room.currentRound = 0;
                room.gameState = 'lobby';
                io.to(roomCode).emit('returnToLobby');
                io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Gracz rozłączył się: ${socket.id}`);
            const roomCode = socketToRoomMap[socket.id];
            if (roomCode && gameRooms[roomCode]) {
                handlePlayerDisconnect(io, roomCode, socket.id);
            }
            delete socketToRoomMap[socket.id];
        });
    });
}

module.exports = initializeSocket;