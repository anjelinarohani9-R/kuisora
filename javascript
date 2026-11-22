// =========================================================================
// 1. PWA, EFEK SUARA (TONE.JS) & NOTIFIKASI
// =========================================================================
const manifestData = {
  name: "ACHIEVQUIZ - Quiz SMA Pink Pastel",
  short_name: "ACHIEVQUIZ",
  start_url: ".",
  display: "standalone",
  background_color: "#FFF0F5",
  theme_color: "#FFB6C1",
  icons: [{
    src: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
      '<rect width="512" height="512" rx="120" fill="#FF69B4"/>' +
      '<text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="200" fill="#FFFFFF">AQ</text>' +
      '</svg>'
    ),
    sizes: "512x512",
    type: "image/svg+xml"
  }]
};

const linkManifest = document.createElement('link');
linkManifest.rel = 'manifest';
linkManifest.href = URL.createObjectURL(new Blob([JSON.stringify(manifestData)], { type: 'application/json' }));
document.head.appendChild(linkManifest);

if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
  const swCode = `
    const CACHE_NAME = 'achievquiz-v2';
    self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(['./']))));
    self.addEventListener('fetch', (e) => e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request))));
  `;
  navigator.serviceWorker.register(URL.createObjectURL(new Blob([swCode], { type: 'application/javascript' }))).catch(() => {});
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installBtn = document.getElementById('install-pwa-btn');
  installBtn.classList.remove('hidden');
  installBtn.classList.add('flex');
});

async function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') document.getElementById('install-pwa-btn').classList.add('hidden');
  deferredPrompt = null;
}

let soundEnabled = true;
let synth = null;

function initAudio() {
  if (!synth && typeof Tone !== 'undefined') {
    synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -8;
  }
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    initAudio();
    if (Tone.context.state !== 'running') Tone.start();
    if (type === 'click') synth.triggerAttackRelease("C5", "32n");
    else if (type === 'correct') synth.triggerAttackRelease(["E5", "G5", "C6"], "16n");
    else if (type === 'wrong') synth.triggerAttackRelease(["A3", "Eb3"], "8n");
    else if (type === 'win') synth.triggerAttackRelease(["C5", "E5", "G5", "C6"], "8n");
  } catch (e) {}
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById('sound-icon').className = soundEnabled
    ? 'fas fa-volume-up text-sm'
    : 'fas fa-volume-mute text-sm text-gray-400';
  showToast(soundEnabled ? "Efek suara aktif 🔊" : "Efek suara dimatikan 🔇");
}

// =========================================================================
// 2. DATA BANK SOAL BAWAAN, AKUN & PENYIMPANAN LOKAL
// =========================================================================
const DEFAULT_DECKS = [
  {
    id: "deck-inf-11",
    title: "UH Informatika: Algoritma & Berpikir Komputasional",
    subject: "Informatika - SMA Kelas 11",
    author: "Pak Dimas (Guru Informatika)",
    duration: 10,
    questions: [
      {
        q: "Langkah-langkah sistematis dan logis untuk menyelesaikan suatu masalah pemrograman disebut...",
        options: ["Algoritma", "Kompilasi", "Debugging", "Enkripsi"],
        correct: 0,
        explanation: "Algoritma adalah urutan langkah logis dan terstruktur untuk menyelesaikan masalah."
      },
      {
        q: "Struktur data yang bekerja menggunakan prinsip LIFO (Last In, First Out) adalah...",
        options: ["Queue", "Stack", "Array", "Graph"],
        correct: 1,
        explanation: "Stack (tumpukan) mengeluarkan elemen yang paling terakhir dimasukkan terlebih dahulu (LIFO)."
      },
      {
        q: "Pilar berpikir komputasional yang memecah masalah besar menjadi bagian-bagian kecil disebut...",
        options: ["Abstraksi", "Pengenalan Pola", "Dekomposisi", "Evaluasi"],
        correct: 2,
        explanation: "Dekomposisi adalah teknik memecah masalah kompleks menjadi sub-masalah yang lebih mudah dikelola."
      },
      {
        q: "Perangkat jaringan yang bertugas menghubungkan dua atau lebih jaringan berbeda dan menentukan rute paket data adalah...",
        options: ["Switch", "Hub", "Router", "Repeater"],
        correct: 2,
        explanation: "Router berfungsi merutekan paket data antar jaringan yang berbeda."
      },
      {
        q: "Bilangan biner 1010 jika dikonversi ke dalam sistem bilangan desimal bernilai...",
        options: ["8", "10", "12", "14"],
        correct: 1,
        explanation: "1×2³ + 0×2² + 1×2¹ + 0×2⁰ = 8 + 0 + 2 + 0 = 10."
      }
    ]
  },
  {
    id: "deck-bio-11",
    title: "UH Biologi: Struktur & Fungsi Sel",
    subject: "Biologi - SMA Kelas 11",
    author: "Tim ACHIEVQUIZ",
    duration: 10,
    questions: [
      {
        q: "Organel sel yang berfungsi sebagai tempat respirasi seluler dan penghasil energi (ATP) adalah...",
        options: ["Ribosom", "Mitokondria", "Lisosom", "Badan Golgi"],
        correct: 1,
        explanation: "Mitokondria dijuluki 'The Powerhouse of Cell' karena menghasilkan energi ATP melalui respirasi sel."
      },
      {
        q: "Perbedaan utama antara sel tumbuhan dan sel hewan adalah keberadaan...",
        options: ["Membran plasma", "Kloroplas", "Mitokondria", "Ribosom"],
        correct: 1,
        explanation: "Sel tumbuhan memiliki kloroplas untuk fotosintesis dan dinding sel selulosa."
      },
      {
        q: "Organel yang berperan aktif dalam proses sintesis protein adalah...",
        options: ["Ribosom", "Vakuola", "Sentrosom", "Peroksisom"],
        correct: 0,
        explanation: "Ribosom menerjemahkan kode genetik mRNA menjadi rantai asam amino (protein)."
      },
      {
        q: "Perpindahan molekul air melewati membran semipermeabel disebut...",
        options: ["Difusi", "Osmosis", "Endositosis", "Fagositosis"],
        correct: 1,
        explanation: "Osmosis adalah perpindahan pelarut (air) dari konsentrasi rendah ke tinggi."
      },
      {
        q: "Organel sel yang berisi enzim hidrolitik untuk pencernaan intraseluler adalah...",
        options: ["Lisosom", "Peroksisom", "Sentriol", "Nukleolus"],
        correct: 0,
        explanation: "Lisosom mengandung enzim pencerna makromolekul dan organel yang rusak."
      }
    ]
  },
  {
    id: "deck-fisika-10",
    title: "Fisika: Hukum Newton & Gerak",
    subject: "Fisika - SMA Kelas 10",
    author: "Bu Sinta (Guru Fisika)",
    duration: 10,
    questions: [
      {
        q: "Benda yang diam akan tetap diam jika resultan gaya sama dengan nol adalah bunyi...",
        options: ["Inersia", "Percepatan", "Aksi Reaksi", "Gravitasi"],
        correct: 0,
        explanation: "Hukum I Newton disebut juga Hukum Inersia (Kelembaman)."
      },
      {
        q: "Satuan Sistem Internasional (SI) untuk gaya adalah...",
        options: ["Joule", "Watt", "Newton", "Pascal"],
        correct: 2,
        explanation: "Newton (N) adalah satuan SI untuk besaran gaya."
      },
      {
        q: "Besaran yang memiliki nilai dan arah disebut besaran...",
        options: ["Skalar", "Vektor", "Pokok", "Turunan"],
        correct: 1,
        explanation: "Gaya, kecepatan, dan percepatan merupakan besaran vektor."
      },
      {
        q: "Gaya gesek yang bekerja pada benda saat benda mulai bergerak disebut gaya gesek...",
        options: ["Statis", "Kinetis", "Normal", "Sentripetal"],
        correct: 1,
        explanation: "Gaya gesek kinetis bekerja ketika benda sudah dalam keadaan bergerak."
      }
    ]
  }
];

let decks = [];
let historyLogs = [];
let draftQuestions = [];
let currentUser = null;
let authMode = 'login';
let authRole = 'siswa';

function switchAuthTab(mode) {
  authMode = mode;
  const loginTab = document.getElementById('auth-tab-login');
  const regTab = document.getElementById('auth-tab-register');
  const fullnameGroup = document.getElementById('auth-fullname-group');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (mode === 'login') {
    loginTab.className = "py-2 rounded-xl bg-white text-pink-600 font-bold text-xs shadow-sm transition";
    regTab.className = "py-2 rounded-xl text-gray-500 font-bold text-xs transition";
    fullnameGroup.classList.add('hidden');
    submitBtn.innerText = "Masuk Sekarang";
  } else {
    regTab.className = "py-2 rounded-xl bg-white text-pink-600 font-bold text-xs shadow-sm transition";
    loginTab.className = "py-2 rounded-xl text-gray-500 font-bold text-xs transition";
    fullnameGroup.classList.remove('hidden');
    submitBtn.innerText = "Daftar & Masuk";
  }
}

function selectAuthRole(role) {
  authRole = role;
  const btnSiswa = document.getElementById('role-btn-siswa');
  const btnGuru = document.getElementById('role-btn-guru');
  if (role === 'siswa') {
    btnSiswa.className = "p-3 rounded-2xl border-2 border-pink-500 bg-pink-50 text-pink-700 font-bold text-xs flex flex-col items-center gap-1.5 transition";
    btnGuru.className = "p-3 rounded-2xl border-2 border-pink-100 bg-white text-gray-500 font-bold text-xs flex flex-col items-center gap-1.5 transition";
  } else {
    btnGuru.className = "p-3 rounded-2xl border-2 border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700 font-bold text-xs flex flex-col items-center gap-1.5 transition";
    btnSiswa.className = "p-3 rounded-2xl border-2 border-pink-100 bg-white text-gray-500 font-bold text-xs flex flex-col items-center gap-1.5 transition";
  }
}

function getSavedUsers() {
  return JSON.parse(localStorage.getItem('achievquiz_users') || '[]');
}

function renderSavedAccounts() {
  const users = getSavedUsers();
  const box = document.getElementById('saved-accounts-box');
  const list = document.getElementById('saved-accounts-list');
  if (users.length === 0) {
    box.classList.add('hidden');
    return;
  }
  box.classList.remove('hidden');
  list.innerHTML = users.map(u => `
    <button onclick="quickLoginUser('${u.username}', '${u.role}')" class="px-3 py-1.5 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200 text-xs font-bold text-pink-700 flex items-center gap-1.5">
      <i class="fas ${u.role === 'guru' ? 'fa-chalkboard-teacher text-fuchsia-600' : 'fa-user-graduate text-pink-500'}"></i>
      <span>${u.fullName} (${u.role === 'guru' ? 'Guru' : 'Siswa'})</span>
    </button>
  `).join('');
}

function quickLoginUser(username, role) {
  const users = getSavedUsers();
  const found = users.find(u => u.username === username && u.role === role);
  if (found) applyUserSession(found);
}

function handleAuthSubmit() {
  const username = document.getElementById('auth-username').value.trim().toLowerCase();
  const password = document.getElementById('auth-password').value.trim();
  const fullName = document.getElementById('auth-fullname').value.trim();

  if (!username || !password) return showToast("Username dan kata sandi wajib diisi!", "error");
  const users = getSavedUsers();

  if (authMode === 'register') {
    if (!fullName) return showToast("Isi nama lengkap terlebih dahulu!", "error");
    if (users.some(u => u.username === username && u.role === authRole)) {
      return showToast("Username sudah terdaftar pada peran ini!", "error");
    }
    const newUser = { username, password, fullName, role: authRole };
    users.push(newUser);
    localStorage.setItem('achievquiz_users', JSON.stringify(users));
    playSound('win');
    showToast(`Akun ${authRole === 'guru' ? 'Guru' : 'Siswa'} berhasil dibuat! 🎉`, "success");
    applyUserSession(newUser);
  } else {
    const found = users.find(u => u.username === username && u.password === password && u.role === authRole);
    if (!found) {
      return showToast("Akun tidak ditemukan atau kata sandi/peran salah! Silakan Daftar Baru jika belum punya akun.", "error");
    }
    playSound('win');
    showToast(`Selamat datang kembali, ${found.fullName}!`, "success");
    applyUserSession(found);
  }
}

function applyUserSession(user) {
  currentUser = user;
  localStorage.setItem('achievquiz_current_user', JSON.stringify(user));

  const isGuru = user.role === 'guru';
  const pill = document.getElementById('user-profile-pill');
  pill.classList.remove('hidden');
  pill.classList.add('flex');
  document.getElementById('user-name-display').innerText = user.fullName;
  document.getElementById('user-role-icon').className = isGuru ? 'fas fa-chalkboard-teacher text-fuchsia-600' : 'fas fa-user-graduate text-pink-500';

  document.getElementById('home-role-badge').innerText = isGuru ? `👩‍🏫 Mode Guru • ${user.fullName}` : `🎓 Mode Siswa • ${user.fullName}`;
  document.getElementById('home-welcome-title').innerText = isGuru ? `Halo, ${user.fullName}!` : `Semangat Belajar, ${user.fullName}!`;
  document.getElementById('home-welcome-desc').innerText = isGuru
    ? "Buat soal ujian mandiri di Studio Guru, generate soal dari file PDF, dan bagikan kode ujian ke siswa."
    : "Kerjakan Ulangan Harian, belajar dari file PDF dengan AI, atau mainkan 6 game seru bareng teman!";

  document.getElementById('home-studio-btn').classList.toggle('hidden', !isGuru);
  document.getElementById('nav-studio').classList.toggle('hidden', !isGuru);
  document.getElementById('live-host-card').classList.toggle('hidden', !isGuru);
  document.getElementById('live-join-name').value = user.fullName;
  document.getElementById('studio-author').value = user.fullName;

  navigateTo('home');
}

