const socket = io();

const GAME_MODES = [
  {
    id: 'dogru-yanlis',
    title: 'Doğru mu Yanlış mı?',
    desc: 'Şaşırtıcı bilgiler, hızlı karar',
    players: '2–10 kişi',
    duration: '~5 dk',
    difficulty: 'Orta',
    icon: '✅',
    howToPlay: 'Ekrandaki iddianın Doğru mu yoksa Yanlış mı olduğunu en hızlı şekilde seç. Doğru cevaplar puan kazandırır.'
  },
  {
    id: 'en-yakin-cevap',
    title: 'En Yakın Cevabı Bul',
    desc: 'Sayıya en çok yaklaşan kazanır',
    players: '2–10 kişi',
    duration: '~5 dk',
    difficulty: 'Orta',
    icon: '🎯',
    howToPlay: 'Soru için sayısal tahminini gir. Gerçek sonuca en yakın tahmini yapan oyuncular puan alır.'
  },
  {
    id: 'hizli-quiz',
    title: 'Hızlı Quiz',
    desc: '4 şık, hız bonuslu yarış',
    players: '2–10 kişi',
    duration: '~5 dk',
    difficulty: 'Orta',
    icon: '🧠',
    howToPlay: '4 seçenek arasından doğru şıkkı işaretle. Hem doğruluk hem de yanıt hızı toplam puanını etkiler.'
  },
  {
    id: 'hangisi-yalan',
    title: 'Hangisi Yalan?',
    desc: 'Bilgilerden yalanı yakala',
    players: '2–10 kişi',
    duration: '~5 dk',
    difficulty: 'Orta',
    icon: '🕵️',
    howToPlay: 'Sunulan ifadeler arasındaki uydurma/yanlış bilgiyi tespit et ve o seçeneğe oy ver.'
  },
  {
    id: 'kimi-secerdin',
    title: 'Kimi Seçerdin?',
    desc: 'İki seçenek, çoğunluk puan alır',
    players: '2–10 kişi',
    duration: '~5 dk',
    difficulty: 'Orta',
    icon: '🤔',
    howToPlay: 'İki senaryo veya seçenekten sana uygun olanı seç. Odadaki çoğunlukla aynı kararı verirsen puan kazanırsın.'
  },
  {
    id: 'kim-daha-olasi',
    title: 'Kim Daha Olası?',
    desc: 'Arkadaşlarından birini seç',
    players: '2–10 kişi',
    duration: '~5 dk',
    difficulty: 'Orta',
    icon: '👀',
    howToPlay: 'Okunan duruma en uygun olduğunu düşündüğün oyuncuyu seç. En çok oy alan kişi veya doğru tahmin edenler öne geçer.'
  },
  {
    id: 'emojiden-tahmin',
    title: 'Emojiden Tahmin Et',
    desc: 'Emojiler hangi film, dizi veya oyun?',
    players: '2–10 kişi',
    duration: '~5 dk',
    difficulty: 'Orta',
    icon: '🎬',
    howToPlay: 'Verilen emoji dizisinin hangi film, dizi veya oyunu anlattığını yazarak tahmin et.'
  },
  {
    id: 'codenames',
    title: 'Codenames',
    desc: '5x5 gizli kelime tahtası (2 Takım)',
    players: '4–10 kişi',
    duration: '~8 dk',
    difficulty: 'Orta',
    icon: '🗂️',
    howToPlay: 'İki takım kendi kelimelerini ipuçları üzerinden bulmaya çalışır. Gizli kelimeleri hatasız açan takım kazanır.'
  },
  {
    id: 'vampir-koylu',
    title: 'Vampir Köylü',
    desc: 'Gece-gündüz gizli rol ve oylama',
    players: '5–10 kişi',
    duration: '~10 dk',
    difficulty: 'Orta',
    icon: '🐺',
    howToPlay: 'Gece rolleri harekete geçer, gündüz tartışma ve oylama ile şüpheli oyuncular elenir.'
  },
  {
    id: 'imposter',
    title: 'Imposter – Gizli Kelime',
    desc: 'Farklı kelimeyi alan kişiyi bul',
    players: '4–10 kişi',
    duration: '~7 dk',
    difficulty: 'Orta',
    icon: '🎭',
    howToPlay: 'Herkese gizli bir kelime verilir; imposter farklı veya eksik ipucuna sahiptir. İpuçlarından imposter’ı bul.'
  },
  {
    id: 'sarkiyi-ilk-sen-bil',
    title: 'Şarkıyı İlk Sen Bil!',
    desc: 'Kısa dinletiden şarkıyı hemen bil',
    players: '2–10 kişi',
    duration: '~6 dk',
    difficulty: 'Orta',
    icon: '🎵',
    howToPlay: 'Kısa parça veya ipucu açıldıkça şarkı adını ya da sanatçıyı ilk bilen puanı kapar.'
  },
  {
    id: 'filmden-kareyi-bil',
    title: 'Filmden Kareyi Bil!',
    desc: 'Sahneler açıldıkça filmi tahmin et',
    players: '2–10 kişi',
    duration: '~6 dk',
    difficulty: 'Orta',
    icon: '🎞️',
    howToPlay: 'Film karesi netleştikçe ve yeni sahneler açıldıkça film adını yaz. Yazdığın taslak yeni karede silinmez ve iPad klavye açık kalır!'
  },
  {
    id: 'pikseli-ac',
    title: 'Pikseli Aç',
    desc: 'Pikseller açıldıkça kim olduğunu bul',
    players: '2–10 kişi',
    duration: '~6 dk',
    difficulty: 'Orta',
    icon: '🧩',
    howToPlay: 'Piksel blokları açıldıkça gizlenen kişi, karakter veya nesneyi en erken tahmin etmeye çalış.'
  }
];

