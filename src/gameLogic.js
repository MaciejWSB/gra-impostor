const wordDatabase = {
    'Klasyczne Słowa': {
        'easy': {
            'Jabłko': 'Owoc', 'Krzesło': 'Mebel', 'Drzwi': 'Wejście', 'Chleb': 'Piekarnia', 'Klucz': 'Zamek',
            'Pies': 'Zwierzę', 'Kot': 'Zwierzę', 'Słońce': 'Gwiazda', 'Księżyc': 'Satelita', 'Woda': 'Napój',
            'Dom': 'Budynek', 'Stół': 'Mebel', 'Ręka': 'Ciało', 'Oko': 'Zmysł', 'Ucho': 'Zmysł',
            'Nos': 'Zmysł', 'Głowa': 'Ciało', 'Noga': 'Ciało', 'But': 'Ubranie', 'Spodnie': 'Ubranie',
            'Koszula': 'Ubranie', 'Zegar': 'Czas', 'Telefon': 'Urządzenie', 'Długopis': 'Pisanie', 'Książka': 'Czytanie',
            'Szkoła': 'Nauka', 'Nauczyciel': 'Zawód', 'Lekarz': 'Zawód', 'Policjant': 'Zawód', 'Samochód': 'Pojazd',
            'Rower': 'Pojazd', 'Pociąg': 'Pojazd', 'Samolot': 'Pojazd', 'Statek': 'Pojazd', 'Droga': 'Transport',
            'Most': 'Konstrukcja', 'Las': 'Drzewa', 'Rzeka': 'Woda', 'Jezioro': 'Woda', 'Morze': 'Woda',
            'Góra': 'Teren', 'Chmura': 'Niebo', 'Deszcz': 'Pogoda', 'Śnieg': 'Pogoda', 'Wiatr': 'Pogoda',
            'Ogień': 'Żywioł', 'Ziemia': 'Planeta', 'Trawa': 'Roślina', 'Kwiat': 'Roślina', 'Drzewo': 'Roślina',
            'Kamień': 'Minerał', 'Piasek': 'Ziemia', 'Chleb': 'Jedzenie', 'Masło': 'Jedzenie', 'Ser': 'Jedzenie',
            'Mleko': 'Napój', 'Jajko': 'Jedzenie', 'Mięso': 'Jedzenie', 'Ryba': 'Jedzenie', 'Zupa': 'Jedzenie',
            'Widelec': 'Sztućce', 'Nóż': 'Sztućce', 'Łyżka': 'Sztućce', 'Talerz': 'Naczynie', 'Kubek': 'Naczynie',
            'Garnek': 'Naczynie', 'Łóżko': 'Mebel', 'Szafa': 'Mebel', 'Lampa': 'Oświetlenie', 'Okno': 'Budynek',
            'Podłoga': 'Budynek', 'Sufit': 'Budynek', 'Ściana': 'Budynek', 'Dach': 'Budynek', 'Miasto': 'Osada',
            'Wieś': 'Osada', 'Ulica': 'Droga', 'Sklep': 'Handel', 'Pieniądze': 'Ekonomia', 'Praca': 'Aktywność',
            'Sen': 'Stan', 'Miłość': 'Uczucie', 'Smutek': 'Uczucie', 'Radość': 'Uczucie', 'Gniew': 'Uczucie',
            'Strach': 'Uczucie', 'Muzyka': 'Sztuka', 'Film': 'Sztuka', 'Obraz': 'Sztuka', 'Taniec': 'Sztuka'
        },
        'medium': {
            'Komputer': 'Elektronika', 'Teleskop': 'Kosmos', 'Pustynia': 'Krajobraz', 'Biblioteka': 'Książki', 'Mikroskop': 'Nauka',
            'Galaktyka': 'Kosmos', 'Wulkan': 'Geologia', 'Trzęsienie ziemi': 'Zjawisko', 'Tsunami': 'Zjawisko', 'Huragan': 'Pogoda',
            'Tornado': 'Pogoda', 'Ewolucja': 'Biologia', 'Grawitacja': 'Fizyka', 'Energia': 'Fizyka', 'Atom': 'Chemia',
            'Cząsteczka': 'Chemia', 'DNA': 'Genetyka', 'Komórka': 'Biologia', 'Mózg': 'Organ', 'Serce': 'Organ',
            'Płuca': 'Organ', 'Demokracja': 'Polityka', 'Monarchia': 'Polityka', 'Gospodarka': 'Ekonomia', 'Inflacja': 'Ekonomia',
            'Podatek': 'Finanse', 'Inwestycja': 'Finanse', 'Architektura': 'Sztuka', 'Rzeźba': 'Sztuka', 'Poezja': 'Literatura',
            'Powieść': 'Literatura', 'Filozofia': 'Nauka', 'Logika': 'Myślenie', 'Etyka': 'Wartości', 'Historia': 'Przeszłość',
            'Geografia': 'Ziemia', 'Matematyka': 'Nauka', 'Algebra': 'Dział', 'Geometria': 'Dział', 'Internet': 'Sieć',
            'Programowanie': 'Informatyka', 'Algorytm': 'Procedura', 'Baza danych': 'Zbiór', 'System operacyjny': 'Oprogramowanie', 'Satelita': 'Urządzenie',
            'GPS': 'Nawigacja', 'Antybiotyk': 'Lek', 'Szczepionka': 'Medycyna', 'Chirurgia': 'Zabieg', 'Psychologia': 'Umysł',
            'Socjologia': 'Społeczeństwo', 'Archeologia': 'Wykopaliska', 'Astronomia': 'Niebo', 'Ekologia': 'Środowisko', 'Recykling': 'Odpady',
            'Globalizacja': 'Proces', 'Migracja': 'Przemieszczenie', 'Kultura': 'Zwyczaje', 'Język': 'Komunikacja', 'Tradycja': 'Zwyczaj',
            'Rewolucja': 'Zmiana', 'Wojna': 'Konflikt', 'Pokój': 'Stan', 'Dyplomacja': 'Stosunki', 'Kontynent': 'Ląd',
            'Ocean': 'Woda', 'Klimat': 'Pogoda', 'Ekosystem': 'Biologia', 'Gatunek': 'Klasyfikacja', 'Królestwo': 'Klasyfikacja',
            'Symfonia': 'Muzyka', 'Opera': 'Teatr', 'Balet': 'Taniec', 'Festiwal': 'Wydarzenie', 'Wystawa': 'Sztuka',
            'Metafora': 'Język', 'Ironia': 'Język', 'Symbol': 'Znak', 'Mitologia': 'Wierzenia', 'Religia': 'Wierzenia',
            'Rytuał': 'Obrzęd', 'Cywilizacja': 'Rozwój', 'Imperium': 'Państwo', 'Republika': 'Państwo', 'Konstytucja': 'Prawo',
            'Parlament': 'Władza', 'Prezydent': 'Stanowisko', 'Premier': 'Stanowisko', 'Sąd': 'Sprawiedliwość', 'Proces': 'Postępowanie'
        },
        'hard': {
            'Grawitacja': 'Siła', 'Fotosynteza': 'Roślina', 'Demokracja': 'Polityka', 'Inflacja': 'Ekonomia', 'Entropia': 'Termodynamika',
            'Dualizm korpuskularno-falowy': 'Fizyka kwantowa', 'Osobliwość': 'Astrofizyka', 'Horyzont zdarzeń': 'Czarna dziura', 'Splątanie kwantowe': 'Zjawisko', 'Zasada nieoznaczoności': 'Heisenberg',
            'Równania Maxwella': 'Elektromagnetyzm', 'Teoria względności': 'Einstein', 'Bohemistyka': 'Filologia', 'Kognitywistyka': 'Umysł', 'Epistemologia': 'Filozofia',
            'Ontologia': 'Metafizyka', 'Aksjologia': 'Wartości', 'Deontologia': 'Etyka', 'Utylitaryzm': 'Konsekwencje', 'Egzystencjalizm': 'Byt',
            'Strukturalizm': 'Metoda', 'Postmodernizm': 'Nurt', 'Hegemonia': 'Dominacja', 'Prokrastynacja': 'Zachowanie', 'Synergia': 'Współdziałanie',
            'Homeostaza': 'Biologia', 'Apoptoza': 'Komórka', 'Mejoza': 'Podział', 'Mitoza': 'Podział', 'Transkrypcja': 'Genetyka',
            'Translacja': 'Białko', 'Paradygmat': 'Wzorzec', 'Dysonans poznawczy': 'Psychologia', 'Efekt placebo': 'Sugestia', 'Stochastyczny': 'Losowy',
            'Determinizm': 'Przyczynowość', 'Anarchizm': 'Ideologia', 'Kapitalizm': 'System', 'Socjalizm': 'System', 'Komunizm': 'System',
            'Globalne ocieplenie': 'Klimat', 'Dziura ozonowa': 'Atmosfera', 'Różnorodność biologiczna': 'Ekologia', 'Zrównoważony rozwój': 'Koncepcja', 'Arbitraż': 'Spór',
            'Oligopol': 'Rynek', 'Monopol': 'Rynek', 'Keynesizm': 'Ekonomia', 'Monetaryzm': 'Pieniądz', 'Laicyzacja': 'Proces',
            'Sekularyzacja': 'Proces', 'Nihilizm': 'Pogląd', 'Solipsyzm': 'Pogląd', 'Empiryzm': 'Doświadczenie', 'Racjonalizm': 'Rozum',
            'Fenomenologia': 'Metoda', 'Hermeneutyka': 'Interpretacja', 'Dialektyka': 'Rozmowa', 'Paradoks': 'Sprzeczność', 'Algorytm genetyczny': 'Informatyka',
            'Sieć neuronowa': 'AI', 'Uczenie maszynowe': 'AI', 'Wirtualna rzeczywistość': 'Technologia', 'Rozszerzona rzeczywistość': 'Technologia', 'Blockchain': 'Kryptografia',
            'Singularność technologiczna': 'Hipoteza', 'Transhumanizm': 'Ruch', 'Eugenika': 'Selekcja', 'Kreacjonizm': 'Pogląd', 'Teoria strun': 'Fizyka',
            'Ciemna materia': 'Kosmologia', 'Ciemna energia': 'Kosmologia', 'Wielki Wybuch': 'Teoria', 'Prawo Moore\'a': 'Obserwacja', 'Geopolityka': 'Stosunki',
            'Neokolonializm': 'Zależność', 'Populizm': 'Retoryka', 'Korporacjonizm': 'System', 'Gentrifikacja': 'Proces', 'Asymilacja': 'Proces',
            'Akulturacja': 'Wpływ', 'Kontrkultura': 'Sprzeciw', 'Awangarda': 'Sztuka', 'Happening': 'Sztuka', 'Performans': 'Sztuka',
            'Dekonstrukcja': 'Analiza', 'Intertekstualność': 'Literatura', 'Alegoria': 'Symbol', 'Oksymoron': 'Figura', 'Hiperbola': 'Figura'
        }
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
    const totalPlayers = room.players.filter(p => p.connected).length;
    return { revealedCount, totalPlayers };
}

function initiateGame(roomCode, io) {
    const room = gameRooms[roomCode];
    if (!room) return;

    room.gameState = 'revealing';
    room.revealedPlayers = new Set();
    room.eliminatedPlayers = [];
    room.votesAvailable = room.settings.impostors;
    room.currentRound = (room.currentRound || 0) + 1;
    
    const connectedPlayers = room.players.filter(p => p.connected);
    room.playerOrder = connectedPlayers.map(p => p.id).sort(() => Math.random() - 0.5);
    room.currentPlayerIndex = -1;

    const players = connectedPlayers;
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
    
    for (let i = playersCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [playersCopy[i], playersCopy[j]] = [playersCopy[j], playersCopy[i]];
    }

    let impostorsInThisRound = settings.impostors;
    for (let i = 0; i < impostorsInThisRound; i++) {
        if (playersCopy.length === 0) break;
        impostorIds.add(playersCopy.pop().id);
    }
    room.impostorIds = impostorIds;

    players.forEach(player => {
        const isImpostor = impostorIds.has(player.id);
        player.role = isImpostor ? 'impostor' : 'crewmate';
        let dataToSend = {
            role: player.role,
            password: isImpostor ? null : room.chosenWord,
            hint: (isImpostor && settings.impostorHint) ? hint : null
        };
        io.to(player.id).emit('gameStarted', dataToSend);
    });

    io.to(roomCode).emit('updateRevealStatus', getRevealStatus(room));
}

function getNextStartingPlayer(room) {
    if (!room.playerOrder || room.playerOrder.length === 0) {
        const activePlayers = room.players.filter(p => p.connected && !room.eliminatedPlayers.includes(p.id));
        return activePlayers[Math.floor(Math.random() * activePlayers.length)];
    }

    let nextIndex = room.currentPlayerIndex;
    let loops = 0;
    do {
        nextIndex = (nextIndex + 1) % room.playerOrder.length;
        loops++;
    } while (room.eliminatedPlayers.includes(room.playerOrder[nextIndex]) && loops < room.playerOrder.length * 2);
    
    room.currentPlayerIndex = nextIndex;
    const nextPlayerId = room.playerOrder[room.currentPlayerIndex];
    return room.players.find(p => p.id === nextPlayerId);
}

function checkWinConditions(room, roomCode, io, forcedWinner = null) {
    let winner = forcedWinner;
    const activePlayers = room.players.filter(p => p.connected && !room.eliminatedPlayers.includes(p.id));
    const activeImpostors = activePlayers.filter(p => p.role === 'impostor');

    if (!winner) {
        if (activeImpostors.length === 0) {
            winner = 'crewmates';
        } else if (activeImpostors.length >= activePlayers.length / 2) {
            winner = 'impostors';
        } else if (room.votesAvailable <= 0) {
            winner = 'impostors';
        }
    }

    if (winner) {
        if (winner === 'crewmates') {
            const initialImpostorCount = room.impostorIds.size;
            activePlayers.forEach(player => {
                if (player.role === 'crewmate') {
                    player.score += initialImpostorCount;
                }
            });
        } else if (winner === 'impostors') {
            const survivingImpostors = activeImpostors;
            const survivingImpostorCount = survivingImpostors.length;
            survivingImpostors.forEach(impostor => {
                impostor.score += 2;
                if (survivingImpostorCount > 1) {
                    impostor.score += (survivingImpostorCount - 1);
                }
            });
        }

        room.gameState = 'ended';
        const gameOverData = {
            winner: winner,
            scores: room.players.map(p => ({ name: p.name, score: p.score, role: p.role })),
            currentRound: room.currentRound,
            totalRounds: room.settings.rounds,
            impostors: room.players.filter(p => room.impostorIds.has(p.id)).map(p => p.name),
            password: room.chosenWord,
            isFinal: room.currentRound >= room.settings.rounds
        };
        
        setTimeout(() => io.to(roomCode).emit('gameOver', gameOverData), 1000);
        return true;
    }
    return false;
}

function removePlayer(io, roomCode, playerId) {
    const room = gameRooms[roomCode];
    if (!room) return;
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return;
    const disconnectedPlayer = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
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
        io.to(roomCode).emit('gameInterrupted', `Gracz ${disconnectedPlayer.name} opuścił grę.`);
        room.gameState = 'lobby';
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
    }, 1200000);
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
    handlePlayerDisconnect,
    handlePlayerReconnect
};