// =============================================
//  BLOOMIND — script.js
//  All data stored in localStorage (no backend)
// =============================================

// ---- CONSTANTS ----
const HABITS = [
  { id: 'morning',  label: '🌅 Morning Routine'          },
  { id: 'workout',  label: '🥋 Workout / Karate'          },
  { id: 'protein',  label: '🥩 Protein-Rich Meals'        },
  { id: 'water',    label: '💧 2.5–3L Water'               },
  { id: 'skincare', label: '✨ Skincare'                    },
  { id: 'aistudy',  label: '🤖 AI Study (1 hour)'          },
  { id: 'reading',  label: '📖 Reading (10 pages)'         },
  { id: 'journal',  label: '📓 Journal Entry'              },
  { id: 'bedtime',  label: '🌙 Sleep before', extra: true, placeholder: '10:30 PM' },
];

const MOODS = ['','😫 Terrible','😞 Bad','😕 Low','😐 Meh','🙂 Okay','😊 Good','😄 Great','🤩 Amazing','🔥 Excellent','🚀 On Fire!'];

const MISSIONS = [
  { id: 'karate', label: '🥋 Karate'          },
  { id: 'aiml',   label: '🤖 AI/ML'            },
  { id: 'health', label: '🌿 Health/Personal'  },
];

// ---- HELPERS ----
function getUser()         { return localStorage.getItem('bm_user'); }
function getUsers()        { return JSON.parse(localStorage.getItem('bm_users') || '{}'); }
function saveUsers(u)      { localStorage.setItem('bm_users', JSON.stringify(u)); }
function entryKey(date)    { return `bm_entry_${getUser()}_${date}`; }
function getEntry(date)    { return JSON.parse(localStorage.getItem(entryKey(date)) || 'null'); }
function saveEntry(date,d) { localStorage.setItem(entryKey(date), JSON.stringify(d)); }
function delEntry(date)    { localStorage.removeItem(entryKey(date)); }

function today() { return new Date().toISOString().split('T')[0]; }
function isSunday(d) { return d ? new Date(d + 'T00:00:00').getDay() === 0 : false; }

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

function showAlert(id, msg, isSuccess = false) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'alert' + (isSuccess ? ' success' : '');
  el.style.display = 'block';
  setTimeout(() => (el.style.display = 'none'), 3500);
}

// ---- THEME ----
function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = dark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('bm_theme', next);
  refreshThemeUI(next);
}

function refreshThemeUI(t) {
  const dark = t === 'dark';
  const floatBtn = document.getElementById('loginThemeBtn');
  if (floatBtn) floatBtn.textContent = dark ? '☀️ Light' : '🌙 Dark';
  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  if (icon) icon.textContent = dark ? '☀️' : '🌙';
  if (text) text.textContent = dark ? 'Light Mode' : 'Dark Mode';
}

// ---- AUTH ----
function switchTab(tab) {
  ['signin','register'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
    document.getElementById('body-' + t).classList.toggle('active', t === tab);
  });
}

function signIn() {
  const username = document.getElementById('signin-username').value.trim();
  const password = document.getElementById('signin-password').value;
  if (!username || !password) return showAlert('signin-alert', 'Please fill in all fields.');
  const users = getUsers();
  if (!users[username] || users[username].password !== btoa(password))
    return showAlert('signin-alert', 'Invalid username or password.');
  localStorage.setItem('bm_user', username);
  enterApp();
}

function register() {
  const name     = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim();
  const password = document.getElementById('reg-password').value;
  if (!name || !username || !password) return showAlert('register-alert', 'Please fill in all fields.');
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return showAlert('register-alert', 'Username: 3–20 chars, letters/numbers/underscore only.');
  if (password.length < 6) return showAlert('register-alert', 'Password must be at least 6 characters.');
  const users = getUsers();
  if (users[username]) return showAlert('register-alert', 'Username already taken.');
  users[username] = { name, password: btoa(password), created: today() };
  saveUsers(users);
  localStorage.setItem('bm_user', username);
  enterApp();
}

function demoLogin() {
  const users = getUsers();
  if (!users['demo']) {
    users['demo'] = { name: 'Demo User', password: btoa('demo123'), created: today() };
    saveUsers(users);
  }
  localStorage.setItem('bm_user', 'demo');
  enterApp();
}

function logout() {
  localStorage.removeItem('bm_user');
  document.getElementById('page-app').classList.remove('active');
  document.getElementById('page-login').classList.add('active');
  document.getElementById('loginThemeBtn').style.display = '';
}