function openAccountModal() {
  if (!currentUser) return;
  showCustomModal({
    title: `Akun ${currentUser.role === 'guru' ? 'Guru' : 'Siswa'}`,
    message: `Nama: ${currentUser.fullName} (@${currentUser.username}). Apakah kamu ingin keluar / ganti akun?`,
    confirmText: "Keluar Akun",
    onConfirm: () => {
      currentUser = null;
      localStorage.removeItem('achievquiz_current_user');
      document.getElementById('user-profile-pill').classList.add('hidden');
      renderSavedAccounts();
      navigateTo('auth');
      showToast("Berhasil keluar dari akun", "info");
    }
  });
}

function loadAppData() {
  const savedDecks = localStorage.getItem('achievquiz_decks');
  decks = savedDecks ? JSON.parse(savedDecks) : [...DEFAULT_DECKS];
  if (!savedDecks) saveDecksToStorage();

  const savedHistory = localStorage.getItem('achievquiz_history');
  if (savedHistory) historyLogs = JSON.parse(savedHistory);

  updateStreak();
  renderDeckList();
  renderHistory();
  updateGeminiKeyBadge();

  const savedSession = localStorage.getItem('achievquiz_current_user');
  if (savedSession) {
    applyUserSession(JSON.parse(savedSession));
  } else {
    renderSavedAccounts();
    navigateTo('auth');
  }
}

function saveDecksToStorage() {
  localStorage.setItem('achievquiz_decks', JSON.stringify(decks));
  renderDeckList();
}

function addHistoryLog(modeName, title, detail, scoreDisplay, numericScore = null) {
  historyLogs.unshift({
    id: Date.now(),
    mode: modeName,
    title,
    detail,
    scoreDisplay,
    numericScore,
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  });
  localStorage.setItem('achievquiz_history', JSON.stringify(historyLogs));
  renderHistory();
}

function updateStreak() {
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('achievquiz_last_visit');
  let streak = parseInt(localStorage.getItem('achievquiz_streak') || '1');
  if (lastVisit !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastVisit === yesterday.toDateString()) streak += 1;
    else if (lastVisit) streak = 1;
    localStorage.setItem('achievquiz_last_visit', today);
    localStorage.setItem('achievquiz_streak', streak.toString());
  }
  document.getElementById('streak-count').innerText = `${streak} Hari`;
}

// =========================================================================
// 3. NAVIGASI & UI HELPERS
// =========================================================================
let activeTimer = null;
let runnerLoop = null;

function clearAllIntervals() {
  clearInterval(activeTimer);
  clearInterval(runnerLoop);
}

function navigateTo(viewName) {
  if (viewName === 'teacher-studio' && currentUser && currentUser.role !== 'guru') {
    return showToast("Menu Studio Guru khusus untuk akun Guru!", "error");
  }
  playSound('click');
  const sections = [
    'view-auth', 'view-home', 'view-ai-generator', 'view-teacher-studio', 'view-select-deck',
    'view-game-uh', 'view-game-tugofwar', 'view-game-impostor', 'view-game-tower',
    'view-game-spindare', 'view-game-sakura', 'view-game-runner',
    'view-game-flashcard', 'view-history', 'view-result',
    'view-live-lobby', 'view-live-host', 'view-live-student'
  ];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
  const targetEl = document.getElementById(`view-${viewName}`);
  if (targetEl) targetEl.classList.remove('hidden');

  const hideNav = viewName === 'auth' || viewName.startsWith('game-') || viewName === 'live-host' || viewName === 'live-student';
  document.getElementById('app-header').classList.toggle('hidden', viewName === 'game-tugofwar');
  document.getElementById('bottom-nav').classList.toggle('hidden', hideNav);

  if (viewName === 'live-lobby') {
    document.getElementById('live-host-deck').innerHTML = decks.map(d => `<option value="${d.id}">${d.title} (${d.questions.length} Soal)</option>`).join('');
  }

  ['nav-home', 'nav-ai', 'nav-studio', 'nav-history'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('text-pink-500', 'font-bold');
      el.classList.add('text-gray-400', 'font-medium');
    }
  });
  const navMap = { 'home': 'nav-home', 'ai-generator': 'nav-ai', 'teacher-studio': 'nav-studio', 'history': 'nav-history' };
  if (navMap[viewName]) {
    const activeNav = document.getElementById(navMap[viewName]);
    if (activeNav) {
      activeNav.classList.remove('text-gray-400', 'font-medium');
      activeNav.classList.add('text-pink-500', 'font-bold');
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  const colors = { info: 'bg-gray-800 text-white', success: 'bg-teal-500 text-white', error: 'bg-rose-500 text-white' };
  toast.className = `${colors[type] || colors.info} px-4 py-3 rounded-2xl shadow-lg text-xs font-semibold text-center transition-all duration-300`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2600);
}

function showCustomModal({ title, message, showInput = false, inputPlaceholder = '', confirmText = 'Ya', onConfirm }) {
  const modal = document.getElementById('custom-modal');
  document.getElementById('modal-title').innerText = title;
  document.getElementById('modal-message').innerText = message;
  const inputContainer = document.getElementById('modal-input-container');
  const inputField = document.getElementById('modal-input');
  if (showInput) {
    inputContainer.classList.remove('hidden');
    inputField.value = '';
    inputField.placeholder = inputPlaceholder;
  } else {
    inputContainer.classList.add('hidden');
  }
  const confirmBtn = document.getElementById('modal-confirm-btn');
  confirmBtn.innerText = confirmText;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };
  document.getElementById('modal-cancel-btn').onclick = close;
  confirmBtn.onclick = () => { const val = inputField.value; close(); if (onConfirm) onConfirm(val); };
}

function confirmExitGame() {
  showCustomModal({
    title: "Keluar dari Permainan?",
    message: "Progres permainan saat ini tidak akan disimpan.",
    confirmText: "Keluar",
    onConfirm: () => {
      clearAllIntervals();
      navigateTo('home');
    }
  });
}

// =========================================================================
// 4. BANK SOAL, IMPORT/EXPORT, GEMINI AI STUDIO & STUDIO GURU
// =========================================================================
function renderDeckList() {
  const container = document.getElementById('deck-list-container');
  document.getElementById('total-decks-count').innerText = decks.length;
  document.getElementById('stat-total-decks').innerText = decks.length;

  container.innerHTML = decks.map(deck => `
    <div class="bg-white p-4 rounded-3xl border border-pink-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <span class="text-[11px] font-bold text-pink-500 bg-pink-50 px-2.5 py-0.5 rounded-full">${deck.subject}</span>
        <h4 class="font-bold text-gray-800 text-base mt-1">${deck.title}</h4>
        <p class="text-xs text-gray-400">Oleh: ${deck.author} • ${deck.questions.length} Soal</p>
      </div>
      <div class="flex items-center gap-2 self-end sm:self-center">
        ${currentUser && currentUser.role === 'guru' ? `
          <button onclick="shareDeckCode('${deck.id}')" class="px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 text-xs font-bold transition flex items-center gap-1">
            <i class="fas fa-share-nodes"></i> Bagikan
          </button>
        ` : ''}
        <button onclick="deleteDeck('${deck.id}')" class="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center text-xs transition">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function renderHistory() {
  const container = document.getElementById('history-list-container');
  document.getElementById('stat-total-played').innerText = historyLogs.length;
  const uhScores = historyLogs.filter(h => h.numericScore !== null).map(h => h.numericScore);
  const avg = uhScores.length ? Math.round(uhScores.reduce((a, b) => a + b, 0) / uhScores.length) : 0;
  document.getElementById('stat-avg-score').innerText = avg;

  if (historyLogs.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-400 text-center py-8 bg-white rounded-3xl border border-pink-100">Belum ada riwayat permainan. Ayo mulai bermain! 🌸</p>`;
    return;
  }
  container.innerHTML = historyLogs.map(h => `
    <div class="bg-white p-4 rounded-3xl border border-pink-100 shadow-sm flex items-center justify-between gap-3">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-600">${h.mode}</span>
        <h4 class="font-bold text-gray-800 text-sm mt-1">${h.title}</h4>
        <p class="text-[11px] text-gray-400">${h.detail} • ${h.date}</p>
      </div>
      <span class="font-bold text-sm text-pink-600 bg-pink-50 px-3 py-1.5 rounded-2xl shrink-0">${h.scoreDisplay}</span>
    </div>
  `).join('');
}

function clearHistory() {
  showCustomModal({
    title: "Hapus Semua Riwayat?",
    message: "Catatan nilai UH dan riwayat permainan akan dihapus dari HP ini.",
    confirmText: "Hapus",
    onConfirm: () => {
      historyLogs = [];
      localStorage.removeItem('achievquiz_history');
      renderHistory();
      showToast("Riwayat berhasil dibersihkan", "info");
    }
  });
}

function shareDeckCode(deckId) {
  const deck = decks.find(d => d.id === deckId);
  if (!deck) return;
  const code = "ACHIEVQUIZ::" + btoa(encodeURIComponent(JSON.stringify(deck)));
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).then(() => showToast("Kode soal disalin! Bagikan ke grup WA kelas 📋", "success"));
  }
}

function openImportModal() {
  showCustomModal({
    title: "Import Kode Soal Guru",
    message: "Tempelkan kode soal (ACHIEVQUIZ::...) yang dibagikan guru:",
    showInput: true,
    inputPlaceholder: "Tempel kode di sini...",
    confirmText: "Import",
    onConfirm: (code) => {
      try {
        if (!code || !code.startsWith("ACHIEVQUIZ::")) throw new Error();
        const parsed = JSON.parse(decodeURIComponent(atob(code.replace("ACHIEVQUIZ::", "").trim())));
        parsed.id = "import-" + Date.now();
        decks.unshift(parsed);
        saveDecksToStorage();
        playSound('win');
        showToast(`Paket "${parsed.title}" berhasil ditambahkan! 🎉`, "success");
      } catch (e) {
        showToast("Kode soal tidak valid!", "error");
      }
    }
  });
}

function deleteDeck(deckId) {
  showCustomModal({
    title: "Hapus Paket Soal?",
    message: "Paket soal ini akan dihapus dari memori HP kamu.",
    confirmText: "Hapus",
    onConfirm: () => {
      decks = decks.filter(d => d.id !== deckId);
      saveDecksToStorage();
      showToast("Paket soal dihapus.", "info");
    }
  });
}

function openGeminiKeyModal() {
  const existingKey = localStorage.getItem('achievquiz_gemini_key') || '';
  showCustomModal({
    title: "Pengaturan Gemini AI Key ✨",
    message: "Masukkan Google Gemini API Key kamu (opsional, dari aistudio.google.com) agar AI menganalisis PDF & membuat soal super akurat. Kosongkan untuk menggunakan mode cerdas bawaan.",
    showInput: true,
    inputPlaceholder: existingKey ? "Tersimpan: AIzaSy..." : "Tempel Gemini API Key (AIzaSy...)",
    confirmText: "Simpan Key",
    onConfirm: (val) => {
      const trimmed = (val || '').trim();
      if (trimmed) {
        localStorage.setItem('achievquiz_gemini_key', trimmed);
        showToast("Gemini API Key berhasil disimpan di HP! ✨", "success");
      } else {
        localStorage.removeItem('achievquiz_gemini_key');
        showToast("Menggunakan mode cerdas bawaan", "info");
      }
      updateGeminiKeyBadge();
    }
  });
}

function updateGeminiKeyBadge() {
  const badge = document.getElementById('gemini-key-badge');
  if (!badge) return;
  const hasKey = !!localStorage.getItem('achievquiz_gemini_key');
  badge.innerText = hasKey ? "Gemini Aktif ✓" : "API Key";
}

let aiExtractedMaterial = "";
let aiMaterialFileName = "";

async function handleAIMaterialUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const statusEl = document.getElementById('ai-file-status');
  const clearBtn = document.getElementById('ai-clear-file-btn');
  statusEl.classList.remove('hidden');
  statusEl.innerText = `Membaca file "${file.name}"...`;

  try {
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      if (typeof pdfjsLib === 'undefined') throw new Error("Library pembaca PDF belum siap.");
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      const maxPages = Math.min(pdf.numPages, 25);
      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + "\n";
      }
      aiExtractedMaterial = fullText.trim();
    } else {
      aiExtractedMaterial = (await file.text()).trim();
    }

    if (!aiExtractedMaterial) throw new Error("File kosong atau tidak berisi teks yang dapat dibaca.");
    aiMaterialFileName = file.name;
    clearBtn.classList.remove('hidden');
    statusEl.innerText = `✅ Materi "${file.name}" berhasil dimuat (${aiExtractedMaterial.length} karakter). Soal akan khusus dari file ini!`;
    playSound('correct');
  } catch (err) {
    aiExtractedMaterial = "";
    aiMaterialFileName = "";
    statusEl.innerText = `❌ Gagal membaca file: ${err.message}`;
  }
}

function clearAIMaterialFile() {
  aiExtractedMaterial = "";
  aiMaterialFileName = "";
  document.getElementById('ai-material-file').value = "";
  document.getElementById('ai-file-status').classList.add('hidden');
  document.getElementById('ai-clear-file-btn').classList.add('hidden');
}

let geminiChatHistory = [];

