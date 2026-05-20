'use strict';

const words = [
  {u:'6',en:'train',es:'tren',icon:'🚆'}, {u:'6',en:'shop',es:'tienda',icon:'🏪'}, {u:'6',en:'garden',es:'jardín',icon:'🌳'}, {u:'6',en:'bus stop',es:'parada de autobús',icon:'🚏'}, {u:'6',en:'tree',es:'árbol',icon:'🌲'},
  {u:'6',en:'lorry',es:'camión',icon:'🚚'}, {u:'6',en:'bus',es:'autobús',icon:'🚌'}, {u:'6',en:'park',es:'parque',icon:'🏞️'}, {u:'6',en:'flower',es:'flor',icon:'🌼'}, {u:'6',en:'motorbike',es:'moto',icon:'🏍️'},
  {u:'6',en:'car',es:'coche',icon:'🚙'}, {u:'6',en:'zebra',es:'cebra',icon:'🦓'}, {u:'6',en:'hippo',es:'hipopótamo',icon:'🦛'}, {u:'6',en:'polar bear',es:'oso polar',icon:'🐻‍❄️'}, {u:'6',en:'elephant',es:'elefante',icon:'🐘'},
  {u:'6',en:'bear',es:'oso',icon:'🐻'}, {u:'6',en:'lizard',es:'lagarto',icon:'🦎'}, {u:'6',en:'snake',es:'serpiente',icon:'🐍'}, {u:'6',en:'giraffe',es:'jirafa',icon:'🦒'}, {u:'6',en:'crocodile',es:'cocodrilo',icon:'🐊'},
  {u:'6',en:'tiger',es:'tigre',icon:'🐅'}, {u:'6',en:'monkey',es:'mono',icon:'🐒'},

  {u:'9',en:'trousers',es:'pantalones',icon:'👖'}, {u:'9',en:'sunglasses',es:'gafas de sol',icon:'🕶️'}, {u:'9',en:'shirt',es:'camisa',icon:'👔'}, {u:'9',en:'T-shirt',es:'camiseta',icon:'👕'}, {u:'9',en:'shorts',es:'pantalones cortos',icon:'🩳'},
  {u:'9',en:'dress',es:'vestido',icon:'👗'}, {u:'9',en:'baseball cap',es:'gorra',icon:'🧢'}, {u:'9',en:'skirt',es:'falda',icon:'👚'}, {u:'9',en:'shoes',es:'zapatos',icon:'👟'}, {u:'9',en:'jacket',es:'chaqueta',icon:'🧥'},
  {u:'9',en:'boots',es:'botas',icon:'🥾'}, {u:'9',en:'jeans',es:'vaqueros',icon:'👖'}, {u:'9',en:'hat',es:'sombrero',icon:'👒'}, {u:'9',en:'fishing',es:'pescar',icon:'🎣'}, {u:'9',en:'boat',es:'barco',icon:'⛵'},
  {u:'9',en:'sea',es:'mar',icon:'🌊'}, {u:'9',en:'sand',es:'arena',icon:'🏖️'}, {u:'9',en:'camera',es:'cámara',icon:'📷'}, {u:'9',en:'shell',es:'concha',icon:'🐚'}, {u:'9',en:'beach',es:'playa',icon:'🏝️'},
  {u:'9',en:'jellyfish',es:'medusa',icon:'🪼'}, {u:'9',en:'fish',es:'pez',icon:'🐟'}, {u:'9',en:'sun',es:'sol',icon:'☀️'},

  {u:'7',en:'play the guitar',es:'tocar la guitarra',icon:'🎸'}, {u:'7',en:'play the piano',es:'tocar el piano',icon:'🎹'}, {u:'7',en:'play tennis',es:'jugar al tenis',icon:'🎾'}, {u:'7',en:'play football',es:'jugar al fútbol',icon:'⚽'},
  {u:'7',en:'play basketball',es:'jugar al baloncesto',icon:'🏀'}, {u:'7',en:'play hockey',es:'jugar al hockey',icon:'🏑'}, {u:'7',en:'play badminton',es:'jugar al bádminton',icon:'🏸'}, {u:'7',en:'ride a bike',es:'montar en bici',icon:'🚲'},
  {u:'7',en:'ride a skateboard',es:'montar en monopatín',icon:'🛹'}, {u:'7',en:'watch television',es:'ver la televisión',icon:'📺'}, {u:'7',en:'swimming',es:'nadar',icon:'🏊'}, {u:'7',en:'throwing',es:'lanzar',icon:'🤾'},
  {u:'7',en:'catching',es:'coger / atrapar',icon:'🙌'}, {u:'7',en:'hitting',es:'golpear',icon:'🏏'}, {u:'7',en:'kicking',es:'chutar',icon:'🦵'}, {u:'7',en:'running',es:'correr',icon:'🏃'}, {u:'7',en:'swim',es:'nadar',icon:'🏊‍♂️'}
];