// ---- APP ENTRY ----
function enterApp() {
  document.getElementById('page-login').classList.remove('active');
  document.getElementById('page-app').classList.add('active');
  document.getElementById('loginThemeBtn').style.display = 'none';

  const users = getUsers();
  const u     = getUser();
  const name  = users[u] ? users[u].name : u;

  document.getElementById('userName').textContent   = name;
  document.getElementById('userHandle').textContent = '@' + u;
  document.getElementById('topbarDate').textContent =
    new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  updateAvatar(document.getElementById('userAvatar'), users[u]);
  showSection('journal');
}

function updateAvatar(el, userObj) {
  if (userObj && userObj.avatar) {
    el.innerHTML = `<img src="${userObj.avatar}" alt="avatar" onerror="this.parentElement.textContent='${(userObj.name||'?')[0].toUpperCase()}'">`;
  } else {
    el.textContent = userObj ? (userObj.name || '?')[0].toUpperCase() : '?';
  }
}

// ---- NAVIGATION ----
function showSection(name) {
  ['journal','dashboard','profile'].forEach(s => {
    document.getElementById('section-' + s).classList.toggle('active', s === name);
    document.getElementById('nav-' + s).classList.toggle('active', s === name);
  });
  const titles = { journal: 'Journal', dashboard: 'Dashboard', profile: 'Profile' };
  document.getElementById('topbarTitle').textContent = titles[name];
  closeSidebar();
  if (name === 'journal')   initJournal();
  if (name === 'dashboard') initDashboard();
  if (name === 'profile')   initProfile();
}

function openSidebar()  { document.getElementById('sidebar').classList.add('open'); document.getElementById('overlay').classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('overlay').classList.remove('open'); }

// ---- JOURNAL ----
function onMoodChange(v) {
  document.getElementById('moodPill').textContent = v;
  document.getElementById('moodText').textContent = v + ' / ' + (MOODS[+v] || '');
}

function buildHabitList() {
  const list = document.getElementById('habitList');
  list.innerHTML = '';
  HABITS.forEach(h => {
    const div = document.createElement('div');
    div.className  = 'check-item';
    div.dataset.id = h.id;
    div.innerHTML  =
      `<input type="checkbox" class="check">` +
      `<span class="check-label">${h.label}</span>` +
      (h.extra ? `<input type="text" class="note-input" placeholder="${h.placeholder}" onclick="event.stopPropagation()">` : '');
    div.querySelector('.check').addEventListener('change', () => {
      div.classList.toggle('done', div.querySelector('.check').checked);
      updateProgress();
    });
    div.addEventListener('click', e => {
      if (e.target.tagName === 'INPUT') return;
      const cb = div.querySelector('.check');
      cb.checked = !cb.checked;
      div.classList.toggle('done', cb.checked);
      updateProgress();
    });
    list.appendChild(div);
  });
  updateProgress();
}

function tickMission(cb) { cb.closest('.check-item').classList.toggle('done', cb.checked); }

function updateProgress() {
  const all  = document.querySelectorAll('#habitList .check');
  const done = document.querySelectorAll('#habitList .check:checked').length;
  const pct  = Math.round((done / all.length) * 100);
  document.getElementById('progressCount').textContent = `${done} / ${all.length}`;
  document.getElementById('progressFill').style.width  = pct + '%';
  document.getElementById('progressPct').textContent   = pct + '% done';
}

function initJournal() {
  const dateInput = document.getElementById('entryDate');
  if (!dateInput.value) dateInput.value = today();
  document.getElementById('sundayTag').style.display = isSunday(dateInput.value) ? '' : 'none';
  buildHabitList();
  loadJournalEntry(dateInput.value);
  updateStreakBanner();
  dateInput.onchange = function () {
    document.getElementById('sundayTag').style.display = isSunday(this.value) ? '' : 'none';
    loadJournalEntry(this.value);
  };
}

function onDateChange() {
  const v = document.getElementById('entryDate').value;
  document.getElementById('sundayTag').style.display = isSunday(v) ? '' : 'none';
  loadJournalEntry(v);
}

function resetJournalForm() {
  document.getElementById('moodSlider').value = 7; onMoodChange(7);
  document.getElementById('sleepInput').value  = '';
  document.getElementById('weightInput').value = '';
  document.querySelectorAll('#missionList .check-item').forEach(m => {
    m.querySelector('.check').checked = false;
    m.querySelector('.note-input').value = '';
    m.classList.remove('done');
  });
  buildHabitList();
}