function switchGeminiTab(tab) {
  playSound('click');
  const tabQuiz = document.getElementById('ai-tab-quiz');
  const tabChat = document.getElementById('ai-tab-chat');
  const panelQuiz = document.getElementById('ai-panel-quiz');
  const panelChat = document.getElementById('ai-panel-chat');

  if (tab === 'quiz') {
    tabQuiz.className = "py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5";
    tabChat.className = "py-2.5 rounded-xl text-gray-500 hover:text-pink-600 font-bold text-xs transition flex items-center justify-center gap-1.5";
    panelQuiz.classList.remove('hidden');
    panelChat.classList.add('hidden');
  } else {
    tabChat.className = "py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-pink-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5";
    tabQuiz.className = "py-2.5 rounded-xl text-gray-500 hover:text-pink-600 font-bold text-xs transition flex items-center justify-center gap-1.5";
    panelChat.classList.remove('hidden');
    panelQuiz.classList.add('hidden');
  }
}

function useQuickPrompt(promptText) {
  document.getElementById('gemini-chat-input').value = promptText;
  sendGeminiChat();
}

function clearGeminiChat() {
  geminiChatHistory = [];
  document.getElementById('gemini-chat-messages').innerHTML = `
    <div class="flex items-start gap-2.5">
      <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
        <i class="fas fa-sparkles"></i>
      </div>
      <div class="bg-white p-3.5 rounded-2xl rounded-tl-none border border-pink-100 shadow-sm text-xs text-gray-700 leading-relaxed">
        Percakapan telah direset! Silakan tanyakan materi SMA atau soal yang ingin kamu pelajari. ✨
      </div>
    </div>
  `;
}

function appendChatBubble(sender, text) {
  const container = document.getElementById('gemini-chat-messages');
  const formattedText = text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\n/g, '<br>');

  if (sender === 'user') {
    container.innerHTML += `
      <div class="flex items-start justify-end gap-2.5">
        <div class="bg-gradient-to-r from-pink-500 to-rose-400 text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm text-xs leading-relaxed max-w-[85%]">
          ${formattedText}
        </div>
      </div>
    `;
  } else {
    container.innerHTML += `
      <div class="flex items-start gap-2.5">
        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-pink-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
          <i class="fas fa-sparkles"></i>
        </div>
        <div class="bg-white p-3.5 rounded-2xl rounded-tl-none border border-pink-100 shadow-sm text-xs text-gray-700 leading-relaxed max-w-[88%]">
          ${formattedText}
        </div>
      </div>
    `;
  }
  container.scrollTop = container.scrollHeight;
}

async function sendGeminiChat() {
  const inputEl = document.getElementById('gemini-chat-input');
  const sendBtn = document.getElementById('gemini-chat-send-btn');
  const userMsg = inputEl.value.trim();
  if (!userMsg) return;

  inputEl.value = '';
  appendChatBubble('user', userMsg);
  playSound('click');

  sendBtn.disabled = true;
  const loadingId = 'chat-loading-' + Date.now();
  const container = document.getElementById('gemini-chat-messages');
  container.innerHTML += `
    <div id="${loadingId}" class="flex items-center gap-2 text-xs text-pink-500 font-semibold pl-9">
      <i class="fas fa-circle-notch fa-spin"></i> Gemini sedang berpikir...
    </div>
  `;
  container.scrollTop = container.scrollHeight;

  try {
    const savedApiKey = (localStorage.getItem('achievquiz_gemini_key') || '').trim();
    const grade = document.getElementById('ai-grade').value;
    const subject = document.getElementById('ai-subject').value;
    const pdfContext = aiExtractedMaterial
      ? `\n\nKonteks materi PDF yang diunggah pengguna:\n"""${aiExtractedMaterial.slice(0, 12000)}"""`
      : "";

    let replyText = "";
    if (savedApiKey) {
      const systemInstruction = `Kamu adalah Gemini AI, asisten belajar dan tutor pribadi yang ramah, cerdas, dan terstruktur untuk siswa/guru SMA (${grade}, mata pelajaran fokus: ${subject}). Jika pengguna menanyakan soal atau konsep, selalu berikan penjelasan yang jelas serta Pemecahan Masalah langkah demi langkah (Identifikasi Masalah -> Langkah Penyelesaian -> Kesimpulan).${pdfContext}`;

      geminiChatHistory.push({ role: "user", parts: [{ text: userMsg }] });
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${savedApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: geminiChatHistory.slice(-10)
        })
      });
      if (!response.ok) throw new Error("Gagal terhubung ke Gemini API. Periksa API Key kamu.");
      const data = await response.json();
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak dapat memproses jawaban saat ini.";
      geminiChatHistory.push({ role: "model", parts: [{ text: replyText }] });
    } else {
      await new Promise(r => setTimeout(r, 700));
      if (aiExtractedMaterial && (userMsg.toLowerCase().includes('ringkas') || userMsg.toLowerCase().includes('pdf') || userMsg.toLowerCase().includes('materi'))) {
        const summaryLines = aiExtractedMaterial.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 25).slice(0, 4);
        replyText = `**Ringkasan Materi dari File (${aiMaterialFileName}):**\n\n` +
          summaryLines.map((line, i) => `${i + 1}. ${line.trim()}`).join('\n') +
          `\n\n💡 *Tips: Masukkan Gemini API Key di tombol kanan atas agar kita bisa berdiskusi tanya-jawab bebas layaknya Gemini penuh!*`;
      } else {
        replyText = `**Analisis & Pemecahan Masalah (${subject} - ${grade}):**\n\n` +
          `Pertanyaanmu: *"${userMsg}"*\n\n` +
          `1. **Identifikasi Masalah:** Tentukan variabel, konsep utama, atau aturan baku dalam ${subject} yang berkaitan dengan pertanyaan di atas.\n` +
          `2. **Langkah Penyelesaian:** Hubungkan informasi yang diketahui dengan rumus atau prinsip dasar ${subject} secara bertahap.\n` +
          `3. **Kesimpulan:** Pastikan hasil akhir menjawab inti permasalahan dengan tepat.\n\n` +
          `✨ *Catatan: Saat ini kamu menggunakan mode asisten lokal. Tambahkan **Gemini API Key** gratis dari Google AI Studio melalui tombol **API Key** di atas untuk mengaktifkan percakapan AI penuh secara real-time!*`;
      }
    }

    document.getElementById(loadingId)?.remove();
    appendChatBubble('ai', replyText);
    playSound('correct');
  } catch (err) {
    document.getElementById(loadingId)?.remove();
    appendChatBubble('ai', `⚠️ ${err.message || "Terjadi gangguan koneksi ke Gemini AI."}`);
  } finally {
    sendBtn.disabled = false;
  }
}

function buildSmartQuestionsFromMaterial(text, topic, subject, grade, count) {
  const stopWords = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan', 'adalah', 'ini', 'itu', 'atau', 'sebagai', 'dalam', 'oleh', 'karena', 'agar', 'dapat', 'akan', 'juga', 'tersebut', 'merupakan', 'yaitu', 'yakni', 'secara', 'antara', 'lebih', 'tidak', 'satu', 'dua', 'bisa', 'harus', 'saat', 'ketika', 'bahwa']);
  const rawSentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 40 && s.length <= 280 && /[a-zA-Z]{4,}/.test(s));

  const sentences = rawSentences.length > 0 ? rawSentences : [text.trim().slice(0, 240)];
  const allKeywords = Array.from(new Set(text.match(/\b[A-Za-zÀ-ÿ-]{5,}\b/g) || []))
    .filter(w => !stopWords.has(w.toLowerCase()));

  const results = [];
  for (let i = 0; i < count; i++) {
    const sentence = sentences[i % sentences.length];
    const candidateWords = (sentence.match(/\b[A-Za-zÀ-ÿ-]{5,}\b/g) || [])
      .filter(w => !stopWords.has(w.toLowerCase()));

    const targetWord = candidateWords.sort((a, b) => b.length - a.length)[0] || topic;
    const regex = new RegExp(`\\b${targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    const maskedContext = sentence.replace(regex, '[...]');

    const distractors = allKeywords
      .filter(w => w.toLowerCase() !== targetWord.toLowerCase())
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    while (distractors.length < 3) {
      distractors.push(`Mekanisme ${subject} ${distractors.length + 1}`);
    }

    const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);
    const correctIdx = options.findIndex(o => o.toLowerCase() === targetWord.toLowerCase());

    const questionText = maskedContext !== sentence
      ? `Perhatikan kasus/pernyataan dalam materi berikut:\n"${maskedContext}"\nBerdasarkan analisis konsep ${subject}, komponen atau istilah yang paling tepat untuk memecahkan pernyataan di atas adalah...`
      : `Analisis pernyataan berikut: "${sentence}". Konsep atau elemen spesifik manakah yang menjadi kunci pemecahan masalah pada pernyataan tersebut?`;

    results.push({
      q: questionText,
      options,
      correct: correctIdx >= 0 ? correctIdx : 0,
      explanation: `Langkah Pemecahan Masalah:\n1. Identifikasi konteks materi: "${sentence}".\n2. Analisis hubungan sebab-akibat/definisi pada kalimat tersebut.\n3. Kesimpulan: Istilah "${targetWord}" adalah kunci yang tepat melengkapi analisis tersebut.`
    });
  }
  return results;
}

async function generateAIQuiz() {
  const grade = document.getElementById('ai-grade').value;
  const subject = document.getElementById('ai-subject').value;
  const topic = document.getElementById('ai-topic').value.trim();
  const count = Math.max(1, Math.min(50, parseInt(document.getElementById('ai-count').value) || 5));
  const difficulty = document.getElementById('ai-difficulty').value;

  if (!topic && !aiExtractedMaterial) {
    return showToast("Tulis materi pembelajaran atau unggah file PDF/TXT terlebih dahulu!", "error");
  }

  const btn = document.getElementById('btn-generate-ai');
  const loading = document.getElementById('ai-loading');
  btn.disabled = true;
  btn.classList.add('opacity-50');
  loading.classList.remove('hidden');

  try {
    const cleanFileTitle = aiMaterialFileName ? aiMaterialFileName.replace(/\.[^/.]+$/, "") : "";
    const effectiveTopic = topic || cleanFileTitle || `Materi ${subject}`;
    const materialConstraint = aiExtractedMaterial
      ? `\n\nSUMBER MATERI WAJIB:\n"""\n${aiExtractedMaterial.slice(0, 18000)}\n"""\nINSTRUKSI KHUSUS:\n1. Susun seluruh soal HANYA dari fakta, rumus, dan konsep di dalam sumber materi di atas.\n2. Buat soal yang SPESIFIK berupa studi kasus, skenario penerapan, atau analisis masalah (hindari pertanyaan hafalan yang terlalu umum).\n3. JANGAN menuliskan nama file PDF, nomor halaman, atau tag kurung siku di awal kalimat soal.`
      : `\nINSTRUKSI KHUSUS:\n1. Buat soal yang SPESIFIK dengan menghadirkan studi kasus, skenario nyata, atau data konkret pada mata pelajaran ${subject} (${grade}) untuk dipecahkan siswa.\n2. Langsung tulis kalimat soal tanpa awalan tag kurung siku.`;

    const prompt = `Kamu adalah Gemini AI, pakar kurikulum dan pembuat soal HOTS SMA yang sangat cerdas.\nBuatkan ${count} soal pilihan ganda tingkat ${grade} untuk mata pelajaran ${subject} topik "${effectiveTopic}" dengan tingkat kesulitan ${difficulty} dalam Bahasa Indonesia.${materialConstraint}\n4. Pada kolom "explanation", WAJIB tuliskan PEMECAHAN MASALAH secara terstruktur dan langkah demi langkah (Diketahui / Analisis Masalah -> Langkah Penyelesaian / Rumus -> Kesimpulan Jawaban Benar) sehingga siswa benar-benar paham cara menjawab soal tersebut.\nKembalikan HANYA format JSON array valid tanpa markdown dengan struktur:\n[{"q": "soal studi kasus / pemecahan masalah spesifik", "options": ["opsi A", "opsi B", "opsi C", "opsi D"], "correct": 0, "explanation": "Pemecahan Masalah: Langkah 1... Langkah 2... Kesimpulan..."}]`;

    const savedApiKey = (localStorage.getItem('achievquiz_gemini_key') || '').trim();
    let generatedQuestions = null;

    if (savedApiKey) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${savedApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.35 }
        })
      });
      if (!response.ok) throw new Error("API Key Gemini tidak valid atau kuota habis.");
      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      generatedQuestions = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } else {
      await new Promise(r => setTimeout(r, 850));
      if (aiExtractedMaterial) {
        generatedQuestions = buildSmartQuestionsFromMaterial(aiExtractedMaterial, effectiveTopic, subject, grade, count);
      } else {
        const problemTemplates = [
          {
            q: `Seorang siswa ${grade} melakukan analisis kasus pada materi ${effectiveTopic} (${subject}). Jika ditemukan kondisi di mana variabel utama mengalami perubahan signifikan, langkah pemecahan masalah pertama yang paling tepat dilakukan adalah...`,
            options: [
              `Mengidentifikasi parameter utama dan menerapkan prinsip dasar ${effectiveTopic}`,
              `Mengabaikan data anomali dan langsung menarik kesimpulan akhir`,
              `Mengubah seluruh variabel kontrol secara bersamaan tanpa pencatatan`,
              `Menggunakan rumus dari cabang ilmu yang tidak relevan dengan ${subject}`
            ],
            correct: 0,
            explanation: `Pemecahan Masalah:\n1. Identifikasi Masalah: Perubahan variabel utama pada ${effectiveTopic} memerlukan isolasi parameter.\n2. Langkah Analisis: Tetapkan variabel kontrol terlebih dahulu lalu terapkan prinsip dasar ${effectiveTopic}.\n3. Kesimpulan: Mengidentifikasi parameter utama memastikan analisis akurat dan terukur.`
          },
          {
            q: `Dalam suatu skenario penerapan ${effectiveTopic} di kehidupan nyata, sistem mengalami hambatan efisiensi akibat kesalahan prosedur tahap awal. Evaluasi dan solusi spesifik yang paling tepat untuk mengatasi masalah tersebut adalah...`,
            options: [
              `Melakukan validasi ulang input awal sesuai kaidah ${effectiveTopic} sebelum diproses`,
              `Membiarkan sistem berjalan hingga berhenti dengan sendirinya`,
              `Menghapus seluruh tahapan evaluasi agar proses lebih singkat`,
              `Mengganti tujuan utama sistem tanpa memperbaiki sumber hambatan`
            ],
            correct: 0,
            explanation: `Pemecahan Masalah:\n1. Analisis Akar Masalah: Hambatan terjadi karena kesalahan prosedur pada tahap awal.\n2. Solusi Teknis: Melakukan validasi ulang input sesuai standar konsep ${effectiveTopic}.\n3. Kesimpulan: Validasi di tahap awal mencegah kegagalan berantai pada tahap berikutnya.`
          },
          {
            q: `Diberikan dua pendekatan berbeda untuk menyelesaikan studi kasus ${effectiveTopic} dengan tingkat kesulitan ${difficulty}. Kriteria paling spesifik untuk menentukan bahwa solusi pertama lebih optimal dibandingkan solusi kedua adalah...`,
            options: [
              `Tingkat ketepatan hasil yang sesuai dengan hukum/aturan baku ${effectiveTopic} serta efisiensi langkah`,
              `Banyaknya istilah rumit yang digunakan meskipun hasilnya tidak sesuai konsep`,
              `Kecepatan pengerjaan tanpa mempertimbangkan kebenaran data pendukung`,
              `Kesamaan jawaban dengan asumsi umum yang belum teruji secara ilmiah`
            ],
            correct: 0,
            explanation: `Pemecahan Masalah:\n1. Kriteria Evaluasi: Dalam ${subject}, solusi optimal harus memenuhi dua syarat: validitas konsep dan efisiensi.\n2. Perbandingan: Solusi pertama mengutamakan ketepatan hukum baku ${effectiveTopic}.\n3. Kesimpulan: Ketepatan hasil dan efisiensi langkah adalah indikator utama solusi terbaik.`
          }
        ];
        generatedQuestions = Array.from({ length: count }, (_, i) => {
          const tpl = problemTemplates[i % problemTemplates.length];
          return { ...tpl, q: `${tpl.q} (Kasus #${i + 1})` };
        });
      }
    }

    const newDeck = {
      id: "ai-" + Date.now(),
      title: `${effectiveTopic} (${difficulty})`,
      subject: `${subject} - ${grade}`,
      author: savedApiKey ? "Gemini 2.5 Flash AI" : "Gemini Smart Analyzer",
      duration: Math.max(5, count * 2),
      questions: generatedQuestions
    };

    decks.unshift(newDeck);
    saveDecksToStorage();
    playSound('win');
    showToast(`Berhasil membuat ${generatedQuestions.length} soal spesifik! 🎉`, "success");
    navigateTo('home');
  } catch (err) {
    showToast(err.message || "Gagal membuat soal AI.", "error");
  } finally {
    btn.disabled = false;
    btn.classList.remove('opacity-50');
    loading.classList.add('hidden');
  }
}