const $ = (selector) => document.querySelector(selector);
const state = {
  audioEnabled: false,
  challenge: null,
  selectedCorrect: false,
  ok: 0,
  tries: 0,
  deferredPrompt: null
};

function filteredWords() {
  const unit = $('#unitFilter').value;
  return unit === 'all' ? words : words.filter((w) => w.u === unit);
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-–—'’`´]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(text, lang = 'en-GB', onEnd) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = lang.startsWith('en') ? 0.78 : 0.86;
  utterance.pitch = 1;
  utterance.onend = () => {
    if (onEnd) window.setTimeout(onEnd, 180);
  };
  window.speechSynthesis.speak(utterance);
}

function speakBoth(word) {
  speak(word.en, 'en-GB', () => speak(word.es, 'es-ES'));
}

function card(word, mode = 'learn') {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'card';
  button.dataset.word = word.en;
  button.innerHTML = `
    <span class="unit">Unit ${word.u}</span>
    <span class="icon" aria-hidden="true">${word.icon}</span>
    <span class="word">${word.en}</span>
  `;

  if (mode === 'learn') {
    button.disabled = !state.audioEnabled;
    button.addEventListener('click', () => speakBoth(word));
  } else {
    button.addEventListener('click', () => chooseWord(word, button));
  }

  return button;
}

function renderLearningCards() {
  const grid = $('#grid');
  grid.innerHTML = '';
  grid.classList.toggle('locked', !state.audioEnabled);
  filteredWords().forEach((word) => grid.appendChild(card(word, 'learn')));
}

function enableAudio() {
  state.audioEnabled = true;
  $('#audioStatus').textContent = 'Iconos activados. Pulsa cualquier imagen.';
  $('#enableAudio').textContent = 'Audio activado';
  $('#enableAudio').disabled = true;
  renderLearningCards();
  speak('English', 'en-GB');
}

function renderChallengeChoices() {
  const grid = $('#choiceGrid');
  grid.innerHTML = '';
  const all = filteredWords();
  if (!state.challenge) return;

  const wrong = shuffle(all.filter((w) => w.en !== state.challenge.en)).slice(0, 11);
  const options = shuffle([state.challenge, ...wrong]);
  options.forEach((word) => grid.appendChild(card(word, 'game')));
}

function startChallenge() {
  const all = filteredWords();
  state.challenge = all[Math.floor(Math.random() * all.length)];
  state.selectedCorrect = false;

  $('#typeBox').hidden = true;
  $('#typedWord').value = '';
  $('#writtenWord').textContent = '—';
  $('#correctWord').textContent = '—';
  $('#matchResult').textContent = 'Pendiente';
  $('#matchResult').className = '';
  $('#repeatChallenge').disabled = false;
  $('#gameMsg').textContent = 'Escucha y selecciona la imagen correcta.';

  renderChallengeChoices();
  speak(state.challenge.en, 'en-GB');
}

function repeatChallenge() {
  if (!state.challenge) return;
  speak(state.challenge.en, 'en-GB');
}

