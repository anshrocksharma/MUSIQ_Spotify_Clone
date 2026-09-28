(function () {
  const data = window.MusiqData || {};
  const songs = Array.isArray(data.songs) ? data.songs : [];
  const albums = Array.isArray(data.albums) ? data.albums : [];
  const artists = Array.isArray(data.artists) ? data.artists : [];
  const genres = Array.isArray(data.genres) ? data.genres : [];

  function createQuickPickCard(song) {
    const article = document.createElement('article');
    article.className = 'quick-card';

    const albumPattern = document.createElement('div');
    albumPattern.className = 'album-pattern';

    const meta = document.createElement('div');
    meta.className = 'meta';

    const title = document.createElement('strong');
    title.textContent = song.title;

    const artist = document.createElement('span');
    artist.textContent = song.artist;

    const playButton = document.createElement('button');
    playButton.className = 'play-badge';
    playButton.type = 'button';
    playButton.setAttribute('aria-label', `Play ${song.title}`);
    playButton.textContent = '▶';

    playButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (window.MusiqPlayer && typeof window.MusiqPlayer.loadSong === 'function') {
        window.MusiqPlayer.loadSong(song);
      }
      if (window.MusiqPlayer && typeof window.MusiqPlayer.playSong === 'function') {
        window.MusiqPlayer.playSong();
      }
    });

    meta.appendChild(title);
    meta.appendChild(artist);
    article.appendChild(albumPattern);
    article.appendChild(meta);
    article.appendChild(playButton);

    return article;
  }

  function renderQuickPicks() {
    const grid = document.getElementById('quickPickGrid');
    if (!grid || !songs.length) return;

    const items = songs.slice(0, 6);
    grid.innerHTML = '';
    items.forEach((song) => grid.appendChild(createQuickPickCard(song)));
  }

  function renderJumpBackIn() {
    const carousel = document.getElementById('jumpBackInCarousel');
    if (!carousel || !albums.length) return;

    const items = albums.slice(0, 4);
    carousel.innerHTML = '';

    items.forEach((album, index) => {
      const card = document.createElement('div');
      card.className = 'album-card';

      const cover = document.createElement('div');
      cover.className = `cover style-${(index % 4) + 1}`;

      const meta = document.createElement('div');
      meta.className = 'album-meta';

      const title = document.createElement('strong');
      title.textContent = album.title;

      const artist = document.createElement('span');
      artist.textContent = album.artist;

      meta.appendChild(title);
      meta.appendChild(artist);
      card.appendChild(cover);
      card.appendChild(meta);
      carousel.appendChild(card);
    });
  }

  function renderPopularArtists() {
    const row = document.getElementById('popularArtistsRow');
    if (!row || !artists.length) return;

    const items = artists.slice(0, 4);
    row.innerHTML = '';

    items.forEach((artist, index) => {
      const card = document.createElement('div');
      card.className = 'artist-card';

      const avatar = document.createElement('div');
      avatar.className = 'artist-avatar';
      const gradients = [
        'linear-gradient(135deg, #7ad3d5, #1e3255)',
        'linear-gradient(135deg, #d57ec3, #3a2346)',
        'linear-gradient(135deg, #f3ad7d, #4d382d)',
        'linear-gradient(135deg, #84d8a5, #1d4338)',
      ];
      avatar.style.background = gradients[index % gradients.length];

      const name = document.createElement('strong');
      name.textContent = artist.name;

      const followers = document.createElement('span');
      followers.textContent = artist.followers;

      card.appendChild(avatar);
      card.appendChild(name);
      card.appendChild(followers);
      row.appendChild(card);
    });
  }

  function renderMoodsAndVibes() {
    const grid = document.getElementById('moodsAndVibesGrid');
    if (!grid || !genres.length) return;

    const items = genres.slice(0, 6);
    grid.innerHTML = '';

    items.forEach((genre, index) => {
      const card = document.createElement('div');
      card.className = `genre-card g${(index % 6) + 1}`;

      const label = document.createElement('span');
      label.textContent = genre.name;

      card.appendChild(label);
      grid.appendChild(card);
    });
  }

  function renderHome() {
    renderQuickPicks();
    renderJumpBackIn();
    renderPopularArtists();
    renderMoodsAndVibes();
  }

  window.MusiqHome = {
    render: renderHome,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderHome);
  } else {
    renderHome();
  }
})();