const lobbyView = document.getElementById('lobbyView');
const roomView = document.getElementById('roomView');
const modesGrid = document.getElementById('modesGrid');
const playerNameInput = document.getElementById('playerNameInput');
const roomCodeInput = document.getElementById('roomCodeInput');
const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');

const roomCodeBadge = document.getElementById('roomCodeBadge');
const roomStatusBadge = document.getElementById('roomStatusBadge');
const hostEndGameBtn = document.getElementById('hostEndGameBtn');
const leaveRoomBtn = document.getElementById('leaveRoomBtn');

const waitingPanel = document.getElementById('waitingPanel');
const selectedModeName = document.getElementById('selectedModeName');
const selectedModeDesc = document.getElementById('selectedModeDesc');
const hostStartWrap = document.getElementById('hostStartWrap');
const startGameBtn = document.getElementById('startGameBtn');

const filmGamePanel = document.getElementById('filmGamePanel');
const roundMeta = document.getElementById('roundMeta');
const roundTitle = document.getElementById('roundTitle');
const nextFrameBtn = document.getElementById('nextFrameBtn');
const frameLabel = document.getElementById('frameLabel');
const frameCaption = document.getElementById('frameCaption');
const frameHint = document.getElementById('frameHint');
const winnerBanner = document.getElementById('winnerBanner');
const filmGuessInput = document.getElementById('filmGuessInput');
const sendGuessBtn = document.getElementById('sendGuessBtn');

const genericGamePanel = document.getElementById('genericGamePanel');
const genericModeTitle = document.getElementById('genericModeTitle');
const genericModeDesc = document.getElementById('genericModeDesc');

const gameEndedPanel = document.getElementById('gameEndedPanel');
const endReasonText = document.getElementById('endReasonText');
const finalAnswerBox = document.getElementById('finalAnswerBox');
const scoreboardList = document.getElementById('scoreboardList');
const hostRestartWrap = document.getElementById('hostRestartWrap');
const restartGameBtn = document.getElementById('restartGameBtn');

const playerCount = document.getElementById('playerCount');
const playersList = document.getElementById('playersList');
const feedList = document.getElementById('feedList');