let studioQuestionImage = null;
let studioOptionImages = [null, null, null, null];

function compressImageToDataURL(file, maxDimension = 480) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxDimension || h > maxDimension) {
          if (w > h) {
            h = Math.round((h * maxDimension) / w);
            w = maxDimension;
          } else {
            w = Math.round((w * maxDimension) / h);
            h = maxDimension;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleStudioImageUpload(event, target) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const maxDim = target === 'question' ? 520 : 280;
    const compressed = await compressImageToDataURL(file, maxDim);
    if (target === 'question') {
      studioQuestionImage = compressed;
      document.getElementById('q-image-preview').src = compressed;
      document.getElementById('q-image-preview-box').classList.remove('hidden');
      document.getElementById('q-image-clear').classList.remove('hidden');
    } else {
      studioOptionImages[target] = compressed;
      document.getElementById(`q-opt-img-prev-${target}`).src = compressed;
      document.getElementById(`q-opt-img-box-${target}`).classList.remove('hidden');
    }
    playSound('correct');
    showToast("Gambar berhasil ditambahkan!", "success");
  } catch (err) {
    showToast("Gagal memproses gambar.", "error");
  }
}

function clearStudioImage(target) {
  if (target === 'question') {
    studioQuestionImage = null;
    document.getElementById('q-image-input').value = '';
    document.getElementById('q-image-preview-box').classList.add('hidden');
    document.getElementById('q-image-clear').classList.add('hidden');
  } else {
    studioOptionImages[target] = null;
    document.getElementById(`q-opt-img-input-${target}`).value = '';
    document.getElementById(`q-opt-img-box-${target}`).classList.add('hidden');
  }
}

function addQuestionToDraft() {
  const q = document.getElementById('q-text').value.trim();
  const opts = [0, 1, 2, 3].map(i => document.getElementById(`q-opt-${i}`).value.trim());
  const hasAnyOptImg = studioOptionImages.some(img => !!img);
  const correct = parseInt(document.getElementById('q-correct').value);
  const explanation = document.getElementById('q-explanation').value.trim() || "Jawaban sesuai kunci dari guru.";

  if ((!q && !studioQuestionImage) || opts.some((o, idx) => !o && !studioOptionImages[idx])) {
    return showToast("Isi pertanyaan (teks/gambar) dan semua pilihan A, B, C, D!", "error");
  }

  const finalOpts = opts.map((o, idx) => o || (studioOptionImages[idx] ? `Gambar ${['A', 'B', 'C', 'D'][idx]}` : ''));
  draftQuestions.push({
    q: q || "Perhatikan gambar berikut dengan saksama:",
    image: studioQuestionImage,
    options: finalOpts,
    optionImages: hasAnyOptImg ? [...studioOptionImages] : null,
    correct,
    explanation
  });

  renderDraftList();
  playSound('click');
  document.getElementById('q-text').value = '';
  clearStudioImage('question');
  [0, 1, 2, 3].forEach(i => {
    document.getElementById(`q-opt-${i}`).value = '';
    clearStudioImage(i);
  });
  document.getElementById('q-explanation').value = '';
  showToast("Soal & gambar ditambahkan ke paket!", "success");
}

function renderDraftList() {
  const list = document.getElementById('draft-questions-list');
  document.getElementById('draft-count').innerText = draftQuestions.length;
  if (draftQuestions.length === 0) {
    list.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">Belum ada soal ditambahkan.</p>`;
    return;
  }
  const labels = ['A', 'B', 'C', 'D'];
  list.innerHTML = draftQuestions.map((item, idx) => `
    <div class="p-3 rounded-2xl bg-pink-50/60 border border-pink-100 flex justify-between items-start gap-2">
      <div class="space-y-1">
        <p class="text-xs font-bold text-gray-800">${idx + 1}. ${item.q} ${item.image ? '<span class="text-[10px] bg-pink-200 text-pink-700 px-1.5 py-0.5 rounded">🖼️ Gambar</span>' : ''}</p>
        ${item.image ? `<img src="${item.image}" class="h-14 rounded-lg border border-pink-200 object-contain bg-white">` : ''}
        <p class="text-[11px] text-teal-600 font-semibold">Kunci: ${labels[item.correct]} (${item.options[item.correct]})</p>
      </div>
      <button onclick="draftQuestions.splice(${idx}, 1); renderDraftList();" class="text-rose-400 hover:text-rose-600 text-xs p-1"><i class="fas fa-times"></i></button>
    </div>
  `).join('');
}

function clearDraft() { draftQuestions = []; renderDraftList(); }

function saveDraftDeck() {
  const title = document.getElementById('studio-title').value.trim();
  const subject = document.getElementById('studio-subject').value.trim() || "Umum SMA";
  const author = document.getElementById('studio-author').value.trim() || "Guru SMA";
  const duration = parseInt(document.getElementById('studio-duration').value) || 15;
  if (!title || draftQuestions.length === 0) return showToast("Isi judul dan tambahkan minimal 1 soal!", "error");

  decks.unshift({ id: "guru-" + Date.now(), title, subject, author, duration, questions: [...draftQuestions] });
  saveDecksToStorage();
  draftQuestions = [];
  renderDraftList();
  document.getElementById('studio-title').value = '';
  playSound('win');
  showToast("Paket ujian berhasil disimpan! 🎉", "success");
  navigateTo('home');
}

// =========================================================================
// 5. DECK SELECTOR & HASIL AKHIR
// =========================================================================
let selectedGameMode = 'uh';

function openDeckSelector(mode) {
  selectedGameMode = mode;
  const modeInfo = {
    uh: { title: "Ulangan Harian (UH)", desc: "Soal acak, timer ujian, dan sertifikat nilai otomatis." },
    flashcard: { title: "Flashcard Hafalan", desc: "Ketuk kartu untuk menghafal konsep dan rumus SMA." },
    tugofwar: { title: "1. Tarik Tambang (1 vs 1)", desc: "Dua siswa duduk berhadapan di 1 HP! Tarik pita merah ke wilayahmu." },
    impostor: { title: "2. Who is the Impostor?", desc: "Permainan detektif kelompok (4–8 siswa) di 1 HP!" },
    tower: { title: "3. Jaga Benteng (Tower Defense)", desc: "Tembak meriam pelangi ke arah Monster Malas!" },
    spindare: { title: "4. Spin & Dare (Roda Kuis)", desc: "Putar roda keberuntungan sebelum menjawab soal!" },
    sakura: { title: "5. Tebak Kata Sakura", desc: "Tebak huruf A–Z sebelum kelopak sakura gugur semua!" },
    runner: { title: "6. Quiz Runner (4 Jalur)", desc: "Pindahkan pelari ke gerbang jawaban yang benar!" }
  };

  document.getElementById('select-mode-title').innerText = modeInfo[mode].title;
  document.getElementById('select-mode-desc').innerText = modeInfo[mode].desc;

  const setupBox = document.getElementById('player-setup-box');
  setupBox.classList.remove('hidden');
  const defaultName = currentUser ? currentUser.fullName : "";

  let extraFields = "";
  if (mode === 'uh') {
    extraFields = `
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1">Nama Lengkap & Kelas (Untuk Sertifikat UH)</label>
        <input type="text" id="setup-student-name" value="${defaultName}" class="w-full px-4 py-2.5 rounded-2xl bg-pink-50/50 border border-pink-200 text-sm focus:outline-none" placeholder="Contoh: Alya Putri - XI IPA 2">
      </div>
    `;
  } else if (mode === 'impostor') {
    extraFields = `
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1">Nama Pemain Kelompok (4 - 8 Siswa, pisahkan dengan koma)</label>
        <input type="text" id="setup-names" value="${defaultName ? defaultName + ', Bima, Citra, Dani' : 'Alya, Bima, Citra, Dani, Eka'}" class="w-full px-4 py-2.5 rounded-2xl bg-purple-50/50 border border-purple-200 text-sm focus:outline-none">
      </div>
    `;
  } else if (mode === 'spindare') {
    extraFields = `
      <div>
        <label class="block text-xs font-bold text-gray-700 mb-1">Nama Peserta Roda Kuis (Pisahkan dengan koma)</label>
        <input type="text" id="setup-names" value="${defaultName ? defaultName + ', Dimas, Sinta, Fajar' : 'Rina, Dimas, Sinta, Fajar'}" class="w-full px-4 py-2.5 rounded-2xl bg-amber-50/50 border border-amber-200 text-sm focus:outline-none">
      </div>
    `;
  }

  setupBox.innerHTML = `
    ${extraFields}
    <div>
      <label class="block text-xs font-bold text-gray-700 mb-1">Custom Jumlah Soal yang Dimainkan (Kosongkan = Semua Soal)</label>
      <input type="number" id="setup-custom-qcount" min="1" max="50" class="w-full px-4 py-2.5 rounded-2xl bg-pink-50/50 border border-pink-200 text-sm focus:outline-none" placeholder="Contoh: 5 (otomatis menyesuaikan jumlah soal paket)">
    </div>
  `;

  document.getElementById('mode-deck-list').innerHTML = decks.map(deck => `
    <div onclick="launchGame('${deck.id}')" class="bg-white p-4 rounded-3xl border-2 border-pink-100 hover:border-pink-400 shadow-sm cursor-pointer transition flex items-center justify-between">
      <div>
        <span class="text-[11px] font-bold text-pink-500">${deck.subject}</span>
        <h4 class="font-bold text-gray-800 text-base">${deck.title}</h4>
        <p class="text-xs text-gray-400">${deck.questions.length} Soal</p>
      </div>
      <div class="w-10 h-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center"><i class="fas fa-play"></i></div>
    </div>
  `).join('');

  navigateTo('select-deck');
}

function parseNamesList(fallback) {
  const el = document.getElementById('setup-names');
  if (!el) return fallback;
  const arr = el.value.split(',').map(s => s.trim()).filter(Boolean);
  return arr.length >= 2 ? arr : fallback;
}

