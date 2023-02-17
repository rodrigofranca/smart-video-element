import type { BitrateLevel, DurationRange, IPlayer, PlayerParams, Size } from '$/model/Player';
import type { Drm } from '$/model/Drm';
import axios from 'axios';
import { EventEmitter } from '@billjs/event-emitter';
import { playerEvents } from '$/model/PlayerEvents';
import { noop, canAutoplay, isSafari } from '$/utils';

// static observedAttributes = [
//   'autoplay',
//   'controls',
//   'crossorigin',
//   'loop',
//   'muted',
//   'playsinline',
//   'poster',
//   'preload',
//   'src',
// ];

/**
 * Implementação básica de player,
 * pode ser usada diretamente para tocar mp4
 * ou ser extendida para uso mais complexos como
 * hls ou dash
 */
class Player extends EventEmitter implements IPlayer {
  buffered?: DurationRange[];
  // controls?: boolean;
  autoplay?: boolean;
  duration?: number;
  errorDescription?: string;
  isPlaying?: boolean;
  isLooping?: boolean;
  isBuffering?: boolean;
  position?: number;
  size?: Size;
  src: string;
  video: HTMLVideoElement;
  volume?: number;
  muted?: boolean;
  playsInline?: boolean;
  isLive?: boolean;
  drm?: Drm;

  private firstPlay = true;
  private currentTime: number = 0;

  constructor({
    src,
    video,
    // controls = false,
    autoplay = false,
    position,
    volume = 1,
    playsInline = true,
    drm
  }: PlayerParams) {
    super();

    // this.controls = false;
    this.autoplay = autoplay;
    this.isPlaying = false;
    this.isLooping = false;
    this.isBuffering = false;
    this.position = position;
    this.src = src;
    this.video = video;
    this.volume = volume;
    this.drm = drm;

    // console.log(this.video.controls);

    // this.video.controls = this.video.controls && this.controls;
    this.video.playsInline = playsInline;

    this.video.addEventListener('error', (error) => console.log('[Fantascope Player]', error));
    this.video.addEventListener('timeupdate', this.onTimeUpdate);
    // this.video.addEventListener('loadedmetadata', this.onLoadedMetadata)
  }

  private onLoadedMetadata = () => {
    if (!this.firstPlay) return;

    this.firstPlay = false;

    if (this.position) this.seek(this.position);

    this.video.removeEventListener('loadedmetadata', this.onLoadedMetadata);
  };

  private onTimeUpdate = (e: Event) => {
    const _currentTime = Math.floor(this.video.currentTime);
    if (_currentTime !== this.currentTime) {
      this.fire('timeupdate', _currentTime);
      this.currentTime = _currentTime;
    }
  };

  public changeBitrate(index: BitrateLevel['index']): void {
    throw new Error('Method not implemented.');
  }

  public changeAudioTrack(index: number): void {
    throw new Error('Method not implemented.');
  }

  public changeSubtitle(index: number): void {
    // throw new Error('Method not implemented.');
    if (this.video.querySelectorAll('track').length) {
      const tracks = this.video.querySelectorAll('track');
      tracks.forEach((trackEl) => (trackEl.track.mode = 'disabled'));
      this.fire('cueChange', -1);
      if (index > -1) {
        const currentTrackEl = this.video.querySelectorAll('track')[index];
        currentTrackEl.track.mode = 'hidden';
        currentTrackEl.track.oncuechange = (e) => this.fire('cueChange', e);
        if (currentTrackEl.dataset['src']) {
          (async () => {
            const { data } = await axios.get(currentTrackEl.dataset['src']);
            const blob = new Blob([data], { type: 'text/vtt' });
            currentTrackEl.src = URL.createObjectURL(blob);
          })();
        }
      }
    }
  }

  get aspectRatio(): number {
    if (this.size == null || this.size.width == 0 || this.size.height == 0) return 1;

    let _aspectRatio: number = +this.size.width / +this.size.height;

    if (_aspectRatio <= 0) return 1;

    return _aspectRatio;
  }

  get initialized(): boolean {
    return this.duration != null;
  }

  get hasError(): boolean {
    return this.errorDescription != null;
  }

  public handleAutoplay = () => {
    const autoplayEvent = 'loadedmetadata';

    return new Promise((resolve, reject) => {
      const _resolve = (e) => {
        resolve(e);
        this.video.removeEventListener(autoplayEvent, _resolve);
      };

      const addListener = () => {
        this.video.addEventListener(autoplayEvent, _resolve);
      };
      /**
       * ! No Safari todo autoplay deve ser muted.
       * * Mesmo que a promise retorne OK para autoplay com som, o safari (macOS e iOS)
       * * barra o playback. Nesse caso, a solução foi deixar todos os autoplays muted
       * * nesse ambiente
       */
      if (isSafari) this.video.muted = true;

      this.canAutoplay().then(async (autoplay) => {
        let mutedAutoplay = false;
        if (!autoplay) {
          autoplay = mutedAutoplay = await this.canMutedAutoplay();
          this.video.muted = mutedAutoplay;
        }

        if (autoplay) {
          addListener();
          // resolve(true)
          return;
        }

        reject();
      });
    }).catch((response) => {
      //loggerSingleton.log(`[PLAYER] Autoplay indisponível`)
    });
  };

  public initialize(autoSrc: boolean = true) {
    if (autoSrc) this.video.src = this.src;

    if (this.position) {
      this.video.addEventListener('loadedmetadata', this.onLoadedMetadata);
    }
    if (this.autoplay) {
      this.handleAutoplay().then(() => {
        this.play();
      });
    }
  }

  public play() {
    // Promise wrapped this way to catch both sync throws and async rejections.
    // More info: https://github.com/tc39/proposal-promise-try
    new Promise((resolve) => resolve(this.video.play())).catch(noop);
  }

  public pause() {
    this.video.pause();
  }

  public retry() {
    this.play();
    // this.mediator.notify(this, `player_retry`);
  }

  public seek(time: number) {
    if (this.video.readyState > 0 || this.video.readyState === undefined) {
      this.video.currentTime = time;
    }
  }

  public toggleMute() {
    this.video.muted = !!!this.video.muted;
  }

  public canAutoplay() {
    return canAutoplay({ muted: false });
  }

  public canMutedAutoplay() {
    return canAutoplay({ muted: true });
  }

  public clearElements(elements: NodeListOf<Element>) {
    for (var i = 0; i < elements.length; i++) {
      this.video.removeChild(elements[i]);
    }
  }

  public destroy() {
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
      //TODO: Checar em lives
      this.video.currentTime = 0;
    }

    this.video.removeEventListener('timeupdate', this.onTimeUpdate);

    // for (const e of playerEvents) {
    //   this.video.removeEventListener(e, this.notify);
    // }
  }
}

export default Player;