function chooseWord(word, button) {
  if (!state.challenge || state.selectedCorrect) return;

  state.tries += 1;
  $('#tries').textContent = String(state.tries);

  if (word.en === state.challenge.en) {
    state.ok += 1;
    state.selectedCorrect = true;
    $('#ok').textContent = String(state.ok);
    button.classList.add('right');
    $('#gameMsg').textContent = 'Imagen correcta. Ahora termina la tarea escribiendo la palabra.';
    $('#typeBox').hidden = false;
    $('#correctWord').textContent = state.challenge.en;
    $('#writtenWord').textContent = '—';
    $('#matchResult').textContent = 'Pendiente';
    playApplause();
    window.setTimeout(() => $('#typedWord').focus(), 80);
  } else {
    button.classList.add('wrong');
    $('#gameMsg').textContent = 'No coincide. Escucha otra vez y selecciona la imagen correcta.';
    speak(state.challenge.en, 'en-GB');
  }
}

function updateTypedResult() {
  if (!state.challenge) return false;
  const written = $('#typedWord').value;
  const match = normalize(written) === normalize(state.challenge.en);
  $('#correctWord').textContent = state.challenge.en;
  $('#writtenWord').textContent = written || '—';
  $('#matchResult').textContent = match ? 'Sí, coincide' : 'No coincide todavía';
  $('#matchResult').className = match ? 'matchOk' : 'matchNo';
  return match;
}

function checkTyped() {
  if (!state.challenge || !state.selectedCorrect) return;
  const match = updateTypedResult();
  if (match) {
    $('#gameMsg').textContent = 'Tarea completada. Pulsa “Escuchar palabra” para una nueva palabra.';
    speak('Correct', 'en-GB');
  } else {
    $('#gameMsg').textContent = 'Revisa la escritura. Debe coincidir con la palabra en inglés.';
  }
}

function playApplause() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    for (let i = 0; i < 7; i += 1) {
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let j = 0; j < data.length; j += 1) data[j] = (Math.random() * 2 - 1) * 0.8;
      const noise = ctx.createBufferSource();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 900 + Math.random() * 900;
      gain.gain.setValueAtTime(0.0001, now + i * 0.085);
      gain.gain.exponentialRampToValueAtTime(0.45, now + i * 0.085 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.085 + 0.08);
      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start(now + i * 0.085);
      noise.stop(now + i * 0.085 + 0.09);
    }
    window.setTimeout(() => ctx.close(), 1200);
  } catch (_) {}
}

function switchView(view) {
  document.querySelectorAll('.tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.view === view));
  $('#cardsView').hidden = view !== 'cards';
  $('#listenView').hidden = view !== 'listen';
  if (view === 'listen' && !state.challenge) renderChallengeChoices();
}

function clearOldServiceWorkerCache() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((regs) => regs.forEach((reg) => reg.unregister()))
      .catch(() => {});
  }
  if ('caches' in window) {
    caches.keys()
      .then((keys) => keys.forEach((key) => caches.delete(key)))
      .catch(() => {});
  }
}

function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    state.deferredPrompt = event;
    $('#installBtn').hidden = false;
  });

  $('#installBtn').addEventListener('click', async () => {
    if (!state.deferredPrompt) return;
    state.deferredPrompt.prompt();
    state.deferredPrompt = null;
    $('#installBtn').hidden = true;
  });
}

function init() {
  clearOldServiceWorkerCache();
  setupInstallPrompt();

  $('#enableAudio').addEventListener('click', enableAudio);
  $('#unitFilter').addEventListener('change', () => {
    state.challenge = null;
    state.selectedCorrect = false;
    renderLearningCards();
    $('#choiceGrid').innerHTML = '';
    $('#typeBox').hidden = true;
    $('#repeatChallenge').disabled = true;
    $('#gameMsg').textContent = 'Pulsa “Escuchar palabra”.';
  });

  $('.tabs').addEventListener('click', (event) => {
    const tab = event.target.closest('.tab');
    if (!tab) return;
    switchView(tab.dataset.view);
  });

  $('#newChallenge').addEventListener('click', startChallenge);
  $('#repeatChallenge').addEventListener('click', repeatChallenge);
  $('#checkTyped').addEventListener('click', checkTyped);
  $('#typedWord').addEventListener('input', updateTypedResult);
  $('#typedWord').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') checkTyped();
  });

  renderLearningCards();
}

init();