function getCustomSlicedDeck(deck) {
  const customVal = parseInt(document.getElementById('setup-custom-qcount')?.value);
  if (!customVal || customVal <= 0) return deck;
  const pool = [...deck.questions].sort(() => Math.random() - 0.5);
  const sliced = [];
  for (let i = 0; i < customVal; i++) {
    sliced.push(pool[i % pool.length]);
  }
  return { ...deck, questions: sliced };
}

function launchGame(deckId) {
  const rawDeck = decks.find(d => d.id === deckId);
  if (!rawDeck || rawDeck.questions.length === 0) return;
  const deck = getCustomSlicedDeck(rawDeck);
  playSound('click');

  if (selectedGameMode === 'uh') startUHGame(deck, document.getElementById('setup-student-name').value.trim() || (currentUser ? currentUser.fullName : "Siswa SMA"));
  else if (selectedGameMode === 'flashcard') startFlashcardGame(deck);
  else if (selectedGameMode === 'tugofwar') startTugOfWarGame(deck);
  else if (selectedGameMode === 'impostor') startImpostorGame(deck, parseNamesList(["Pemain 1", "Pemain 2", "Pemain 3", "Pemain 4"]));
  else if (selectedGameMode === 'tower') startTowerDefenseGame(deck);
  else if (selectedGameMode === 'spindare') startSpinDareGame(deck, parseNamesList(["Pemain 1", "Pemain 2"]));
  else if (selectedGameMode === 'sakura') startSakuraHangmanGame(deck);
  else if (selectedGameMode === 'runner') startQuizRunnerGame(deck);
}