const howToModal = document.getElementById('howToModal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalSelectBtn = document.getElementById('modalSelectBtn');

let currentRoomCode = null;
let selectedModeId = 'filmden-kareyi-bil';
let modalModeId = null;
let draftFilmGuess = '';

filmGuessInput.addEventListener('input', () => {
  draftFilmGuess = filmGuessInput.value;
});

function renderModesGrid() {
  modesGrid.innerHTML = '';
  GAME_MODES.forEach(mode => {
    const card = document.createElement('div');
    card.className = `card mode-card ${mode.id === selectedModeId ? 'is-selected' : ''}`;
    card.innerHTML = `
      <div>
        <div class="mode-icon">${mode.icon}</div>
        <h3 class="mode-title">${mode.title}</h3>
        <p class="mode-desc">${mode.desc}</p>
        <div class="mode-meta">${mode.players} · ${mode.duration} · ${mode.difficulty}</div>
      </div>
      <button type="button" class="how-to-btn" data-mode-id="${mode.id}">Nasıl oynanır</button>
    `;

    card.addEventListener('click', e => {
      if (e.target.closest('.how-to-btn')) return;
      selectedModeId = mode.id;
      renderModesGrid();
      if (currentRoomCode) {
        socket.emit('game:selectMode', { code: currentRoomCode, modeId: mode.id });
      }
    });

    card.querySelector('.how-to-btn').addEventListener('click', e => {
      e.stopPropagation();
      modalModeId = mode.id;
      modalTitle.textContent = mode.title;
      modalBody.textContent = mode.howToPlay;
      howToModal.classList.remove('hidden');
    });

    modesGrid.appendChild(card);
  });
}

closeModalBtn.addEventListener('click', () => howToModal.classList.add('hidden'));
howToModal.addEventListener('click', e => {
  if (e.target === howToModal) howToModal.classList.add('hidden');
});
modalSelectBtn.addEventListener('click', () => {
  if (modalModeId) {
    selectedModeId = modalModeId;
    renderModesGrid();
    if (currentRoomCode) {
      socket.emit('game:selectMode', { code: currentRoomCode, modeId: selectedModeId });
    }
  }
  howToModal.classList.add('hidden');
});

createRoomBtn.addEventListener('click', () => {
  const name = playerNameInput.value.trim() || 'Onur';
  socket.emit('room:create', { name, modeId: selectedModeId }, res => {
    if (res && res.ok) {
      currentRoomCode = res.code;
      lobbyView.classList.add('hidden');
      roomView.classList.remove('hidden');
    }
  });
});

joinRoomBtn.addEventListener('click', () => {
  const code = roomCodeInput.value.trim().toUpperCase();
  const name = playerNameInput.value.trim() || 'Oyuncu';
  if (!code) {
    roomCodeInput.focus();
    return;
  }
  socket.emit('room:join', { code, name }, res => {
    if (!res || !res.ok) {
      alert((res && res.error) || 'Odaya katılınamadı.');
      return;
    }
    currentRoomCode = res.code;
    lobbyView.classList.add('hidden');
    roomView.classList.remove('hidden');
  });
});

startGameBtn.addEventListener('click', () => {
  if (!currentRoomCode) return;
  socket.emit('game:start', { code: currentRoomCode, modeId: selectedModeId });
});

restartGameBtn.addEventListener('click', () => {
  if (!currentRoomCode) return;
  socket.emit('game:start', { code: currentRoomCode, modeId: selectedModeId });
});

hostEndGameBtn.addEventListener('click', () => {
  if (!currentRoomCode) return;
  socket.emit('game:endByHost', { code: currentRoomCode });
});

leaveRoomBtn.addEventListener('click', () => {
  currentRoomCode = null;
  roomView.classList.add('hidden');
  lobbyView.classList.remove('hidden');
  renderModesGrid();
});

nextFrameBtn.addEventListener('click', () => {
  if (!currentRoomCode) return;
  const wasFocused = document.activeElement === filmGuessInput;
  socket.emit('film:nextFrame', { code: currentRoomCode });
  if (wasFocused) {
    requestAnimationFrame(() => {
      filmGuessInput.focus({ preventScroll: true });
    });
  }
});

function submitFilmGuess() {
  if (!currentRoomCode) return;
  const guessText = (filmGuessInput.value || draftFilmGuess).trim();
  if (!guessText) return;

  socket.emit('film:guess', { code: currentRoomCode, guess: guessText }, res => {
    if (res && res.clearInput) {
      draftFilmGuess = '';
      filmGuessInput.value = '';
    } else {
      draftFilmGuess = filmGuessInput.value;
    }
    requestAnimationFrame(() => {
      filmGuessInput.focus({ preventScroll: true });
    });
  });
}

sendGuessBtn.addEventListener('click', submitFilmGuess);
filmGuessInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    submitFilmGuess();
  }
});

