const path = require('path');
const crypto = require('crypto');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const PIXEL_POOL = require('./data/pixel-pool');
const contentPack = require('./data/content');
const extraContent = require('./extra-content');
const bonusContent = require('./bonus-content');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Düzeltilmiş regex kaçış yardımcısı (SyntaxError: Invalid regular expression giderildi)
const escRe = s => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

app.use(express.static(__dirname));

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

const ALL_FILM_ROUNDS = [
  ...PIXEL_POOL,
  ...(bonusContent.bonusScenes || [])
];

const rooms = new Map();

function normalizeText(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return rooms.has(code) ? createRoomCode() : code;
}

function pushFeed(room, text, type = 'info') {
  room.feed.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    text,
    type,
    ts: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  });
}

function serializeRoom(room) {
  const players = Array.from(room.players.values()).map(p => ({
    id: p.id,
    name: p.name,
    score: p.score,
    isHost: p.id === room.hostId,
    guessedCurrentFrame: Boolean(p.guessedCurrentFrame)
  }));

  const currentRound = ALL_FILM_ROUNDS[room.roundIndex % ALL_FILM_ROUNDS.length];
  const currentFrame = currentRound.frames[room.frameIndex % currentRound.frames.length];

  return {
    code: room.code,
    hostId: room.hostId,
    status: room.status,
    endReason: room.endReason || null,
    selectedMode: room.selectedMode,
    players,
    filmGame: {
      roundNumber: (room.roundIndex % ALL_FILM_ROUNDS.length) + 1,
      totalRounds: ALL_FILM_ROUNDS.length,
      roundTitle: currentRound.title,
      frameIndex: room.frameIndex,
      totalFrames: currentRound.frames.length,
      frame: currentFrame,
      lastWinner: room.lastWinner || null,
      revealedAnswer: room.status === 'ended' ? currentRound.answer : null
    },
    contentCounts: {
      films: (contentPack.films || []).length,
      extraPrompts: (extraContent.partyPrompts.wouldYouRather || []).length,
      bonusScenes: (bonusContent.bonusScenes || []).length
    },
    feed: room.feed.slice(-25)
  };
}

function emitRoomState(room) {
  io.to(room.code).emit('room:state', serializeRoom(room));
}