function showFinalResult({ title, subtitle, scoreText, statsText, standings = null, showCert = false, historyMode, deckTitle, historyDetail, historyScoreDisplay, numericScore = null }) {
  playSound('win');
  navigateTo('result');
  document.getElementById('result-title').innerText = title;
  document.getElementById('result-subtitle').innerText = subtitle;

  const scoreBox = document.getElementById('result-score-box');
  if (scoreText !== null) {
    scoreBox.classList.remove('hidden');
    document.getElementById('result-score').innerText = scoreText;
    document.getElementById('result-stats').innerText = statsText;
  } else {
    scoreBox.classList.add('hidden');
  }

  const lbBox = document.getElementById('result-leaderboard');
  if (standings && standings.length > 0) {
    lbBox.classList.remove('hidden');
    const medals = ['🥇', '🥈', '🥉'];
    document.getElementById('leaderboard-rows').innerHTML = standings.map((item, idx) => `
      <div class="flex items-center justify-between bg-white p-2.5 rounded-xl border border-pink-100">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm w-6 text-center">${medals[idx] || `#${idx + 1}`}</span>
          <span class="font-bold text-xs text-gray-800">${item.name}</span>
        </div>
        <span class="font-bold text-xs text-pink-600">${item.score} Poin</span>
      </div>
    `).join('');
  } else {
    lbBox.classList.add('hidden');
  }

  document.getElementById('btn-download-cert').classList.toggle('hidden', !showCert);
  addHistoryLog(historyMode, deckTitle, historyDetail, historyScoreDisplay, numericScore);
}

// =========================================================================
// 6. ULANGAN HARIAN (UH) & FLASHCARD
// =========================================================================
let uhState = {};
function startUHGame(deck, studentName) {
  uhState = {
    deck, studentName,
    questions: [...deck.questions].sort(() => Math.random() - 0.5),
    currentIndex: 0, correctCount: 0,
    timeLeft: (deck.duration || 10) * 60, answered: false
  };
  navigateTo('game-uh');
  document.getElementById('uh-player-badge').innerText = `Peserta: ${studentName}`;
  renderUHQuestion();
  clearAllIntervals();
  activeTimer = setInterval(() => {
    uhState.timeLeft--;
    const mins = Math.floor(uhState.timeLeft / 60).toString().padStart(2, '0');
    const secs = (uhState.timeLeft % 60).toString().padStart(2, '0');
    document.getElementById('uh-timer').innerText = `${mins}:${secs}`;
    if (uhState.timeLeft <= 0) { clearAllIntervals(); finishUHGame(); }
  }, 1000);
}

function renderUHQuestion() {
  const qObj = uhState.questions[uhState.currentIndex];
  const total = uhState.questions.length;
  uhState.answered = false;
  document.getElementById('uh-progress-text').innerText = `Soal ${uhState.currentIndex + 1} / ${total}`;
  document.getElementById('uh-progress-bar').style.width = `${((uhState.currentIndex + 1) / total) * 100}%`;

  const imgBox = document.getElementById('uh-question-image-box');
  if (qObj.image) {
    document.getElementById('uh-question-image').src = qObj.image;
    imgBox.classList.remove('hidden');
  } else {
    imgBox.classList.add('hidden');
  }

  document.getElementById('uh-question-text').innerText = qObj.q;
  document.getElementById('uh-explanation-box').classList.add('hidden');
  document.getElementById('uh-next-btn').classList.add('hidden');
  const labels = ['A', 'B', 'C', 'D'];
  document.getElementById('uh-options-container').innerHTML = qObj.options.map((opt, idx) => {
    const optImg = qObj.optionImages && qObj.optionImages[idx];
    return `
      <button onclick="selectUHAnswer(${idx})" id="uh-opt-${idx}" class="w-full text-left p-4 rounded-2xl border-2 border-pink-100 hover:border-pink-400 bg-pink-50/30 font-medium text-sm text-gray-700 transition flex items-center gap-3">
        <span class="w-7 h-7 rounded-lg bg-white border border-pink-200 text-pink-500 font-bold flex items-center justify-center shrink-0">${labels[idx]}</span>
        <div class="flex flex-col gap-1.5">
          ${optImg ? `<img src="${optImg}" class="max-h-24 rounded-xl border border-pink-100 object-contain bg-white p-1">` : ''}
          <span>${opt}</span>
        </div>
      </button>
    `;
  }).join('');
}

function selectUHAnswer(selectedIdx) {
  if (uhState.answered) return;
  uhState.answered = true;
  const qObj = uhState.questions[uhState.currentIndex];
  const isCorrect = selectedIdx === qObj.correct;

  if (isCorrect) {
    uhState.correctCount++;
    playSound('correct');
    document.getElementById(`uh-opt-${selectedIdx}`).className = "w-full text-left p-4 rounded-2xl border-2 border-teal-500 bg-teal-50 text-teal-800 font-bold transition flex items-center gap-3 text-sm";
  } else {
    playSound('wrong');
    document.getElementById(`uh-opt-${selectedIdx}`).className = "w-full text-left p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-bold transition flex items-center gap-3 text-sm";
    document.getElementById(`uh-opt-${qObj.correct}`).className = "w-full text-left p-4 rounded-2xl border-2 border-teal-500 bg-teal-50 text-teal-800 font-bold transition flex items-center gap-3 text-sm";
  }

  document.getElementById('uh-explanation-text').innerText = qObj.explanation;
  document.getElementById('uh-explanation-box').classList.remove('hidden');
  const nextBtn = document.getElementById('uh-next-btn');
  nextBtn.classList.remove('hidden');
  nextBtn.innerHTML = uhState.currentIndex + 1 < uhState.questions.length ? `Soal Berikutnya <i class="fas fa-arrow-right ml-1"></i>` : `Lihat Hasil & Sertifikat <i class="fas fa-award ml-1"></i>`;
}

function nextUHQuestion() {
  uhState.currentIndex++;
  if (uhState.currentIndex < uhState.questions.length) {
    renderUHQuestion();
  } else {
    clearAllIntervals();
    finishUHGame();
  }
}

function finishUHGame() {
  const total = uhState.questions.length;
  const finalScore = Math.round((uhState.correctCount / total) * 100);
  showFinalResult({
    title: "Ulangan Harian Selesai! 🎓",
    subtitle: `${uhState.deck.title} • ${uhState.studentName}`,
    scoreText: `${finalScore}`,
    statsText: `Benar ${uhState.correctCount} dari ${total} soal`,
    showCert: true,
    historyMode: "Ulangan Harian",
    deckTitle: uhState.deck.title,
    historyDetail: `${uhState.studentName} (${uhState.correctCount}/${total})`,
    historyScoreDisplay: `Nilai ${finalScore}`,
    numericScore: finalScore
  });
}

function downloadCertificate() {
  const canvas = document.getElementById('certificate-canvas');
  const ctx = canvas.getContext('2d');
  const total = uhState.questions ? uhState.questions.length : 5;
  const correct = uhState.correctCount || 0;
  const finalScore = Math.round((correct / total) * 100);
  const studentName = uhState.studentName || (currentUser ? currentUser.fullName : "Siswa SMA");
  const deckTitle = uhState.deck ? uhState.deck.title : "Ulangan Harian ACHIEVQUIZ";

  ctx.fillStyle = "#FFF0F5";
  ctx.fillRect(0, 0, 800, 500);
  ctx.strokeStyle = "#FF69B4";
  ctx.lineWidth = 12;
  ctx.strokeRect(24, 24, 752, 452);

  ctx.fillStyle = "#EC4899";
  ctx.font = "bold 36px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SERTIFIKAT HASIL ULANGAN HARIAN", 400, 100);

  ctx.fillStyle = "#6B7280";
  ctx.font = "18px sans-serif";
  ctx.fillText("Diberikan kepada:", 400, 155);

  ctx.fillStyle = "#1F2937";
  ctx.font = "bold 32px sans-serif";
  ctx.fillText(studentName, 400, 200);

  ctx.fillStyle = "#4B5563";
  ctx.font = "18px sans-serif";
  ctx.fillText(`Telah menyelesaikan: ${deckTitle}`, 400, 245);

  ctx.fillStyle = "#DB2777";
  ctx.font = "bold 64px sans-serif";
  ctx.fillText(`NILAI: ${finalScore}`, 400, 330);

  ctx.fillStyle = "#6B7280";
  ctx.font = "16px sans-serif";
  ctx.fillText(`Benar ${correct} dari ${total} soal • ${new Date().toLocaleDateString('id-ID')}`, 400, 385);
  ctx.fillText("ACHIEVQUIZ • Aplikasi Pembelajaran SMA", 400, 430);

  const link = document.createElement('a');
  link.download = `Sertifikat_UH_${studentName.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
  showToast("Sertifikat nilai berhasil diunduh! 🏆", "success");
}

let fcState = {};
function startFlashcardGame(deck) {
  fcState = { deck, cards: [...deck.questions], index: 0, mastered: 0, flipped: false };
  navigateTo('game-flashcard');
  renderFlashcard();
}

function flipFlashcard() {
  playSound('click');
  fcState.flipped = !fcState.flipped;
  document.getElementById('flashcard-inner').classList.toggle('rotate-y-180', fcState.flipped);
}

function renderFlashcard() {
  const card = fcState.cards[fcState.index];
  fcState.flipped = false;
  document.getElementById('flashcard-inner').classList.remove('rotate-y-180');
  document.getElementById('fc-counter').innerText = `Kartu ${fcState.index + 1} / ${fcState.cards.length}`;

  const frontImg = document.getElementById('fc-front-image');
  if (card.image) { frontImg.src = card.image; frontImg.classList.remove('hidden'); }
  else { frontImg.classList.add('hidden'); }

  const backImg = document.getElementById('fc-back-image');
  const correctOptImg = card.optionImages && card.optionImages[card.correct];
  if (correctOptImg) { backImg.src = correctOptImg; backImg.classList.remove('hidden'); }
  else { backImg.classList.add('hidden'); }

  document.getElementById('fc-front-text').innerText = card.q;
  document.getElementById('fc-back-answer').innerText = card.options[card.correct];
  document.getElementById('fc-back-exp').innerText = card.explanation;
}

function nextFlashcard(isMastered) {
  playSound(isMastered ? 'correct' : 'click');
  if (isMastered) fcState.mastered++;
  fcState.index++;
  if (fcState.index < fcState.cards.length) {
    renderFlashcard();
  } else {
    showFinalResult({
      title: "Sesi Flashcard Selesai! 🧠",
      subtitle: fcState.deck.title,
      scoreText: `${fcState.mastered} / ${fcState.cards.length}`,
      statsText: "Kartu konsep yang sudah kamu kuasai",
      historyMode: "Flashcard",
      deckTitle: fcState.deck.title,
      historyDetail: `Paham ${fcState.mastered}/${fcState.cards.length} kartu`,
      historyScoreDisplay: `${fcState.mastered}/${fcState.cards.length} Paham`
    });
  }
}

// =========================================================================
// 7. GAME 1: TARIK TAMBANG (1 VS 1)
// =========================================================================
let towState = {};
function startTugOfWarGame(deck) {
  towState = { deck, questions: [...deck.questions].sort(() => Math.random() - 0.5), qIndex: 0, position: 50, locked: false };
  navigateTo('game-tugofwar');
  renderTugOfWarRound();
}

function renderTugOfWarRound() {
  towState.locked = false;
  const qObj = towState.questions[towState.qIndex % towState.questions.length];
  document.getElementById('tow-ribbon').style.left = `${towState.position}%`;
  document.getElementById('tow-p1-question').innerText = qObj.q;
  document.getElementById('tow-p2-question').innerText = qObj.q;
  document.getElementById('tow-p1-status').innerText = "Tarik ke arahmu!";
  document.getElementById('tow-p2-status').innerText = "Tarik ke arahmu!";

  const labels = ['A', 'B', 'C', 'D'];
  document.getElementById('tow-p1-options').innerHTML = qObj.options.map((opt, idx) => `
    <button onclick="answerTugOfWar(1, ${idx})" class="p-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-xs font-bold text-gray-800 line-clamp-2 text-left">
      <span class="text-pink-600 mr-1">${labels[idx]}.</span>${opt}
    </button>
  `).join('');

  document.getElementById('tow-p2-options').innerHTML = qObj.options.map((opt, idx) => `
    <button onclick="answerTugOfWar(2, ${idx})" class="p-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-xs font-bold text-gray-800 line-clamp-2 text-left">
      <span class="text-purple-600 mr-1">${labels[idx]}.</span>${opt}
    </button>
  `).join('');
}

function answerTugOfWar(player, optIdx) {
  if (towState.locked) return;
  towState.locked = true;
  const qObj = towState.questions[towState.qIndex % towState.questions.length];
  const isCorrect = optIdx === qObj.correct;

  if (isCorrect) {
    playSound('correct');
    if (player === 1) {
      towState.position = Math.min(92, towState.position + 15);
      document.getElementById('tow-p1-status').innerText = "BENAR! Tarik kuat! 💪";
      document.getElementById('tow-p2-status').innerText = "Lawan menarik tali!";
    } else {
      towState.position = Math.max(8, towState.position - 15);
      document.getElementById('tow-p2-status').innerText = "BENAR! Tarik kuat! 💪";
      document.getElementById('tow-p1-status').innerText = "Lawan menarik tali!";
    }
  } else {
    playSound('wrong');
    if (player === 1) {
      towState.position = Math.max(8, towState.position - 12);
      document.getElementById('tow-p1-status').innerText = "SALAH! Tali tertarik lawan! 💥";
    } else {
      towState.position = Math.min(92, towState.position + 12);
      document.getElementById('tow-p2-status').innerText = "SALAH! Tali tertarik lawan! 💥";
    }
  }

  document.getElementById('tow-ribbon').style.left = `${towState.position}%`;

  setTimeout(() => {
    if (towState.position >= 88 || towState.position <= 12) {
      const winner = towState.position >= 88 ? "Pemain 1 (Pink)" : "Pemain 2 (Ungu)";
      showFinalResult({
        title: `${winner} Menang! 🪢🏆`,
        subtitle: `Tarik Tambang 1 vs 1 • ${towState.deck.title}`,
        scoreText: winner,
        statsText: "Pita merah berhasil melewati garis batas wilayah!",
        historyMode: "Tarik Tambang 1v1",
        deckTitle: towState.deck.title,
        historyDetail: `Pemenang: ${winner}`,
        historyScoreDisplay: winner
      });
    } else {
      towState.qIndex++;
      renderTugOfWarRound();
    }
  }, 750);
}

// =========================================================================
// 8. GAME 2: WHO IS THE IMPOSTOR?
// =========================================================================
let impState = {};
function startImpostorGame(deck, players) {
  const qObj = deck.questions[Math.floor(Math.random() * deck.questions.length)];
  const impostorIdx = Math.floor(Math.random() * players.length);
  impState = { deck, players, qObj, impostorIdx, turnIdx: 0, answers: [] };
  navigateTo('game-impostor');
  setupImpostorPassScreen();
}

function setupImpostorPassScreen() {
  document.getElementById('imp-phase-title').innerText = "Fase Rahasia (Oper HP)";
  document.getElementById('imp-progress-badge').innerText = `${impState.turnIdx + 1}/${impState.players.length}`;
  document.getElementById('imp-next-player').innerText = impState.players[impState.turnIdx];
  document.getElementById('imp-pass-screen').classList.remove('hidden');
  document.getElementById('imp-question-screen').classList.add('hidden');
  document.getElementById('imp-voting-screen').classList.add('hidden');
}

function revealImpostorTurn() {
  playSound('click');
  document.getElementById('imp-pass-screen').classList.add('hidden');
  document.getElementById('imp-question-screen').classList.remove('hidden');

  const isImpostor = impState.turnIdx === impState.impostorIdx;
  const roleBanner = document.getElementById('imp-role-banner');
  const imgBox = document.getElementById('imp-question-image-box');

  if (isImpostor) {
    roleBanner.className = "p-3 rounded-2xl text-center font-bold text-xs bg-rose-100 text-rose-700 border border-rose-300";
    roleBanner.innerHTML = "🤫 KAMU ADALAH IMPOSTOR! Kamu tidak melihat soal asli. Tebak pilihan yang paling meyakinkan agar tidak ketahuan!";
    imgBox.classList.add('hidden');
    document.getElementById('imp-question-text').innerText = `[SOAL DISENSOR] Pilih salah satu istilah di bawah ini dan bersiaplah membela diri saat diskusi!`;
  } else {
    roleBanner.className = "p-3 rounded-2xl text-center font-bold text-xs bg-teal-100 text-teal-800 border border-teal-300";
    roleBanner.innerHTML = "🧑‍🚀 KAMU ADALAH CREWMATE! Jawab dengan benar agar bisa menemukan siapa Impostornya.";
    if (impState.qObj.image) {
      document.getElementById('imp-question-image').src = impState.qObj.image;
      imgBox.classList.remove('hidden');
    } else {
      imgBox.classList.add('hidden');
    }
    document.getElementById('imp-question-text').innerText = impState.qObj.q;
  }

  const labels = ['A', 'B', 'C', 'D'];
  document.getElementById('imp-options-container').innerHTML = impState.qObj.options.map((opt, idx) => {
    const optImg = impState.qObj.optionImages && impState.qObj.optionImages[idx];
    return `
      <button onclick="submitImpostorChoice(${idx})" class="w-full text-left p-4 rounded-2xl border-2 border-purple-100 hover:border-purple-400 bg-purple-50/30 font-semibold text-sm text-gray-800 flex items-center gap-3">
        <span class="w-7 h-7 rounded-lg bg-white border border-purple-200 text-purple-600 font-bold flex items-center justify-center shrink-0">${labels[idx]}</span>
        <div class="flex flex-col gap-1">
          ${optImg ? `<img src="${optImg}" class="max-h-20 rounded-lg border border-purple-100 object-contain bg-white p-1">` : ''}
          <span>${opt}</span>
        </div>
      </button>
    `;
  }).join('');
}

function submitImpostorChoice(optIdx) {
  playSound('click');
  impState.answers.push({
    player: impState.players[impState.turnIdx],
    choiceText: impState.qObj.options[optIdx],
    isCorrect: optIdx === impState.qObj.correct
  });
  impState.turnIdx++;
  if (impState.turnIdx < impState.players.length) setupImpostorPassScreen();
  else showImpostorVoting();
}

function showImpostorVoting() {
  document.getElementById('imp-phase-title').innerText = "Diskusi & Voting Kelompok";
  document.getElementById('imp-pass-screen').classList.add('hidden');
  document.getElementById('imp-question-screen').classList.add('hidden');
  document.getElementById('imp-voting-screen').classList.remove('hidden');
  document.getElementById('imp-real-question-reveal').innerText = impState.qObj.q;

  document.getElementById('imp-answers-summary').innerHTML = impState.answers.map(a => `
    <div class="flex justify-between items-center text-xs bg-white p-2.5 rounded-xl border border-purple-100">
      <span class="font-bold text-gray-800">${a.player}</span>
      <span class="text-purple-700 font-semibold">Memilih: "${a.choiceText}"</span>
    </div>
  `).join('');

  document.getElementById('imp-vote-buttons').innerHTML = impState.players.map((p, idx) => `
    <button onclick="resolveImpostorVote(${idx})" class="py-3 px-4 rounded-2xl bg-purple-100 hover:bg-rose-500 hover:text-white text-purple-800 font-bold text-xs transition">
      Tuduh ${p} 🕵️
    </button>
  `).join('');
}

function resolveImpostorVote(votedIdx) {
  const realImpostor = impState.players[impState.impostorIdx];
  const accused = impState.players[votedIdx];
  const crewWon = votedIdx === impState.impostorIdx;

  showFinalResult({
    title: crewWon ? "Crewmate Menang! 🎉" : "Impostor Lolos! 🤫",
    subtitle: `Kalian menuduh ${accused}. Impostor sebenarnya adalah ${realImpostor}!`,
    scoreText: crewWon ? "CREWMATE WIN" : "IMPOSTOR WIN",
    statsText: `Jawaban benar soal: ${impState.qObj.options[impState.qObj.correct]}`,
    historyMode: "Who is the Impostor?",
    deckTitle: impState.deck.title,
    historyDetail: `Impostor: ${realImpostor}`,
    historyScoreDisplay: crewWon ? "Crewmate Menang" : "Impostor Menang"
  });
}

// =========================================================================
// 9. GAME 3: TOWER DEFENSE / JAGA BENTENG
// =========================================================================
let tdState = {};
function startTowerDefenseGame(deck) {
  tdState = { deck, questions: [...deck.questions].sort(() => Math.random() - 0.5), qIndex: 0, castleHp: 3, monsterPos: 85, score: 0, locked: false };
  navigateTo('game-tower');
  renderTowerDefense();
}

function renderTowerDefense() {
  tdState.locked = false;
  const qObj = tdState.questions[tdState.qIndex];
  const monsterNames = ["👾 Monster Malas", "👻 Hantu Remedial", "🦖 Dino Ngantuk", "🤖 Robot Menyontek"];
  document.getElementById('td-castle-hp').innerText = '❤️'.repeat(tdState.castleHp);
  document.getElementById('td-wave-badge').innerText = `Gelombang ${tdState.qIndex + 1}/${tdState.questions.length}`;
  document.getElementById('td-monster-name').innerText = monsterNames[tdState.qIndex % monsterNames.length];
  document.getElementById('td-monster-sprite').style.left = `${tdState.monsterPos}%`;

  const imgBox = document.getElementById('td-question-image-box');
  if (qObj.image) { document.getElementById('td-question-image').src = qObj.image; imgBox.classList.remove('hidden'); }
  else { imgBox.classList.add('hidden'); }
  document.getElementById('td-question-text').innerText = qObj.q;

  const labels = ['A', 'B', 'C', 'D'];
  document.getElementById('td-options-container').innerHTML = qObj.options.map((opt, idx) => {
    const optImg = qObj.optionImages && qObj.optionImages[idx];
    return `
      <button onclick="answerTowerDefense(${idx})" id="td-opt-${idx}" class="w-full text-left p-3.5 rounded-2xl border-2 border-indigo-100 hover:border-indigo-400 bg-indigo-50/30 font-semibold text-sm text-gray-800 flex items-center gap-3">
        <span class="w-7 h-7 rounded-lg bg-white border border-indigo-200 text-indigo-600 font-bold flex items-center justify-center shrink-0">${labels[idx]}</span>
        <div class="flex flex-col gap-1">
          ${optImg ? `<img src="${optImg}" class="max-h-20 rounded-lg border border-indigo-100 object-contain bg-white p-1">` : ''}
          <span>${opt}</span>
        </div>
      </button>
    `;
  }).join('');
}

function answerTowerDefense(optIdx) {
  if (tdState.locked) return;
  tdState.locked = true;
  const qObj = tdState.questions[tdState.qIndex];
  const isCorrect = optIdx === qObj.correct;
  const cannon = document.getElementById('td-cannonball');

  if (isCorrect) {
    playSound('correct');
    tdState.score += 100;
    document.getElementById(`td-opt-${optIdx}`).className = "w-full text-left p-3.5 rounded-2xl border-2 border-teal-500 bg-teal-50 text-teal-800 font-bold flex items-center gap-3 text-sm";
    cannon.classList.remove('hidden');
    cannon.style.left = `${tdState.monsterPos}%`;
    showToast("Meriam Pelangi menembak monster! 🌈💥", "success");
  } else {
    playSound('wrong');
    document.getElementById(`td-opt-${optIdx}`).className = "w-full text-left p-3.5 rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-bold flex items-center gap-3 text-sm";
    tdState.monsterPos -= 28;
    document.getElementById('td-monster-sprite').style.left = `${Math.max(15, tdState.monsterPos)}%`;
    if (tdState.monsterPos <= 20) {
      tdState.castleHp--;
      tdState.monsterPos = 85;
      showToast("Monster menyerang benteng! -1 HP 🏰💥", "error");
    } else {
      showToast("Salah! Monster berlari mendekati benteng! 👾", "error");
    }
  }

  setTimeout(() => {
    cannon.classList.add('hidden');
    cannon.style.left = '3rem';
    if (tdState.castleHp <= 0) {
      return showFinalResult({
        title: "Benteng Hancur! 🏰💔",
        subtitle: `Jaga Benteng • ${tdState.deck.title}`,
        scoreText: `${tdState.score}`,
        statsText: "Monster berhasil menembus pertahanan sekolah.",
        historyMode: "Jaga Benteng",
        deckTitle: tdState.deck.title,
        historyDetail: "Benteng Kalah",
        historyScoreDisplay: `${tdState.score} Poin`
      });
    }
    tdState.qIndex++;
    if (tdState.qIndex < tdState.questions.length) {
      tdState.monsterPos = 85;
      renderTowerDefense();
    } else {
      showFinalResult({
        title: "Benteng Selamat! 🏰🎉",
        subtitle: `Jaga Benteng • ${tdState.deck.title}`,
        scoreText: `${tdState.score}`,
        statsText: `Sisa nyawa benteng: ${tdState.castleHp} ❤️`,
        historyMode: "Jaga Benteng",
        deckTitle: tdState.deck.title,
        historyDetail: `Sisa ${tdState.castleHp} Nyawa`,
        historyScoreDisplay: `${tdState.score} Poin`
      });
    }
  }, 850);
}

// =========================================================================
// 10. GAME 4: SPIN & DARE
// =========================================================================
let sdState = {};
function startSpinDareGame(deck, playerNames) {
  sdState = { deck, players: playerNames.map(name => ({ name, score: 100 })), questions: [...deck.questions].sort(() => Math.random() - 0.5), qIndex: 0, turnIdx: 0, currentEffect: null, rotation: 0, locked: false };
  navigateTo('game-spindare');
  renderSpinDareLobby();
}

function renderSpinDareLobby() {
  sdState.locked = false;
  const currentPlayer = sdState.players[sdState.turnIdx];
  document.getElementById('sd-turn-badge').innerText = `Giliran: ${currentPlayer.name}`;
  document.getElementById('sd-q-counter').innerText = `Soal ${sdState.qIndex + 1}/${sdState.questions.length}`;
  document.getElementById('sd-wheel-screen').classList.remove('hidden');
  document.getElementById('sd-question-screen').classList.add('hidden');
  document.getElementById('btn-spin-wheel').disabled = false;

  document.getElementById('sd-scoreboard').innerHTML = sdState.players.map((p, idx) => `
    <div class="p-2.5 rounded-2xl border ${idx === sdState.turnIdx ? 'bg-amber-100 border-amber-400' : 'bg-white border-pink-100'} text-center">
      <p class="text-[11px] font-bold text-gray-800 truncate">${p.name}</p>
      <p class="text-xs font-extrabold text-pink-600">${p.score} Poin</p>
    </div>
  `).join('');
}

function spinWheelAction() {
  const btn = document.getElementById('btn-spin-wheel');
  btn.disabled = true;
  playSound('click');

  const effects = [
    { label: "✨ POIN x2! Jika benar, skor bertambah +200!", type: "double" },
    { label: "🔄 TUKAR SKOR! Jika benar, skor ditukar dengan pemain tertinggi!", type: "swap" },
    { label: "🎤 TANTANGAN! Jika salah, wajib baca pantun / nyanyi 1 bait!", type: "dare" },
    { label: "💣 BOM -50! Langsung kena -50 poin, jawab benar untuk +100!", type: "bomb" }
  ];
  const chosen = effects[Math.floor(Math.random() * effects.length)];
  sdState.currentEffect = chosen;

  sdState.rotation += 1080 + Math.floor(Math.random() * 360);
  document.getElementById('sd-wheel-circle').style.transform = `rotate(${sdState.rotation}deg)`;

  setTimeout(() => {
    playSound('win');
    if (chosen.type === 'bomb') {
      sdState.players[sdState.turnIdx].score = Math.max(0, sdState.players[sdState.turnIdx].score - 50);
    }
    document.getElementById('sd-wheel-screen').classList.add('hidden');
    document.getElementById('sd-question-screen').classList.remove('hidden');
    document.getElementById('sd-effect-banner').innerText = chosen.label;

    const qObj = sdState.questions[sdState.qIndex];
    const imgBox = document.getElementById('sd-question-image-box');
    if (qObj.image) { document.getElementById('sd-question-image').src = qObj.image; imgBox.classList.remove('hidden'); }
    else { imgBox.classList.add('hidden'); }
    document.getElementById('sd-question-text').innerText = qObj.q;
    const labels = ['A', 'B', 'C', 'D'];
    document.getElementById('sd-options-container').innerHTML = qObj.options.map((opt, idx) => {
      const optImg = qObj.optionImages && qObj.optionImages[idx];
      return `
        <button onclick="answerSpinDare(${idx})" id="sd-opt-${idx}" class="w-full text-left p-4 rounded-2xl border-2 border-amber-100 hover:border-amber-400 bg-amber-50/30 font-semibold text-sm text-gray-800 flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg bg-white border border-amber-200 text-amber-600 font-bold flex items-center justify-center shrink-0">${labels[idx]}</span>
          <div class="flex flex-col gap-1">
            ${optImg ? `<img src="${optImg}" class="max-h-20 rounded-lg border border-amber-100 object-contain bg-white p-1">` : ''}
            <span>${opt}</span>
          </div>
        </button>
      `;
    }).join('');
  }, 3100);
}

function answerSpinDare(optIdx) {
  if (sdState.locked) return;
  sdState.locked = true;
  const qObj = sdState.questions[sdState.qIndex];
  const isCorrect = optIdx === qObj.correct;
  const p = sdState.players[sdState.turnIdx];

  if (isCorrect) {
    playSound('correct');
    document.getElementById(`sd-opt-${optIdx}`).className = "w-full text-left p-4 rounded-2xl border-2 border-teal-500 bg-teal-50 text-teal-800 font-bold flex items-center gap-3 text-sm";
    if (sdState.currentEffect.type === 'double') {
      p.score += 200;
      showToast("Benar! Poin x2 (+200)! ✨", "success");
    } else if (sdState.currentEffect.type === 'swap') {
      const maxPlayer = [...sdState.players].sort((a, b) => b.score - a.score)[0];
      const temp = p.score + 100;
      p.score = Math.max(temp, maxPlayer.score);
      showToast("Benar! Skor ditukar ke peringkat teratas! 🔄", "success");
    } else {
      p.score += 100;
      showToast("Jawaban Benar! +100 Poin 🎉", "success");
    }
  } else {
    playSound('wrong');
    document.getElementById(`sd-opt-${optIdx}`).className = "w-full text-left p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-bold flex items-center gap-3 text-sm";
    if (sdState.currentEffect.type === 'dare') {
      showToast(`SALAH! ${p.name} wajib melakukan tantangan nyanyi/pantun! 🎤`, "error");
    } else {
      showToast("Jawaban kurang tepat!", "error");
    }
  }

  setTimeout(() => {
    sdState.qIndex++;
    sdState.turnIdx = (sdState.turnIdx + 1) % sdState.players.length;
    if (sdState.qIndex < sdState.questions.length) {
      renderSpinDareLobby();
    } else {
      const sorted = [...sdState.players].sort((a, b) => b.score - a.score);
      showFinalResult({
        title: `Pemenang: ${sorted[0].name}! 🎡🏆`,
        subtitle: `Spin & Dare • ${sdState.deck.title}`,
        scoreText: `${sorted[0].score} Poin`,
        statsText: "Klasemen akhir Roda Keberuntungan Kuis",
        standings: sorted,
        historyMode: "Spin & Dare",
        deckTitle: sdState.deck.title,
        historyDetail: `Juara: ${sorted[0].name}`,
        historyScoreDisplay: `${sorted[0].score} Poin`
      });
    }
  }, 1100);
}

// =========================================================================
// 11. GAME 5: TEBAK KATA BUNGA SAKURA
// =========================================================================
let sakuraState = {};
function startSakuraHangmanGame(deck) {
  sakuraState = { deck, questions: [...deck.questions].sort(() => Math.random() - 0.5), qIndex: 0, score: 0, petalsLeft: 6, targetWord: "", guessedLetters: new Set() };
  navigateTo('game-sakura');
  setupSakuraRound();
}

function setupSakuraRound() {
  const qObj = sakuraState.questions[sakuraState.qIndex];
  const rawAns = qObj.options[qObj.correct].toUpperCase().replace(/[^A-Z0-9 ]/g, '');
  sakuraState.targetWord = rawAns || "JAWABAN";
  sakuraState.petalsLeft = 6;
  sakuraState.guessedLetters = new Set([' ']);

  document.getElementById('sakura-progress').innerText = `Kata ${sakuraState.qIndex + 1} / ${sakuraState.questions.length}`;
  document.getElementById('sakura-score').innerText = `Skor: ${sakuraState.score}`;

  const imgBox = document.getElementById('sakura-question-image-box');
  if (qObj.image) { document.getElementById('sakura-question-image').src = qObj.image; imgBox.classList.remove('hidden'); }
  else { imgBox.classList.add('hidden'); }
  document.getElementById('sakura-clue-text').innerText = qObj.q;

  renderSakuraUI();
}

function renderSakuraUI() {
  const petals = '🌸'.repeat(sakuraState.petalsLeft) + '🥀'.repeat(Math.max(0, 6 - sakuraState.petalsLeft));
  document.getElementById('sakura-petals-display').innerText = petals;

  const chars = sakuraState.targetWord.split('');
  document.getElementById('sakura-word-slots').innerHTML = chars.map(ch => {
    if (ch === ' ') return `<span class="w-4"></span>`;
    const revealed = sakuraState.guessedLetters.has(ch);
    return `<span class="w-8 h-9 rounded-xl border-2 ${revealed ? 'border-pink-400 bg-pink-50 text-pink-700' : 'border-gray-200 bg-white text-transparent'} font-extrabold text-sm flex items-center justify-center shadow-sm">${revealed ? ch : '_'}</span>`;
  }).join('');

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('');
  document.getElementById('sakura-keyboard').innerHTML = alphabet.map(letter => {
    const used = sakuraState.guessedLetters.has(letter);
    return `
      <button onclick="guessSakuraLetter('${letter}')" ${used ? 'disabled' : ''} class="py-2 rounded-xl font-bold text-xs transition ${used ? 'bg-gray-100 text-gray-300' : 'bg-pink-50 hover:bg-pink-500 hover:text-white text-pink-700 border border-pink-200'}">
        ${letter}
      </button>
    `;
  }).join('');
}

function guessSakuraLetter(letter) {
  if (sakuraState.guessedLetters.has(letter)) return;
  sakuraState.guessedLetters.add(letter);

  if (sakuraState.targetWord.includes(letter)) playSound('correct');
  else { playSound('wrong'); sakuraState.petalsLeft--; }

  renderSakuraUI();

  const allRevealed = sakuraState.targetWord.split('').every(ch => sakuraState.guessedLetters.has(ch));
  if (allRevealed) {
    sakuraState.score += 100;
    showToast(`Benar! Katanya adalah "${sakuraState.targetWord}" 🌸`, "success");
    setTimeout(() => advanceSakuraRound(), 900);
  } else if (sakuraState.petalsLeft <= 0) {
    showToast(`Kelopak habis! Jawaban: "${sakuraState.targetWord}" 🥀`, "error");
    setTimeout(() => advanceSakuraRound(), 1100);
  }
}

function advanceSakuraRound() {
  sakuraState.qIndex++;
  if (sakuraState.qIndex < sakuraState.questions.length) {
    setupSakuraRound();
  } else {
    showFinalResult({
      title: "Tebak Kata Sakura Selesai! 🌸",
      subtitle: sakuraState.deck.title,
      scoreText: `${sakuraState.score}`,
      statsText: "Total skor penguasaan istilah SMA",
      historyMode: "Tebak Kata Sakura",
      deckTitle: sakuraState.deck.title,
      historyDetail: "Selesai",
      historyScoreDisplay: `${sakuraState.score} Poin`
    });
  }
}

// =========================================================================
// 12. GAME 6: QUIZ RUNNER (4 JALUR)
// =========================================================================
let runState = {};
function startQuizRunnerGame(deck) {
  runState = { deck, questions: [...deck.questions].sort(() => Math.random() - 0.5), qIndex: 0, lane: 0, lives: 3, score: 0, gateY: 0 };
  navigateTo('game-runner');
  setRunnerLane(0);
  setupRunnerRound();
}

function setRunnerLane(laneIdx) {
  runState.lane = laneIdx;
  for (let i = 0; i < 4; i++) {
    document.getElementById(`runner-char-${i}`).classList.toggle('hidden', i !== laneIdx);
  }
}

function setupRunnerRound() {
  clearAllIntervals();
  const qObj = runState.questions[runState.qIndex];
  runState.gateY = 0;

  document.getElementById('run-lives').innerText = '❤️'.repeat(runState.lives);
  document.getElementById('run-score').innerText = `Skor: ${runState.score}`;
  document.getElementById('run-q-badge').innerText = `Soal ${runState.qIndex + 1} / ${runState.questions.length} • Pilih Jalur!`;

  const imgBox = document.getElementById('run-question-image-box');
  if (qObj.image) { document.getElementById('run-question-image').src = qObj.image; imgBox.classList.remove('hidden'); }
  else { imgBox.classList.add('hidden'); }
  document.getElementById('run-question-text').innerText = qObj.q;

  const labels = ['A', 'B', 'C', 'D'];
  const gatesRow = document.getElementById('run-gates-row');
  gatesRow.style.transform = `translateY(0px)`;
  gatesRow.innerHTML = qObj.options.map((opt, idx) => `
    <div onclick="setRunnerLane(${idx})" class="bg-white border-2 border-emerald-400 rounded-2xl p-2 text-center shadow-sm cursor-pointer">
      <span class="inline-block w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold mb-0.5">${labels[idx]}</span>
      <p class="text-[10px] font-bold text-gray-800 line-clamp-2 leading-tight">${opt}</p>
    </div>
  `).join('');

  runnerLoop = setInterval(() => {
    runState.gateY += 4.5;
    gatesRow.style.transform = `translateY(${runState.gateY}px)`;

    if (runState.gateY >= 195) {
      clearAllIntervals();
      if (runState.lane === qObj.correct) {
        playSound('correct');
        runState.score += 100;
        showToast("Lolos melewati gerbang benar! +100 🐰✨", "success");
      } else {
        playSound('wrong');
        runState.lives--;
        showToast(`Menabrak rintangan! Jawaban benar: ${labels[qObj.correct]} 💥`, "error");
      }

      setTimeout(() => {
        if (runState.lives <= 0) {
          return showFinalResult({
            title: "Pelari Kehabisan Nyawa! 🐰💫",
            subtitle: `Quiz Runner • ${runState.deck.title}`,
            scoreText: `${runState.score}`,
            statsText: "Terus latih refleks menjawabmu!",
            historyMode: "Quiz Runner",
            deckTitle: runState.deck.title,
            historyDetail: "Game Over",
            historyScoreDisplay: `${runState.score} Poin`
          });
        }
        runState.qIndex++;
        if (runState.qIndex < runState.questions.length) {
          setupRunnerRound();
        } else {
          showFinalResult({
            title: "Garis Finish Tercapai! 🏁🎉",
            subtitle: `Quiz Runner • ${runState.deck.title}`,
            scoreText: `${runState.score}`,
            statsText: `Berhasil melewati semua rintangan dengan ${runState.lives} nyawa!`,
            historyMode: "Quiz Runner",
            deckTitle: runState.deck.title,
            historyDetail: "Finish",
            historyScoreDisplay: `${runState.score} Poin`
          });
        }
      }, 800);
    }
  }, 120);
}

// =========================================================================
// 13. LIVE CLASS ARENA (PEERJS + BROADCASTCHANNEL FALLBACK)
// =========================================================================
let livePeer = null;
let liveChannel = null;
let hostConnections = {};
let hostStudents = {};
let hostDeck = null;
let hostStarted = false;
let hostPin = "";
let studentConn = null;
let studentLiveState = {};

function cleanupLiveConnections() {
  if (livePeer) {
    try { livePeer.destroy(); } catch (e) {}
    livePeer = null;
  }
  if (liveChannel) {
    try { liveChannel.close(); } catch (e) {}
    liveChannel = null;
  }
  studentConn = null;
}

function setupHostBroadcastFallback(pin, btn) {
  cleanupLiveConnections();
  liveChannel = new BroadcastChannel(`achievquiz-live-${pin}`);
  liveChannel.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'JOIN') {
      hostStudents[data.studentId] = { name: data.name, score: 0, progress: 0, finished: false };
      renderHostLeaderboard();
      playSound('click');
      liveChannel.postMessage({ type: 'JOIN_ACK', studentId: data.studentId });
      if (hostStarted) {
        liveChannel.postMessage({ type: 'START', deck: hostDeck });
      }
    } else if (data.type === 'UPDATE' && hostStudents[data.studentId]) {
      hostStudents[data.studentId].score = data.score;
      hostStudents[data.studentId].progress = data.progress;
      hostStudents[data.studentId].finished = data.finished;
      renderHostLeaderboard();
    }
  };

  btn.disabled = false;
  btn.innerText = "Buat PIN Ruangan";
  document.getElementById('host-room-pin').innerText = pin;
  document.getElementById('host-deck-title').innerText = `${hostDeck.title} (${hostDeck.questions.length} Soal) • Mode Tab Lokal`;
  document.getElementById('host-match-status').innerText = "Menunggu Siswa...";
  document.getElementById('btn-start-live-match').classList.remove('hidden');
  renderHostLeaderboard();
  navigateTo('live-host');
  playSound('win');
  showToast("Mode Preview Lokal aktif: buka tab baru untuk gabung pakai PIN! 💡", "info");
}

function createLiveRoom() {
  const deckId = document.getElementById('live-host-deck').value;
  hostDeck = decks.find(d => d.id === deckId);
  if (!hostDeck) return showToast("Pilih paket soal terlebih dahulu!", "error");

  const btn = document.getElementById('btn-create-live');
  btn.disabled = true;
  btn.innerText = "Membuat Ruangan...";
  hostPin = Math.floor(100000 + Math.random() * 900000).toString();
  cleanupLiveConnections();
  hostConnections = {};
  hostStudents = {};
  hostStarted = false;

  if (typeof Peer === 'undefined') {
    return setupHostBroadcastFallback(hostPin, btn);
  }

  try {
    livePeer = new Peer(`achievquiz-room-${hostPin}`);

    livePeer.on('open', () => {
      btn.disabled = false;
      btn.innerText = "Buat PIN Ruangan";
      document.getElementById('host-room-pin').innerText = hostPin;
      document.getElementById('host-deck-title').innerText = `${hostDeck.title} (${hostDeck.questions.length} Soal)`;
      document.getElementById('host-match-status').innerText = "Menunggu Siswa...";
      document.getElementById('btn-start-live-match').classList.remove('hidden');
      renderHostLeaderboard();
      navigateTo('live-host');
      playSound('win');
    });

    livePeer.on('connection', (conn) => {
      hostConnections[conn.peer] = conn;
      conn.on('data', (data) => {
        if (data.type === 'JOIN') {
          hostStudents[conn.peer] = { name: data.name, score: 0, progress: 0, finished: false };
          renderHostLeaderboard();
          playSound('click');
          if (hostStarted) conn.send({ type: 'START', deck: hostDeck });
        } else if (data.type === 'UPDATE' && hostStudents[conn.peer]) {
          hostStudents[conn.peer].score = data.score;
          hostStudents[conn.peer].progress = data.progress;
          hostStudents[conn.peer].finished = data.finished;
          renderHostLeaderboard();
        }
      });
    });

    livePeer.on('error', () => {
      setupHostBroadcastFallback(hostPin, btn);
    });
  } catch (err) {
    setupHostBroadcastFallback(hostPin, btn);
  }
}

function hostStartMatch() {
  if (Object.keys(hostStudents).length === 0) return showToast("Belum ada siswa yang bergabung!", "error");
  hostStarted = true;
  document.getElementById('host-match-status').innerText = "Sedang Berlangsung 🔥";
  document.getElementById('btn-start-live-match').classList.add('hidden');
  playSound('win');

  if (liveChannel) {
    liveChannel.postMessage({ type: 'START', deck: hostDeck });
  }
  Object.values(hostConnections).forEach(conn => {
    if (conn.open) conn.send({ type: 'START', deck: hostDeck });
  });
}

function renderHostLeaderboard() {
  const list = Object.values(hostStudents).sort((a, b) => b.score - a.score);
  document.getElementById('host-player-count').innerText = list.length;
  const container = document.getElementById('host-players-list');
  if (list.length === 0) {
    container.innerHTML = `<p class="text-xs text-gray-400 text-center py-6">Bagikan PIN di atas ke siswa!</p>`;
    return;
  }
  const medals = ['🥇', '🥈', '🥉'];
  const totalQ = hostDeck ? hostDeck.questions.length : 1;
  container.innerHTML = list.map((s, idx) => `
    <div class="flex items-center justify-between p-3 rounded-2xl bg-pink-50/60 border border-pink-100">
      <div class="flex items-center gap-3">
        <span class="font-bold text-sm w-6 text-center">${medals[idx] || `#${idx + 1}`}</span>
        <div>
          <span class="font-bold text-sm text-gray-800 block">${s.name}</span>
          <span class="text-[11px] text-gray-500">${s.finished ? '✅ Selesai' : `Soal ${s.progress}/${totalQ}`}</span>
        </div>
      </div>
      <span class="font-extrabold text-sm text-fuchsia-600 bg-white px-3 py-1 rounded-xl border border-fuchsia-100">${s.score} Poin</span>
    </div>
  `).join('');
}

function closeLiveRoom() {
  cleanupLiveConnections();
  navigateTo('home');
}

function setupStudentBroadcastFallback(name, pin, btn) {
  cleanupLiveConnections();
  const studentId = 'stu-' + Math.random().toString(36).slice(2, 9);
  studentLiveState = { studentId, playerName: name };
  liveChannel = new BroadcastChannel(`achievquiz-live-${pin}`);

  liveChannel.onmessage = (event) => {
    const data = event.data;
    if (data.type === 'START') {
      studentLiveState = {
        ...studentLiveState,
        deck: data.deck,
        questions: [...data.deck.questions].sort(() => Math.random() - 0.5),
        qIndex: 0,
        score: 0,
        locked: false
      };
      document.getElementById('student-waiting-box').classList.add('hidden');
      document.getElementById('student-play-box').classList.remove('hidden');
      renderStudentLiveQuestion();
    }
  };

  liveChannel.postMessage({ type: 'JOIN', studentId, name });
  btn.disabled = false;
  btn.innerText = "Masuk ke Kelas";
  document.getElementById('student-live-name').innerText = name;
  document.getElementById('student-waiting-box').classList.remove('hidden');
  document.getElementById('student-play-box').classList.add('hidden');
  navigateTo('live-student');
}

function joinLiveRoom() {
  const name = document.getElementById('live-join-name').value.trim();
  const pin = document.getElementById('live-join-pin').value.trim();
  if (!name || pin.length !== 6) return showToast("Isi nama dan 6 digit PIN ruangan!", "error");

  const btn = document.getElementById('btn-join-live');
  btn.disabled = true;
  btn.innerText = "Menghubungkan...";
  cleanupLiveConnections();

  if (typeof Peer === 'undefined') {
    return setupStudentBroadcastFallback(name, pin, btn);
  }

  try {
    livePeer = new Peer();

    livePeer.on('open', () => {
      studentConn = livePeer.connect(`achievquiz-room-${pin}`);
      studentConn.on('open', () => {
        btn.disabled = false;
        btn.innerText = "Masuk ke Kelas";
        studentConn.send({ type: 'JOIN', name });
        document.getElementById('student-live-name').innerText = name;
        document.getElementById('student-waiting-box').classList.remove('hidden');
        document.getElementById('student-play-box').classList.add('hidden');
        navigateTo('live-student');
      });
      studentConn.on('data', (data) => {
        if (data.type === 'START') {
          studentLiveState = {
            deck: data.deck,
            playerName: name,
            questions: [...data.deck.questions].sort(() => Math.random() - 0.5),
            qIndex: 0,
            score: 0,
            locked: false
          };
          document.getElementById('student-waiting-box').classList.add('hidden');
          document.getElementById('student-play-box').classList.remove('hidden');
          renderStudentLiveQuestion();
        }
      });
    });

    livePeer.on('error', () => {
      setupStudentBroadcastFallback(name, pin, btn);
    });
  } catch (err) {
    setupStudentBroadcastFallback(name, pin, btn);
  }
}

function renderStudentLiveQuestion() {
  studentLiveState.locked = false;
  const qObj = studentLiveState.questions[studentLiveState.qIndex];
  const total = studentLiveState.questions.length;
  document.getElementById('live-q-progress').innerText = `Soal ${studentLiveState.qIndex + 1} / ${total}`;
  document.getElementById('live-q-bar').style.width = `${((studentLiveState.qIndex + 1) / total) * 100}%`;
  document.getElementById('live-my-score').innerText = studentLiveState.score;

  const imgBox = document.getElementById('live-q-image-box');
  if (qObj.image) { document.getElementById('live-q-image').src = qObj.image; imgBox.classList.remove('hidden'); }
  else { imgBox.classList.add('hidden'); }
  document.getElementById('live-q-text').innerText = qObj.q;

  const labels = ['A', 'B', 'C', 'D'];
  document.getElementById('live-q-options').innerHTML = qObj.options.map((opt, idx) => {
    const optImg = qObj.optionImages && qObj.optionImages[idx];
    return `
      <button onclick="answerStudentLive(${idx})" id="live-opt-${idx}" class="w-full text-left p-4 rounded-2xl border-2 border-pink-100 hover:border-fuchsia-400 bg-pink-50/30 font-semibold text-sm text-gray-800 flex items-center gap-3">
        <span class="w-7 h-7 rounded-lg bg-white border border-pink-200 text-fuchsia-600 font-bold flex items-center justify-center shrink-0">${labels[idx]}</span>
        <div class="flex flex-col gap-1">
          ${optImg ? `<img src="${optImg}" class="max-h-20 rounded-lg border border-pink-100 object-contain bg-white p-1">` : ''}
          <span>${opt}</span>
        </div>
      </button>
    `;
  }).join('');
}

function answerStudentLive(optIdx) {
  if (studentLiveState.locked) return;
  studentLiveState.locked = true;
  const qObj = studentLiveState.questions[studentLiveState.qIndex];
  const isCorrect = optIdx === qObj.correct;

  if (isCorrect) {
    playSound('correct');
    studentLiveState.score += 120;
    document.getElementById(`live-opt-${optIdx}`).className = "w-full text-left p-4 rounded-2xl border-2 border-teal-500 bg-teal-50 text-teal-800 font-bold flex items-center gap-3 text-sm";
  } else {
    playSound('wrong');
    document.getElementById(`live-opt-${optIdx}`).className = "w-full text-left p-4 rounded-2xl border-2 border-rose-500 bg-rose-50 text-rose-800 font-bold flex items-center gap-3 text-sm";
  }

  document.getElementById('live-my-score').innerText = studentLiveState.score;
  const nextIdx = studentLiveState.qIndex + 1;
  const isFinished = nextIdx >= studentLiveState.questions.length;

  if (studentConn && studentConn.open) {
    studentConn.send({ type: 'UPDATE', score: studentLiveState.score, progress: nextIdx, finished: isFinished });
  } else if (liveChannel) {
    liveChannel.postMessage({
      type: 'UPDATE',
      studentId: studentLiveState.studentId,
      score: studentLiveState.score,
      progress: nextIdx,
      finished: isFinished
    });
  }

  setTimeout(() => {
    studentLiveState.qIndex = nextIdx;
    if (!isFinished) renderStudentLiveQuestion();
    else {
      showFinalResult({
        title: `Selesai, ${studentLiveState.playerName}! 🎉`,
        subtitle: `Live Class Arena • Lihat peringkatmu di layar guru!`,
        scoreText: `${studentLiveState.score}`,
        statsText: "Total Poin Live Class",
        historyMode: "Live Class Arena",
        deckTitle: studentLiveState.deck.title,
        historyDetail: studentLiveState.playerName,
        historyScoreDisplay: `${studentLiveState.score} Poin`
      });
    }
  }, 750);
}

function leaveLiveStudent() {
  cleanupLiveConnections();
  navigateTo('home');
}

window.onload = loadAppData;
