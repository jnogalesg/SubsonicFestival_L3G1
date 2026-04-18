import { useMemo, useRef, useState } from 'react';
import ReactPlayer from 'react-player';

const TRACK_URLS = {
  'The Business': 'https://www.youtube.com/watch?v=nCg3ufihKyU',
  "Don't Be Shy": 'https://www.youtube.com/watch?v=taSubkjZUA4',
  'The Motto': 'https://www.youtube.com/watch?v=1_4ELAxKrDc',
  'Hot In It': [
    'https://www.youtube.com/watch?v=3zU9d6zA3l4',
    'https://www.youtube.com/watch?v=nCg3ufihKyU',
  ],
  'Lay Low': [
    'https://www.youtube.com/watch?v=U8YGQ9B0V7I',
    'https://www.youtube.com/watch?v=taSubkjZUA4',
  ],
  Titanium: 'https://www.youtube.com/watch?v=JRfuAukYTKg',
  "I'm Good (Blue)": 'https://www.youtube.com/watch?v=90RLzVUuXe4',
  Memories: 'https://www.youtube.com/watch?v=NUVCQXMUVnI',
  'Sexy Bitch': 'https://www.youtube.com/watch?v=mIIN_SGQy9c',
  'Without You': 'https://www.youtube.com/watch?v=jUe8uoKdHao',
  Animals: 'https://www.youtube.com/watch?v=gCYcHz2k5x0',
  'In The Name Of Love': 'https://www.youtube.com/watch?v=RnBT9uUYb1w',
  'Scared To Be Lonely': 'https://www.youtube.com/watch?v=e2vBLd5Egnk',
  'High On Life': 'https://www.youtube.com/watch?v=Lpjcm1F8tY8',
  'Summer Days': 'https://www.youtube.com/watch?v=LdvvPtIfR8w',
  'Blah Blah Blah': 'https://www.youtube.com/watch?v=mfJhMfOPWdE',
  'This Is What It Feels Like': 'https://www.youtube.com/watch?v=BR_DFMUzX4E',
  'Great Spirit': 'https://www.youtube.com/watch?v=yo4pmauhugo',
  'Turn It Up': 'https://www.youtube.com/watch?v=cR2XilcGYOo',
  'No Fun': 'https://www.youtube.com/watch?v=mfJhMfOPWdE',
  'Rise of the Apex': 'https://www.youtube.com/watch?v=gCYcHz2k5x0',
  'Bass Cannon': 'https://www.youtube.com/watch?v=RnBT9uUYb1w',
  'Power of Mind': 'https://www.youtube.com/watch?v=e2vBLd5Egnk',
  'Harder Better Faster': 'https://www.youtube.com/watch?v=Lpjcm1F8tY8',
  Infinity: [
    'https://www.youtube.com/watch?v=ObB5kl5qa5o',
    'https://www.youtube.com/watch?v=gCYcHz2k5x0',
  ],
};

const ARTIST_FALLBACK_URLS = {
  Tiesto: 'https://www.youtube.com/watch?v=nCg3ufihKyU',
  Tie: 'https://www.youtube.com/watch?v=nCg3ufihKyU',
  'David Guetta': 'https://www.youtube.com/watch?v=JRfuAukYTKg',
  'Martin Garrix': 'https://www.youtube.com/watch?v=gCYcHz2k5x0',
  'Armin van Buuren': 'https://www.youtube.com/watch?v=mfJhMfOPWdE',
  'DJ Apex': 'https://www.youtube.com/watch?v=gCYcHz2k5x0',
};

const DEFAULT_URL = 'https://www.youtube.com/watch?v=nCg3ufihKyU';

const normalize = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds || 0));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

const parseTimeFromEvent = (eventLike) => {
  if (typeof eventLike === 'number') return eventLike;
  if (eventLike?.currentTime != null) return Number(eventLike.currentTime) || 0;
  if (eventLike?.target?.currentTime != null) return Number(eventLike.target.currentTime) || 0;
  return 0;
};

const parseDurationFromEvent = (eventLike) => {
  if (typeof eventLike === 'number') return eventLike;
  if (eventLike?.duration != null) return Number(eventLike.duration) || 0;
  if (eventLike?.target?.duration != null) return Number(eventLike.target.duration) || 0;
  return 0;
};

const getTrackCandidates = (artistName, track) => {
  if (track?.url) return [track.url];
  if (track?.youtubeUrl) return [track.youtubeUrl];

  const trackKey = normalize(track?.titulo);
  const exactMatch = Object.entries(TRACK_URLS).find(([title]) => normalize(title) === trackKey);
  if (exactMatch) {
    return Array.isArray(exactMatch[1]) ? exactMatch[1] : [exactMatch[1]];
  }

  const artistKey = normalize(artistName);
  const fallbackMatch = Object.entries(ARTIST_FALLBACK_URLS).find(([artist]) => normalize(artist) === artistKey);
  if (fallbackMatch) return [fallbackMatch[1]];

  return [DEFAULT_URL];
};

