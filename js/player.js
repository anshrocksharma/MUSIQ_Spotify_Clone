(() => {
  const audio = document.getElementById('audioPlayer') || document.createElement('audio');
  if (!audio.id) {
    audio.id = 'audioPlayer';
  }
  audio.preload = 'metadata';
  if (!audio.parentNode) {
    document.body.appendChild(audio);
  }

  const state = {
    currentSong: null,
    currentSongIndex: -1,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: audio.volume,
    queue: [
      {
        title: 'Midnight Signal',
        artist: 'Lina Vale',
        album: 'Neon Reverie',
        src: 'assets/audio/test.mp3',
      },
      {
        title: 'Afterglow',
        artist: 'Prisha K.',
        album: 'Afterglow',
        src: 'assets/audio/test.mp3',
      },
      {
        title: 'Faded Haze',
        artist: 'Arjun M.',
        album: 'Faded Haze',
        src: 'assets/audio/test.mp3',
      },
      {
        title: 'Glass Sky',
        artist: 'Nova Lane',
        album: 'Glass Sky',
        src: 'assets/audio/test.mp3',
      },
      {
        title: 'Signal Bloom',
        artist: 'Rhea S.',
        album: 'Signal Bloom',
        src: 'assets/audio/test.mp3',
      },
    ],
  };

  const miniPlayer = document.getElementById('miniPlayer');
  const miniTitle = miniPlayer.querySelector('.mini-meta strong');
  const miniArtist = miniPlayer.querySelector('.mini-meta span');
  const miniProgress = miniPlayer.querySelector('.mini-progress');
  const miniProgressFill = miniProgress.querySelector('span');
  const miniButtons = miniPlayer.querySelectorAll('.mini-control');
  const modal = document.getElementById('playerModal');
  const modalTitle = modal.querySelector('.modal-title');
  const trackMeta = modal.querySelector('.track-meta');
  const slider = modal.querySelector('.slider');
  const sliderFill = slider.querySelector('span');
  const timeLabels = modal.querySelectorAll('.time-row span');
  const fullButtons = modal.querySelectorAll('.controls .circle-btn');
  const playButtons = [miniButtons[1], fullButtons[2]];

  function formatTime(time) {
    if (!Number.isFinite(time) || time < 0) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function updateSongDetails() {
    if (!state.currentSong) return;
    miniTitle.textContent = state.currentSong.title;
    miniArtist.textContent = state.currentSong.artist;
    modalTitle.textContent = state.currentSong.title;
    trackMeta.textContent = `${state.currentSong.artist} \u2022 ${state.currentSong.album}`;
  }

  function updatePlayButtons() {
    playButtons.forEach((button) => {
      button.textContent = state.isPlaying ? '\u23F8' : '\u25B6';
      button.setAttribute('aria-label', state.isPlaying ? 'Pause' : 'Play');
      button.setAttribute('aria-pressed', String(state.isPlaying));
    });
  }

  function updateProgress() {
    state.currentTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    state.duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const progress = state.duration > 0 ? state.currentTime / state.duration : 0;
    const percentage = `${Math.min(100, Math.max(0, progress * 100))}%`;

    miniProgressFill.style.width = percentage;
    sliderFill.style.width = percentage;
    miniProgress.setAttribute('aria-valuemax', String(Math.floor(state.duration)));
    miniProgress.setAttribute('aria-valuenow', String(Math.floor(state.currentTime)));
    slider.setAttribute('aria-valuemax', String(Math.floor(state.duration)));
    slider.setAttribute('aria-valuenow', String(Math.floor(state.currentTime)));
    slider.setAttribute('aria-valuetext', `${formatTime(state.currentTime)} of ${formatTime(state.duration)}`);
    timeLabels[0].textContent = formatTime(state.currentTime);
    timeLabels[1].textContent = formatTime(state.duration);
  }

  function loadSong(song) {
    if (!song || !song.src) return;

    let index = state.queue.findIndex((queuedSong) => queuedSong.src === song.src);
    if (index === -1) {
      state.queue.push(song);
      index = state.queue.length - 1;
    }

    state.currentSong = song;
    state.currentSongIndex = index;
    state.currentTime = 0;
    state.duration = 0;
    audio.src = song.src;
    audio.load();
    updateSongDetails();
    updateProgress();
  }

  async function playSong() {
    if (!state.currentSong && state.queue.length > 0) {
      loadSong(state.queue[0]);
    }
    if (!state.currentSong) return;
    if (!audio.getAttribute('src')) loadSong(state.currentSong);

    try {
      await audio.play();
      state.isPlaying = true;
      updatePlayButtons();
    } catch {
      state.isPlaying = false;
      updatePlayButtons();
    }
  }

  function pauseSong() {
    audio.pause();
    state.isPlaying = false;
    updatePlayButtons();
  }

  function togglePlay() {
    if (state.isPlaying) pauseSong();
    else playSong();
  }

  function nextSong(autoplay = true) {
    if (state.queue.length === 0) return;
    const nextIndex = (state.currentSongIndex + 1) % state.queue.length;
    loadSong(state.queue[nextIndex]);
    if (autoplay) playSong();
  }

  function previousSong() {
    if (state.queue.length === 0) return;
    const shouldPlay = state.isPlaying;
    const previousIndex = (state.currentSongIndex - 1 + state.queue.length) % state.queue.length;
    loadSong(state.queue[previousIndex]);
    if (shouldPlay) playSong();
  }

  function seekSong(seconds) {
    if (!Number.isFinite(Number(seconds)) || state.duration <= 0) return;
    audio.currentTime = Math.min(state.duration, Math.max(0, Number(seconds)));
    updateProgress();
  }

  function setVolume(volume) {
    if (!Number.isFinite(Number(volume))) return;
    state.volume = Math.min(1, Math.max(0, Number(volume)));
    audio.volume = state.volume;
  }

  function seekFromPointer(event, control) {
    if (state.duration <= 0) return;
    const bounds = control.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
    seekSong(ratio * state.duration);
  }

  function configureSeekControl(control, label) {
    control.setAttribute('role', 'slider');
    control.setAttribute('aria-label', label);
    control.setAttribute('aria-valuemin', '0');
    control.setAttribute('aria-valuemax', '0');
    control.setAttribute('aria-valuenow', '0');
    control.setAttribute('tabindex', '0');

    control.addEventListener('pointerdown', (event) => seekFromPointer(event, control));
    control.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        seekSong(state.currentTime + 5);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        seekSong(state.currentTime - 5);
      } else if (event.key === 'Home') {
        event.preventDefault();
        seekSong(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        seekSong(state.duration);
      }
    });
  }

  miniButtons.forEach((button) => button.addEventListener('click', (event) => event.stopPropagation()));
  miniButtons[0].addEventListener('click', previousSong);
  miniButtons[1].addEventListener('click', togglePlay);
  miniButtons[2].addEventListener('click', () => nextSong());
  document.querySelector('.play-button')?.addEventListener('click', () => {
    loadSong(state.queue[0]);
    playSong();
  });

  fullButtons[0].addEventListener('click', previousSong);
  fullButtons[1].addEventListener('click', () => seekSong(state.currentTime - 10));
  fullButtons[2].addEventListener('click', togglePlay);
  fullButtons[3].addEventListener('click', () => nextSong());
  fullButtons[4].addEventListener('click', (event) => {
    audio.loop = !audio.loop;
    event.currentTarget.setAttribute('aria-pressed', String(audio.loop));
  });

  configureSeekControl(miniProgress, 'Seek through track');
  configureSeekControl(slider, 'Seek through track');

  document.querySelectorAll('[data-volume], .volume-control, #volumeControl').forEach((control) => {
    control.addEventListener('input', (event) => setVolume(event.currentTarget.value));
  });

  audio.addEventListener('timeupdate', updateProgress);
  audio.addEventListener('durationchange', updateProgress);
  audio.addEventListener('loadedmetadata', updateProgress);
  audio.addEventListener('play', () => {
    state.isPlaying = true;
    updatePlayButtons();
  });
  audio.addEventListener('pause', () => {
    state.isPlaying = false;
    updatePlayButtons();
  });
  audio.addEventListener('ended', () => nextSong(true));

  state.currentSong = state.queue[0];
  state.currentSongIndex = 0;
  updateSongDetails();
  updateProgress();
  updatePlayButtons();

  window.MusiqPlayer = {
    audio,
    state,
    loadSong,
    playSong,
    pauseSong,
    togglePlay,
    nextSong,
    previousSong,
    seekSong,
    setVolume,
    updateProgress,
  };
})();