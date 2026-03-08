const COUNTER_COUNT = 8;
const STORAGE_KEY = 'eightCounterData';

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

function render() {
  const grid = document.getElementById('counterGrid');
  const data = loadData();

  grid.innerHTML = '';

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