socket.on('room:state', state => {
  if (!state) return;
  currentRoomCode = state.code;
  selectedModeId = state.selectedMode;

  const isHost = socket.id === state.hostId;
  roomCodeBadge.textContent = state.code;
  roomStatusBadge.textContent =
    state.status === 'playing' ? 'Oyun Devam Ediyor' :
    state.status === 'ended' ? 'Oyun Bitti' : 'Lobide';

  if (isHost && state.status === 'playing') {
    hostEndGameBtn.classList.remove('hidden');
  } else {
    hostEndGameBtn.classList.add('hidden');
  }

  const modeObj = GAME_MODES.find(m => m.id === state.selectedMode) || GAME_MODES[0];
  selectedModeName.textContent = modeObj.title;
  selectedModeDesc.textContent = modeObj.desc;

  waitingPanel.classList.add('hidden');
  filmGamePanel.classList.add('hidden');
  genericGamePanel.classList.add('hidden');
  gameEndedPanel.classList.add('hidden');

  if (state.status === 'lobby') {
    waitingPanel.classList.remove('hidden');
    hostStartWrap.classList.toggle('hidden', !isHost);
  } else if (state.status === 'playing') {
    if (state.selectedMode === 'filmden-kareyi-bil') {
      filmGamePanel.classList.remove('hidden');
      const fg = state.filmGame;
      roundMeta.textContent = `Tur ${fg.roundNumber} / ${fg.totalRounds} · Kare ${fg.frameIndex + 1} / ${fg.totalFrames}`;
      roundTitle.textContent = fg.roundTitle;
      nextFrameBtn.classList.toggle('hidden', !isHost);

      frameLabel.textContent = fg.frame.label;
      frameCaption.textContent = fg.frame.caption;
      frameHint.textContent = fg.frame.hint;
      frameCaption.style.filter = `blur(${fg.frame.blur}px)`;
      frameCaption.style.transform = `scale(${fg.frame.zoom})`;

      if (fg.lastWinner) {
        winnerBanner.classList.remove('hidden');
        winnerBanner.textContent = `Son bilen: ${fg.lastWinner.playerName} ("${fg.lastWinner.answer}" +${fg.lastWinner.points} puan)`;
      } else {
        winnerBanner.classList.add('hidden');
      }

      if (filmGuessInput.value !== draftFilmGuess && document.activeElement !== filmGuessInput) {
        filmGuessInput.value = draftFilmGuess;
      }
    } else {
      genericGamePanel.classList.remove('hidden');
      genericModeTitle.textContent = modeObj.title;
      genericModeDesc.textContent = modeObj.desc;
    }
  } else if (state.status === 'ended') {
    gameEndedPanel.classList.remove('hidden');
    endReasonText.textContent = state.endReason || 'Oyun tamamlandı.';
    if (state.filmGame && state.filmGame.revealedAnswer) {
      finalAnswerBox.classList.remove('hidden');
      finalAnswerBox.textContent = `Son Sahne Cevabı: ${state.filmGame.revealedAnswer}`;
    } else {
      finalAnswerBox.classList.add('hidden');
    }

    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    scoreboardList.innerHTML = '';
    sorted.forEach((p, idx) => {
      const li = document.createElement('li');
      li.className = 'score-row';
      li.innerHTML = `<span>#${idx + 1} ${p.name}</span><strong>${p.score} puan</strong>`;
      scoreboardList.appendChild(li);
    });
    hostRestartWrap.classList.toggle('hidden', !isHost);
  }

  playerCount.textContent = state.players.length;
  playersList.innerHTML = '';
  state.players.forEach(p => {
    const li = document.createElement('li');
    li.className = 'player-row';
    li.innerHTML = `
      <span>${p.name}${p.isHost ? '<span class="host-tag">Yönetici</span>' : ''}</span>
      <strong>${p.score} puan</strong>
    `;
    playersList.appendChild(li);
  });

  feedList.innerHTML = '';
  state.feed.slice().reverse().forEach(item => {
    const li = document.createElement('li');
    li.className = 'feed-row';
    li.innerHTML = `<span>${item.text}</span><span class="muted small-text">${item.ts}</span>`;
    feedList.appendChild(li);
  });
});

renderModesGrid();
