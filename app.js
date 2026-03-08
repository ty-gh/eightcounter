const COUNTER_COUNT = 8;
const STORAGE_KEY = 'eightCounterData';

// カウンターデータ（メモリキャッシュ）
let counters = loadFromStorage();

// ストップウォッチ状態
const stopwatch = {
  elapsed: 0,
  startTime: 0,
  running: false,
  intervalId: null,
  els: {},
};

function loadFromStorage() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return Array.from({ length: COUNTER_COUNT }, (_, i) => ({
    name: `カウンター${i + 1}`,
    value: 0,
  }));
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counters));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ── ストップウォッチ ──

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateStopwatchDisplay() {
  const { els, running, elapsed, startTime } = stopwatch;
  if (!els.display) return;
  const current = running ? elapsed + (Date.now() - startTime) : elapsed;
  els.display.textContent = formatTime(current);
}

function toggleStopwatch() {
  const sw = stopwatch;
  const btn = sw.els.toggle;
  if (sw.running) {
    sw.elapsed += Date.now() - sw.startTime;
    sw.running = false;
    clearInterval(sw.intervalId);
    sw.intervalId = null;
    btn.classList.replace('sw-stop', 'sw-start');
  } else {
    sw.startTime = Date.now();
    sw.running = true;
    sw.intervalId = setInterval(updateStopwatchDisplay, 500);
    btn.classList.replace('sw-start', 'sw-stop');
  }
}

function resetStopwatch() {
  const sw = stopwatch;
  sw.running = false;
  sw.elapsed = 0;
  clearInterval(sw.intervalId);
  sw.intervalId = null;
  updateStopwatchDisplay();
  sw.els.toggle.classList.replace('sw-stop', 'sw-start');
}

function initStopwatch() {
  const container = document.getElementById('stopwatch');
  const display = document.createElement('div');
  display.className = 'sw-display';
  display.textContent = formatTime(0);

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sw-btn sw-start';
  toggleBtn.textContent = 'S';
  toggleBtn.addEventListener('click', toggleStopwatch);

  const resetBtn = document.createElement('button');
  resetBtn.className = 'sw-btn sw-reset';
  resetBtn.textContent = 'R';
  resetBtn.addEventListener('click', resetStopwatch);

  const buttons = document.createElement('div');
  buttons.className = 'sw-buttons';
  buttons.append(toggleBtn, resetBtn);

  container.append(display, buttons);

  stopwatch.els = { display, toggle: toggleBtn };
}

// ── カウンター ──

function updateValue(index, action) {
  const counter = counters[index];
  if (action === 'increment') counter.value++;
  else if (action === 'decrement') counter.value--;
  else if (action === 'reset') counter.value = 0;
  save();
  document.getElementById(`value-${index}`).textContent = counter.value;
}

function updateName(index, name) {
  counters[index].name = name;
  save();
}

function resetAll() {
  if (!confirm('すべてのカウンターをリセットしますか？')) return;
  counters.forEach((c) => { c.value = 0; });
  save();
  renderCounters();
}

function renderCounters() {
  const grid = document.getElementById('counterGrid');
  grid.innerHTML = '';
  counters.forEach((counter, index) => {
    const card = document.createElement('div');
    card.className = 'counter-card';
    card.innerHTML = `
      <div class="counter-header">
        <input type="text" class="counter-name" value="${escapeHtml(counter.name)}" data-index="${index}">
        <button class="btn-reset" data-index="${index}" data-action="reset">0</button>
      </div>
      <div class="counter-body">
        <div class="counter-value" data-index="${index}" data-action="increment" id="value-${index}">${counter.value}</div>
        <button class="btn-decrement" data-index="${index}" data-action="decrement">−</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ── イベント委譲 ──

document.getElementById('counterGrid').addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  updateValue(parseInt(target.dataset.index, 10), target.dataset.action);
});

document.getElementById('counterGrid').addEventListener('input', (e) => {
  if (e.target.classList.contains('counter-name')) {
    updateName(parseInt(e.target.dataset.index, 10), e.target.value);
  }
});

document.getElementById('resetAllBtn').addEventListener('click', resetAll);

// ── 初期化 ──

initStopwatch();
renderCounters();
