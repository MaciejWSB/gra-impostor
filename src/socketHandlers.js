const {
    gameRooms,
    getMaxImpostors,
    initiateGame,
    getNextStartingPlayer,
    checkWinConditions,
    checkActionsAndProceed,
    getRevealStatus
} = require('./gameLogic.js');

function initializeSocket(io) {
    io.on('connection', (socket) => {
        console.log(`✅ Gracz połączył się: ${socket.id}`);

        socket.on('createGame', ({ playerName }) => {
            const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
            gameRooms[roomCode] = {
                hostId: socket.id,
                players: [],
                settings: { category: 'Klasyczne Słowa', difficulty: 'easy', impostors: 1, rounds: 5, impostorHint: false, randomImpostors: false },
                gameState: 'lobby',
                usedWords: new Set()
            };
            const room = gameRooms[roomCode];
            socket.join(roomCode);
            const player = { id: socket.id, name: playerName || `Gracz_${socket.id.substring(0, 4)}`, score: 0 };
            room.players.push(player);
            socket.emit('gameCreated', roomCode);
            io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
        });

        socket.on('joinGame', ({ code, playerName }) => {
            const roomCode = code.toUpperCase();
            const room = gameRooms[roomCode];
            if (room) {
                if (room.players.length >= 15) {
                    socket.emit('joinError', 'Lobby jest pełne.');
                    return;
                }
                const nameExists = room.players.some(p => p.name.toLowerCase() === (playerName || '').toLowerCase());
                if (nameExists) {
                    socket.emit('joinError', 'Gracz o takiej nazwie jest już w lobby.');
                    return;
                }
                socket.join(roomCode);
                const player = { id: socket.id, name: playerName || `Gracz_${socket.id.substring(0, 4)}`, score: 0 };
                room.players.push(player);
                socket.emit('gameCreated', roomCode);
                io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
            } else { socket.emit('joinError', 'Nie znaleziono gry o takim kodzie.'); }
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
                if (room.players.length < 3) {
                    return;
                }
                room.players.forEach(p => p.score = 0);
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
                if (room.revealedPlayers.size === room.players.length) {
                    let countdown = 5;
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
                if (room.settings.randomImpostors) {
                    socket.emit('votingStarted', room.players.filter(p => !room.eliminatedPlayers.includes(p.id)));
                } else {
                    room.gameState = 'voting';
                    room.votes = {};
                    room.votedPlayers = new Set();
                    io.to(roomCode).emit('votingStarted', room.players.filter(p => !room.eliminatedPlayers.includes(p.id)));
                }
            }
        });

        socket.on('playerVoted', ({ roomCode, votedPlayerId }) => {
            const room = gameRooms[roomCode];
            if (!room) return;
    
            if (room.settings.randomImpostors) {
                if (room.roundActions) {
                    room.roundActions.votesToEliminate[socket.id] = votedPlayerId;
                    room.roundActions.votesToEndRound.delete(socket.id);
                    checkActionsAndProceed(room, roomCode, io);
                }
            } else {
                const activePlayers = room.players.filter(p => !room.eliminatedPlayers.includes(p.id));
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
    
                        if (maxVotes > activePlayers.length / 2 && !multipleMax) {
                            room.votesAvailable--; 
                            const eliminatedPlayer = room.players.find(p => p.id === playerToEliminateId);
                            
                            if (eliminatedPlayer.role === 'impostor') {
                                Object.keys(room.votes).forEach(voterId => {
                                    if(room.votes[voterId] === playerToEliminateId) {
                                        const voter = room.players.find(p => p.id === voterId);
                                        if(voter) voter.score += 2;
                                    }
                                });
                            }
                            room.eliminatedPlayers.push(eliminatedPlayer.id);
                            io.to(roomCode).emit('voteResult', { outcome: 'eliminated', playerName: eliminatedPlayer.name, eliminatedPlayerId: eliminatedPlayer.id });
    
                            const remainingImpostors = room.players.filter(p => p.role === 'impostor' && !room.eliminatedPlayers.includes(p.id));
    
                            if (room.votesAvailable > 0 && remainingImpostors.length > 0) {
                                setTimeout(() => {
                                    const remainingPlayers = activePlayers.filter(p => !room.eliminatedPlayers.includes(p.id));
                                    const startingPlayer = getNextStartingPlayer(room);
                                    io.to(roomCode).emit('newRound', { startingPlayerName: startingPlayer.name, newPlayerCount: remainingPlayers.length });
                                }, 3000);
                            } else {
                                checkWinConditions(room, roomCode, io);
                            }
                        } else {
                            io.to(roomCode).emit('voteResult', { outcome: 'tie' });
                            setTimeout(() => {
                                const startingPlayer = getNextStartingPlayer(room);
                                io.to(roomCode).emit('newRound', { startingPlayerName: startingPlayer.name, newPlayerCount: activePlayers.length });
                            }, 3000);
                        }
                    }
                }
            }
        });

        socket.on('playerVotedToEndRound', (roomCode) => {
            const room = gameRooms[roomCode];
            if (room && room.roundActions) {
                room.roundActions.votesToEndRound.add(socket.id);
                delete room.roundActions.votesToEliminate[socket.id];
                checkActionsAndProceed(room, roomCode, io);
            }
        });

        socket.on('requestNewGame', (roomCode) => {
            const room = gameRooms[roomCode];
            if (room) {
                room.readyForNewGame = room.readyForNewGame || new Set();
                room.readyForNewGame.add(socket.id);
                const readyPlayersCount = room.readyForNewGame.size;
                const waitingFor = room.players.filter(p => !room.readyForNewGame.has(p.id)).map(p => p.name);
                io.to(roomCode).emit('updateReadyCount', readyPlayersCount, room.players.length, waitingFor);

                if (readyPlayersCount === room.players.length) {
                    room.readyForNewGame.clear();
                    let countdown = 3;
                    io.to(roomCode).emit('newGameCountdown', countdown);
                    const interval = setInterval(() => {
                        countdown--;
                        io.to(roomCode).emit('newGameCountdown', countdown);
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
            }
        });

        socket.on('disconnect', () => {
            console.log(`❌ Gracz rozłączył się: ${socket.id}`);
            for (const roomCode in gameRooms) {
                const room = gameRooms[roomCode];
                const playerIndex = room.players.findIndex(p => p.id === socket.id);
                if (playerIndex > -1) {
                    const disconnectedPlayer = room.players[playerIndex];
                    room.players.splice(playerIndex, 1);
                    io.to(roomCode).emit('playerDisconnected', disconnectedPlayer.name);

                    if (room.players.length === 0) {
                        delete gameRooms[roomCode];
                        console.log(`[${roomCode}] Pokój jest pusty, usuwam.`);
                        return;
                    }

                    if (room.hostId === socket.id && room.players.length > 0) {
                        room.hostId = room.players[0].id;
                        console.log(`[${roomCode}] Host się rozłączył. Nowym hostem jest ${room.hostId}`);
                    }

                    if (room.gameState !== 'lobby') {
                        io.to(roomCode).emit('gameInterrupted');
                        io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
                    } else {
                        io.to(roomCode).emit('updateLobby', { players: room.players, settings: room.settings, hostId: room.hostId });
                    }
                    break;
                }
            }
        });
    });
}

module.exports = initializeSocket;