function loadJournalEntry(date) {
  resetJournalForm();
  const d = getEntry(date);
  if (!d) return;
  if (d.mood)   { document.getElementById('moodSlider').value = d.mood; onMoodChange(d.mood); }
  if (d.sleep)   document.getElementById('sleepInput').value  = d.sleep;
  if (d.weight)  document.getElementById('weightInput').value = d.weight;
  if (d.missions) {
    document.querySelectorAll('#missionList .check-item').forEach(m => {
      const s = d.missions[m.dataset.id];
      if (s) { m.querySelector('.check').checked = s.done; m.querySelector('.note-input').value = s.notes || ''; m.classList.toggle('done', s.done); }
    });
  }
  if (d.habits) {
    document.querySelectorAll('#habitList .check-item').forEach(h => {
      const s = d.habits[h.dataset.id];
      if (s) {
        h.querySelector('.check').checked = s.done;
        h.classList.toggle('done', s.done);
        const ex = h.querySelector('.note-input');
        if (ex && s.extra) ex.value = s.extra;
      }
    });
  }
  updateProgress();
}

function saveJournal() {
  const date = document.getElementById('entryDate').value;
  const missions = {}, habits = {};
  document.querySelectorAll('#missionList .check-item').forEach(m => {
    missions[m.dataset.id] = { done: m.querySelector('.check').checked, notes: m.querySelector('.note-input').value };
  });
  document.querySelectorAll('#habitList .check-item').forEach(h => {
    const ex = h.querySelector('.note-input');
    habits[h.dataset.id] = { done: h.querySelector('.check').checked, extra: ex ? ex.value : null };
  });
  saveEntry(date, {
    date,
    mood:   +document.getElementById('moodSlider').value || null,
    sleep:  +document.getElementById('sleepInput').value  || null,
    weight: +document.getElementById('weightInput').value || null,
    missions, habits,
  });
  updateStreakBanner();
  const done = document.querySelectorAll('#habitList .check:checked').length;
  if (done >= 9) { showToast('🎉 Perfect day! All habits done!'); launchConfetti(); }
  else showToast('✅ Entry saved!');
}

