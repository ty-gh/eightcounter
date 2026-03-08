const COUNTER_COUNT = 7;
const STORAGE_KEY = 'eightCounterData';

// ストップウォッチ
let swElapsed = 0;
let swStartTime = 0;
let swRunning = false;
let swInterval = null;

function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    return JSON.parse(saved);
  }
  return Array.from({ length: COUNTER_COUNT }, (_, i) => ({
    name: `カウンター${i + 1}`,
    value: 0,
  }));
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function updateStopwatchDisplay() {
  const display = document.getElementById('sw-display');
  if (!display) return;
  const current = swRunning ? swElapsed + (Date.now() - swStartTime) : swElapsed;
  display.textContent = formatTime(current);
}

function toggleStopwatch() {
  if (swRunning) {
    swElapsed += Date.now() - swStartTime;
    swRunning = false;
    clearInterval(swInterval);
    swInterval = null;
    document.getElementById('sw-toggle').textContent = 'スタート';
    document.getElementById('sw-toggle').classList.remove('sw-stop');
    document.getElementById('sw-toggle').classList.add('sw-start');
  } else {
    swStartTime = Date.now();
    swRunning = true;
    swInterval = setInterval(updateStopwatchDisplay, 10);
    document.getElementById('sw-toggle').textContent = 'ストップ';
    document.getElementById('sw-toggle').classList.remove('sw-start');
    document.getElementById('sw-toggle').classList.add('sw-stop');
  }
}

function resetStopwatch() {
  swRunning = false;
  swElapsed = 0;
  clearInterval(swInterval);
  swInterval = null;
  updateStopwatchDisplay();
  document.getElementById('sw-toggle').textContent = 'スタート';
  document.getElementById('sw-toggle').classList.remove('sw-stop');
  document.getElementById('sw-toggle').classList.add('sw-start');
}

function renderStopwatch() {
  const card = document.createElement('div');
  card.className = 'counter-card stopwatch-card';
  card.innerHTML = `
    <div class="stopwatch-label">ストップウォッチ</div>
    <div class="counter-value" id="sw-display">${formatTime(swElapsed)}</div>
    <div class="counter-buttons">
      <button class="sw-btn sw-start" id="sw-toggle">スタート</button>
      <button class="sw-btn sw-reset" id="sw-reset">リセット</button>
    </div>
  `;
  return card;
}

function render() {
  const grid = document.getElementById('counterGrid');
  const data = loadData();

  grid.innerHTML = '';

  // ストップウォッチを左上に配置
  const swCard = renderStopwatch();
  grid.appendChild(swCard);
  document.getElementById('sw-toggle').addEventListener('click', toggleStopwatch);
  document.getElementById('sw-reset').addEventListener('click', resetStopwatch);

  data.forEach((counter, index) => {
    const card = document.createElement('div');
    card.className = 'counter-card';
    card.innerHTML = `
      <input type="text" class="counter-name" value="${escapeHtml(counter.name)}" data-index="${index}">
      <div class="counter-value" id="value-${index}">${counter.value}</div>
      <div class="counter-buttons">
        <button class="btn-decrement" data-index="${index}" data-action="decrement">−</button>
        <button class="btn-reset" data-index="${index}" data-action="reset">0</button>
        <button class="btn-increment" data-index="${index}" data-action="increment">＋</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateValue(index, action) {
  const data = loadData();
  if (action === 'increment') {
    data[index].value++;
  } else if (action === 'decrement') {
    data[index].value--;
  } else if (action === 'reset') {
    data[index].value = 0;
  }
  saveData(data);
  document.getElementById(`value-${index}`).textContent = data[index].value;
}

function updateName(index, name) {
  const data = loadData();
  data[index].name = name;
  saveData(data);
}

function resetAll() {
  if (!confirm('すべてのカウンターをリセットしますか？')) return;
  const data = loadData();
  data.forEach((counter) => {
    counter.value = 0;
  });
  saveData(data);
  render();
}

// イベント委譲
document.getElementById('counterGrid').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const index = parseInt(btn.dataset.index, 10);
  const action = btn.dataset.action;
  updateValue(index, action);
});

document.getElementById('counterGrid').addEventListener('input', (e) => {
  if (e.target.classList.contains('counter-name')) {
    const index = parseInt(e.target.dataset.index, 10);
    updateName(index, e.target.value);
  }
});

document.getElementById('resetAllBtn').addEventListener('click', resetAll);

// 初期描画
render();