export default function SubsonicRadio({ datosArtistas = [] }) {
  const playerRef = useRef(null);

  const [artistaIndex, setArtistaIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [trackDuration, setTrackDuration] = useState(0);
  const [errorReproductor, setErrorReproductor] = useState('');
  const [candidateIndex, setCandidateIndex] = useState(0);

  const artistaActivo = datosArtistas[artistaIndex] || null;
  const playlist = artistaActivo?.playlist || [];
  const cancionActiva = playlist[trackIndex] || null;

  const currentCandidates = useMemo(() => {
    if (!artistaActivo || !cancionActiva) return [DEFAULT_URL];
    return getTrackCandidates(artistaActivo.nombre, cancionActiva);
  }, [artistaActivo, cancionActiva]);

  const currentUrl = currentCandidates[Math.min(candidateIndex, currentCandidates.length - 1)] || DEFAULT_URL;

  const seleccionarArtista = (index) => {
    setArtistaIndex(index);
    setTrackIndex(0);
    setCurrentSeconds(0);
    setTrackDuration(0);
    setPlaying(false);
    setErrorReproductor('');
    setCandidateIndex(0);
  };

  const seleccionarCancion = (index) => {
    setTrackIndex(index);
    setCurrentSeconds(0);
    setTrackDuration(0);
    setPlaying(true);
    setErrorReproductor('');
    setCandidateIndex(0);
  };

  const trackCount = playlist.length;

  const previousTrack = () => {
    if (!trackCount) return;
    const prev = (trackIndex - 1 + trackCount) % trackCount;
    setTrackIndex(prev);
    setCurrentSeconds(0);
    setTrackDuration(0);
    setPlaying(true);
    setErrorReproductor('');
    setCandidateIndex(0);
  };

  const nextTrack = () => {
    if (!trackCount) return;
    const next = (trackIndex + 1) % trackCount;
    setTrackIndex(next);
    setCurrentSeconds(0);
    setTrackDuration(0);
    setPlaying(true);
    setErrorReproductor('');
    setCandidateIndex(0);
  };

  const seekToSeconds = (seconds) => {
    const safeSeconds = Math.max(0, Math.min(seconds || 0, trackDuration || 0));
    setCurrentSeconds(safeSeconds);

    const player = playerRef.current;
    if (!player) return;

    if (typeof player.seekTo === 'function') {
      player.seekTo(safeSeconds, 'seconds');
      return;
    }

    if ('currentTime' in player) {
      player.currentTime = safeSeconds;
    }
  };

  const handleProgressBarClick = (event) => {
    if (!trackDuration) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const posX = event.clientX - rect.left;
    const ratio = rect.width > 0 ? Math.max(0, Math.min(posX / rect.width, 1)) : 0;

    seekToSeconds(ratio * trackDuration);
    setPlaying(true);
  };

  if (!artistaActivo || !cancionActiva) {
    return <p>No hay canciones disponibles.</p>;
  }

  const progress = trackDuration > 0 ? Math.min(100, (currentSeconds / trackDuration) * 100) : 0;

  const hiddenPlayerStyle = {
    position: 'absolute',
    left: '-9999px',
    top: 0,
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none',
    overflow: 'hidden',
  };

  return (
    <>
      <div style={hiddenPlayerStyle} aria-hidden="true">
        <ReactPlayer
          ref={playerRef}
          src={currentUrl}
          playing={playing}
          volume={1}
          muted={false}
          playsInline
          width="1px"
          height="1px"
          onTimeUpdate={(eventLike) => setCurrentSeconds(parseTimeFromEvent(eventLike))}
          onDurationChange={(eventLike) => setTrackDuration(parseDurationFromEvent(eventLike))}
          onEnded={nextTrack}
          onError={() => {
            if (candidateIndex < currentCandidates.length - 1) {
              setCandidateIndex((prev) => prev + 1);
              setErrorReproductor('');
              return;
            }

            setErrorReproductor('Esta cancion no permite reproduccion embebida en YouTube. Prueba otra pista.');
            setPlaying(false);
          }}
          config={{
            youtube: {
              playerVars: {
                rel: 0,
                modestbranding: 1,
              },
            },
          }}
        />
      </div>

      <div className="music-artist-grid">
        {datosArtistas.map((artista, index) => (
          <div
            key={artista.id || artista.nombre}
            className={`music-artist-card ${artistaIndex === index ? 'activo' : ''}`}
            onClick={() => seleccionarArtista(index)}
          >
            <img src={artista.img} alt={artista.nombre} />
            <div className="music-artist-overlay">
              <span>{artista.nombre}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="music-player-card">
        <div className="player-header">
          <div className="player-cover-large">
            <img src={artistaActivo.img} alt={artistaActivo.nombre} />
          </div>
          <div className="player-info-large">
            <h3>{cancionActiva.titulo}</h3>
            <p>{artistaActivo.nombre}</p>
            <div className="player-tags">
              {(artistaActivo.tags || []).map((tag) => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="player-body">
          <div className="progress-area">
            <span>{formatTime(currentSeconds)}</span>
            <div className="progress-bar-bg" onClick={handleProgressBarClick}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span>{formatTime(trackDuration || 0)}</span>
          </div>

          {errorReproductor && <p className="auth-error">{errorReproductor}</p>}

          <div className="controls-area">
            <button className="btn-control-large" onClick={previousTrack}>⏮</button>
            <button className="btn-play-large" onClick={() => setPlaying((prev) => !prev)}>
              {playing ? '⏸' : '▶'}
            </button>
            <button className="btn-control-large" onClick={nextTrack}>⏭</button>
          </div>
        </div>

        <div className="playlist-list">
          {playlist.map((cancion, index) => (
            <div
              key={`${cancion.num}-${cancion.titulo}`}
              className={`playlist-item ${trackIndex === index ? 'active' : ''}`}
              onClick={() => seleccionarCancion(index)}
            >
              <span className="track-num">{cancion.num}</span>
              <span className="track-name">{cancion.titulo} - {artistaActivo.nombre}</span>
              <span className="track-time">{cancion.duracion}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