function launchConfetti() {
  const colors = ['#8b3cf7','#f472b6','#fb923c','#38bdf8','#4ade80','#facc15'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 8 + 5;
    el.style.cssText = `
      position:fixed; top:${Math.random()*30}%; left:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>0.5?'50%':'3px'};
      pointer-events:none; z-index:9998;
      animation: confettiFall ${1.2+Math.random()*1.5}s ease-out forwards;
      transform: rotate(${Math.random()*360}deg);
      opacity: 1;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
  if (!document.getElementById('confettiStyle')) {
    const s = document.createElement('style');
    s.id = 'confettiStyle';
    s.textContent = `@keyframes confettiFall {
      0%   { transform: translateY(0) rotate(0deg); opacity:1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity:0; }
    }`;
    document.head.appendChild(s);
  }
}

function clearJournal() {
  if (!confirm('Clear this entry?')) return;
  delEntry(document.getElementById('entryDate').value);
  resetJournalForm();
  showToast('🗑 Cleared.');
}

function updateStreakBanner() {
  document.getElementById('streakNum').textContent = calcStreak();
}

function calcStreak() {
  let streak = 0;
  const base = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(base); d.setDate(d.getDate() - i);
    if (getEntry(d.toISOString().split('T')[0])) streak++;
    else break;
  }
  return streak;
}

function getAllEntries() {
  const result = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(`bm_entry_${getUser()}_`)) {
      try { result.push(JSON.parse(localStorage.getItem(k))); } catch {}
    }
  }
  return result.sort((a, b) => b.date.localeCompare(a.date));
}

// ---- DASHBOARD ----
let allEntries = [], histFilter = 'all', histPage = 1;
const PER_PAGE = 7;

function initDashboard() {
  allEntries = getAllEntries();
  const moods  = allEntries.map(e => e.mood).filter(Boolean);
  const sleeps = allEntries.map(e => e.sleep).filter(Boolean);
  const streak = calcStreak();

  document.getElementById('st-streak').textContent = streak;
  document.getElementById('st-days').textContent   = allEntries.length;
  document.getElementById('st-mood').textContent   = moods.length  ? (moods.reduce((a,b) => a+b,0)/moods.length).toFixed(1)  : '—';
  document.getElementById('st-sleep').textContent  = sleeps.length ? (sleeps.reduce((a,b) => a+b,0)/sleeps.length).toFixed(1)+'h' : '—';

  buildMoodChart();
  buildHabitChart();
  renderHistory();
}

function buildMoodChart() {
  const chart  = document.getElementById('moodChart');
  const labels = document.getElementById('chartLabels');
  chart.innerHTML = labels.innerHTML = '';
  const base = new Date();
  for (let i = 13; i >= 0; i--) {
    const d    = new Date(base); d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const e    = allEntries.find(x => x.date === dStr);
    const mood = e ? e.mood : null;
    const col  = document.createElement('div'); col.className = 'chart-col';
    const bar  = document.createElement('div');
    bar.className   = 'chart-bar' + (mood ? '' : ' empty');
    bar.style.height = mood ? (mood / 10 * 100) + '%' : '5px';
    bar.innerHTML   = `<div class="chart-bar-tip">${mood ? 'Mood ' + mood : 'No entry'} · ${d.toLocaleDateString('en',{month:'short',day:'numeric'})}</div>`;
    col.appendChild(bar); chart.appendChild(col);
    const lbl = document.createElement('div'); lbl.className = 'chart-lbl';
    lbl.textContent = d.getDate(); labels.appendChild(lbl);
  }
}

function buildHabitChart() {
  const range = document.getElementById('habitRangeSelect').value;
  const base  = new Date();
  const data  = range === 'all' ? allEntries : allEntries.filter(e => (base - new Date(e.date + 'T00:00:00')) / 864e5 <= +range);
  const body  = document.getElementById('habitChartBody');
  body.innerHTML = '';
  if (!data.length) { body.innerHTML = '<div class="empty-msg">No data for this range.</div>'; return; }
  HABITS.forEach(h => {
    const done = data.filter(e => e.habits && e.habits[h.id] && e.habits[h.id].done).length;
    const pct  = Math.round((done / data.length) * 100);
    const row  = document.createElement('div'); row.className = 'habit-bar-row';
    row.innerHTML = `<div class="hb-name">${h.label}</div><div class="hb-track"><div class="hb-fill" style="width:${pct}%"></div></div><div class="hb-pct">${pct}%</div>`;
    body.appendChild(row);
  });
}

function setFilter(mode, btn) {
  histFilter = mode; histPage = 1;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory();
}

function getFiltered() {
  const base = new Date();
  if (histFilter === '7')       return allEntries.filter(e => (base - new Date(e.date + 'T00:00:00')) / 864e5 <= 7);
  if (histFilter === '30')      return allEntries.filter(e => (base - new Date(e.date + 'T00:00:00')) / 864e5 <= 30);
  if (histFilter === 'perfect') return allEntries.filter(e => e.habits && Object.values(e.habits).every(h => h.done));
  return allEntries;
}

function renderHistory() {
  const filtered = getFiltered();
  const list = document.getElementById('historyCards');
  const pag  = document.getElementById('pagination');
  list.innerHTML = pag.innerHTML = '';
  if (!filtered.length) { list.innerHTML = '<div class="empty-msg">No entries found.</div>'; return; }

  const pages  = Math.ceil(filtered.length / PER_PAGE);
  const slice  = filtered.slice((histPage-1)*PER_PAGE, histPage*PER_PAGE);
  const todayS = today();

  slice.forEach(e => {
    const total = Object.keys(e.habits || {}).length || 9;
    const done  = Object.values(e.habits || {}).filter(h => h.done).length;
    const pct   = Math.round((done / total) * 100);
    const card  = document.createElement('div'); card.className = 'history-card';
    const mTags = MISSIONS.map(m => {
      const ok = e.missions && e.missions[m.id] && e.missions[m.id].done;
      return `<span class="hm-tag ${ok ? 'done' : 'miss'}">${m.label}${ok ? ' ✓' : ''}</span>`;
    }).join('');
    card.innerHTML =
      `<div class="hc-top">` +
        `<div class="hc-date">${new Date(e.date+'T00:00:00').toLocaleDateString('en',{weekday:'short',month:'short',day:'numeric',year:'numeric'})}` +
        `${e.date===todayS?'<span class="hc-today">Today</span>':''}</div>` +
        `<div class="hc-pills">` +
          (e.mood  ? `<span class="hc-pill mood">🌤 ${e.mood}/10</span>` : '') +
          (e.sleep ? `<span class="hc-pill sleep">😴 ${e.sleep}h</span>` : '') +
          `<span class="hc-pill habit ${pct<50?'low':''}">💪 ${done}/${total}</span>` +
        `</div></div>` +
      `<div class="hc-missions">${mTags}</div>`;
    card.addEventListener('click', () => {
      document.getElementById('entryDate').value = e.date;
      showSection('journal');
    });
    list.appendChild(card);
  });

  if (pages > 1) {
    const prev = document.createElement('button'); prev.className = 'pg-btn'; prev.textContent = '←'; prev.disabled = histPage === 1;
    prev.onclick = () => { histPage--; renderHistory(); }; pag.appendChild(prev);
    for (let i = 1; i <= pages; i++) {
      const b = document.createElement('button'); b.className = 'pg-btn' + (i===histPage?' active':''); b.textContent = i;
      b.onclick = (pg => () => { histPage = pg; renderHistory(); })(i); pag.appendChild(b);
    }
    const next = document.createElement('button'); next.className = 'pg-btn'; next.textContent = '→'; next.disabled = histPage === pages;
    next.onclick = () => { histPage++; renderHistory(); }; pag.appendChild(next);
  }
}

// ---- PROFILE ----
function initProfile() {
  const users = getUsers();
  const u     = getUser();
  const user  = users[u] || {};
  const moods  = getAllEntries().map(e => e.mood).filter(Boolean);
  const sleeps = getAllEntries().map(e => e.sleep).filter(Boolean);
  const streak = calcStreak();
  const total  = getAllEntries().length;

  document.getElementById('profileName').textContent = user.name || u;
  document.getElementById('profileMeta').textContent =
    `@${u} · Member since ${new Date(user.created || Date.now()).toLocaleDateString('en',{month:'long',year:'numeric'})}`;
  updateAvatar(document.getElementById('profilePic'), user);

  document.getElementById('pf-name').value     = user.name     || '';
  document.getElementById('pf-username').value = u;
  document.getElementById('pf-bio').value      = user.bio      || '';
  document.getElementById('pf-avatar').value   = user.avatar   || '';

  document.getElementById('pf-streak').textContent = streak;
  document.getElementById('pf-days').textContent   = total;
  document.getElementById('pf-mood').textContent   = moods.length  ? (moods.reduce((a,b)=>a+b,0)/moods.length).toFixed(1)  : '—';
  document.getElementById('pf-sleep').textContent  = sleeps.length ? (sleeps.reduce((a,b)=>a+b,0)/sleeps.length).toFixed(1)+'h' : '—';
}

function saveProfile() {
  const name   = document.getElementById('pf-name').value.trim();
  const bio    = document.getElementById('pf-bio').value.trim();
  const avatar = document.getElementById('pf-avatar').value.trim();
  if (!name) return showAlert('profile-alert', 'Name cannot be empty.');
  const users = getUsers(); const u = getUser();
  users[u] = { ...users[u], name, bio, avatar };
  saveUsers(users);
  document.getElementById('userName').textContent = name;
  updateAvatar(document.getElementById('userAvatar'), users[u]);
  updateAvatar(document.getElementById('profilePic'), users[u]);
  document.getElementById('profileName').textContent = name;
  showAlert('profile-ok', '✅ Profile saved!', true);
}

function changePassword() {
  const oldPw = document.getElementById('pw-old').value;
  const newPw = document.getElementById('pw-new').value;
  const conf  = document.getElementById('pw-new2').value;
  if (!oldPw || !newPw || !conf) return showAlert('pw-alert', 'Please fill in all fields.');
  if (newPw !== conf) return showAlert('pw-alert', 'New passwords do not match.');
  if (newPw.length < 6) return showAlert('pw-alert', 'New password must be at least 6 characters.');
  const users = getUsers(); const u = getUser();
  if (users[u].password !== btoa(oldPw)) return showAlert('pw-alert', 'Current password is incorrect.');
  users[u].password = btoa(newPw);
  saveUsers(users);
  document.getElementById('pw-old').value = document.getElementById('pw-new').value = document.getElementById('pw-new2').value = '';
  showAlert('pw-ok', '✅ Password updated!', true);
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  const theme = localStorage.getItem('bm_theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  refreshThemeUI(theme);

  // Auto-login if session exists
  if (getUser()) {
    enterApp();
  }

  // Enter key on login
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' || !document.getElementById('page-login').classList.contains('active')) return;
    if (document.getElementById('body-signin').classList.contains('active')) signIn();
    else register();
  });
});