io.on('connection', socket => {
  socket.on('room:create', ({ name, modeId } = {}, cb) => {
    const cleanName = String(name || '').trim().slice(0, 20) || 'Yönetici';
    const code = createRoomCode();
    const validMode = GAME_MODES.some(m => m.id === modeId) ? modeId : 'filmden-kareyi-bil';

    const room = {
      code,
      hostId: socket.id,
      status: 'lobby',
      endReason: null,
      selectedMode: validMode,
      roundIndex: 0,
      frameIndex: 0,
      lastWinner: null,
      players: new Map(),
      feed: []
    };

    room.players.set(socket.id, {
      id: socket.id,
      name: cleanName,
      score: 0,
      guessedCurrentFrame: false
    });

    rooms.set(code, room);
    socket.join(code);
    pushFeed(room, `${cleanName} odayı oluşturdu (Kod: ${code}).`, 'system');
    emitRoomState(room);

    if (typeof cb === 'function') cb({ ok: true, code, playerId: socket.id });
  });

  socket.on('room:join', ({ code, name } = {}, cb) => {
    const cleanCode = String(code || '').trim().toUpperCase();
    const room = rooms.get(cleanCode);
    if (!room) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Oda bulunamadı. Oda kodunu kontrol et.' });
      return;
    }

    const cleanName = String(name || '').trim().slice(0, 20) || 'Oyuncu';
    room.players.set(socket.id, {
      id: socket.id,
      name: cleanName,
      score: 0,
      guessedCurrentFrame: false
    });

    socket.join(cleanCode);
    pushFeed(room, `${cleanName} odaya katıldı.`, 'system');
    emitRoomState(room);

    if (typeof cb === 'function') cb({ ok: true, code: cleanCode, playerId: socket.id });
  });

  socket.on('game:selectMode', ({ code, modeId } = {}) => {
    const room = rooms.get(String(code || '').toUpperCase());
    if (!room || room.hostId !== socket.id) return;
    if (!GAME_MODES.some(m => m.id === modeId)) return;

    room.selectedMode = modeId;
    const modeObj = GAME_MODES.find(m => m.id === modeId);
    pushFeed(room, `Yönetici oyun modunu "${modeObj.title}" olarak seçti.`, 'system');
    emitRoomState(room);
  });

  socket.on('game:start', ({ code, modeId } = {}) => {
    const room = rooms.get(String(code || '').toUpperCase());
    if (!room || room.hostId !== socket.id) return;

    if (modeId && GAME_MODES.some(m => m.id === modeId)) {
      room.selectedMode = modeId;
    }

    room.status = 'playing';
    room.endReason = null;
    room.roundIndex = 0;
    room.frameIndex = 0;
    room.lastWinner = null;

    for (const p of room.players.values()) {
      p.score = 0;
      p.guessedCurrentFrame = false;
    }

    const modeObj = GAME_MODES.find(m => m.id === room.selectedMode) || GAME_MODES[0];
    pushFeed(room, `Oyun başladı: ${modeObj.title}`, 'success');
    emitRoomState(room);
  });

  socket.on('game:endByHost', ({ code } = {}, cb) => {
    const room = rooms.get(String(code || '').toUpperCase());
    if (!room) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Oda bulunamadı.' });
      return;
    }
    if (room.hostId !== socket.id) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Sadece oda yöneticisi oyunu bitirebilir.' });
      return;
    }

    const host = room.players.get(socket.id);
    room.status = 'ended';
    room.endReason = `${host ? host.name : 'Yönetici'} oyunu sonlandırdı.`;
    pushFeed(room, 'Yönetici oyunu bitirdi! Final sıralaması yayınlandı.', 'warning');
    emitRoomState(room);

    if (typeof cb === 'function') cb({ ok: true });
  });

  socket.on('film:nextFrame', ({ code } = {}) => {
    const room = rooms.get(String(code || '').toUpperCase());
    if (!room || room.status !== 'playing') return;
    if (room.hostId !== socket.id) return;

    const round = ALL_FILM_ROUNDS[room.roundIndex % ALL_FILM_ROUNDS.length];
    for (const p of room.players.values()) {
      p.guessedCurrentFrame = false;
    }

    if (room.frameIndex + 1 < round.frames.length) {
      room.frameIndex += 1;
      pushFeed(room, `Yeni kare açıldı (${round.frames[room.frameIndex].label}).`, 'info');
    } else {
      room.roundIndex += 1;
      room.frameIndex = 0;
      const nextRound = ALL_FILM_ROUNDS[room.roundIndex % ALL_FILM_ROUNDS.length];
      pushFeed(room, `Yeni film turuna geçildi: ${nextRound.title}`, 'info');
    }

    emitRoomState(room);
  });

  socket.on('film:guess', ({ code, guess } = {}, cb) => {
    const room = rooms.get(String(code || '').toUpperCase());
    if (!room || room.status !== 'playing') {
      if (typeof cb === 'function') cb({ ok: false, correct: false });
      return;
    }

    const player = room.players.get(socket.id);
    if (!player) return;

    const rawGuess = String(guess || '').trim();
    if (!rawGuess) return;

    const round = ALL_FILM_ROUNDS[room.roundIndex % ALL_FILM_ROUNDS.length];
    const normGuess = normalizeText(rawGuess);
    const validTargets = [round.answer, ...(round.aliases || [])].map(normalizeText);
    const isCorrect = validTargets.includes(normGuess);

    if (isCorrect && !player.guessedCurrentFrame) {
      const points = Math.max(100, (round.frames.length - room.frameIndex) * 50);
      player.score += points;
      player.guessedCurrentFrame = true;
      room.lastWinner = {
        playerName: player.name,
        answer: round.answer,
        points
      };
      pushFeed(room, `🎬 ${player.name}, "${round.answer}" filmini bildi! (+${points} puan)`, 'success');

      room.roundIndex += 1;
      room.frameIndex = 0;
      for (const p of room.players.values()) {
        p.guessedCurrentFrame = false;
      }
      emitRoomState(room);
      if (typeof cb === 'function') cb({ ok: true, correct: true, clearInput: true });
      return;
    }

    pushFeed(room, `${player.name} tahmin etti: "${rawGuess}"`, 'guess');
    emitRoomState(room);
    if (typeof cb === 'function') cb({ ok: true, correct: false, clearInput: false });
  });

  socket.on('disconnect', () => {
    for (const [code, room] of rooms.entries()) {
      if (!room.players.has(socket.id)) continue;
      const leaving = room.players.get(socket.id);
      room.players.delete(socket.id);
      pushFeed(room, `${leaving ? leaving.name : 'Bir oyuncu'} odadan ayrıldı.`, 'system');

      if (room.players.size === 0) {
        rooms.delete(code);
        continue;
      }

      if (room.hostId === socket.id) {
        const nextHost = room.players.values().next().value;
        if (nextHost) {
          room.hostId = nextHost.id;
          pushFeed(room, `Yeni oda yöneticisi: ${nextHost.name}`, 'system');
        }
      }

      emitRoomState(room);
    }
  });
});

app.get('/api/modes', (req, res) => {
  res.json({ modes: GAME_MODES });
});

app.get('/api/content-summary', (req, res) => {
  res.json({
    dataPoolCount: PIXEL_POOL.length,
    content: contentPack,
    extraContent,
    bonusContent
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Partroomv3 sunucusu ${PORT} portunda çalışıyor.`);
});
