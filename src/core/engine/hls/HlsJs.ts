import type { BitrateLevel, PlayerParams, QualityLevel } from '$/model/Player';
import Player from '$/core/Player';
import { delay, info, isUndefined, loadSDK, sortNumbers, stringToBoolean } from '$/utils';
import * as qs from '$/utils/qs';
import type { Subtitle } from '$/context/PlayerContext.svelte';

/**
 * Essa classe carrega o hls.js de modo assincrono,
 * configura um playback a partir do .m3u8
 * e aplica drm se necessário
 */
class HlsJs extends Player {
  private hls: any;
  private Hls: any;
  private config: any;
  // private alternatives;
  private origAlternatives;
  private loader;
  private loadingTimeout = 4000;
  private loadTimeoutCount = 0;
  private recoverTake = 0;
  /**
   * The NPM package version of the `hls.js` library to download and use if HLS is not natively
   * supported.
   */
  // private version = 'latest';
  /**
   * The URL where the `hls.js` library source can be found. If this property is used, then the
   * `version` property is ignored.
   */
  // private libSrc:string = `//cdn.jsdelivr.net/npm/hls.js@${this.version}/dist/hls.min.js`;
  private libSrc = `//player.fantascope.uol.com.br/lib/hls.min.js`;

  /**
   * Readiness design pattern
   * "Don't put the object in a promise, put a promise in the object."
   * @see https://pdconsec.net/blogs/devnull/asynchronous-constructor-design-pattern
   */
  public onReady: Promise<any>;

  public bitrateLevels: any[];
  public audioTrackLevels: any[];
  public subtitles: Subtitle[];

  private runtimeEvents: any;

  constructor({
    src,
    video,
    controls,
    autoplay,
    position,
    volume,
    drm,
    alternatives,
    isLive
  }: PlayerParams) {
    super({ src, video, controls, autoplay, position, volume, drm });

    this.alternatives = alternatives;
    this.origAlternatives = { ...alternatives };
    this.loader = this.video.parentNode.querySelector('.static-loader');
    this.isLive = isLive;
    this.drm = drm;

    this.src = src.replace(/^http:/, 'https:');
    const resourceParts = src?.split('?')?.[0].match(/.*\.(.*)$/) || [];
    const isHls = resourceParts.length > 1 && resourceParts[1].toLowerCase() === 'm3u8';

    if (!isHls) throw new Error('is not a valid .m3u8 file');

    this.config = {
      debug: stringToBoolean(qs.get('debug')),
      startPosition: this.position,
      enableWorker: info.browser === 'Firefox' ? false : true
    };

    if (this.drm) {
      this.config = {
        ...this.config,
        emeEnabled: true,
        widevineLicenseUrl: drm.licenseServer,
        // @ts-ignore
        licenseXhrSetup: (xhr: XMLHttpRequest, url: string) => {
          xhr.withCredentials = true;
          if (drm.token) xhr.setRequestHeader('Authorization', `Bearer ${drm.token}`);
        }
      };
    }
    /**
     * Fine Tuning
     * @see https://github.com/video-dev/hls.js/blob/master/docs/API.md#fine-tuning
     */
    if (isLive) {
      this.config = {
        ...this.config,
        levelLoadingRetryDelay: 500,
        manifestLoadingRetryDelay: 500,
        fragLoadingRetryDelay: 500,
        levelLoadingTimeOut: this.loadingTimeout,
        manifestLoadingTimeOut: this.loadingTimeout,
        fragLoadingTimeOut: this.loadingTimeout,
        lowLatencyMode: false
      };
    }

    this.config = {
      ...this.config,
      xhrSetup: (xhr: XMLHttpRequest, url: string) => {
        // xhr.withCredentials = true;
        xhr.addEventListener(
          'readystatechange',
          () => {
            if (xhr.readyState === 4 && xhr.status === 0) {
              console.log('[XHR ERROR]', 'possibly canceled', url);
            }
          },
          false
        );
      }
    };

    this.onReady = new Promise((resolve, reject) => {
      this.setupHls(this.config).then(resolve).catch(reject);
    });

    console.log('Powered by Hls.js');
  }

  public initialize() {
    try {
      this.hls.loadSource(this.src);
      this.hls.attachMedia(this.video);

      if (this.position) this.hls.startLoad(this.position);

      if (this.autoplay) {
        this.handleAutoplay().then(() => {
          this.play();
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  private async setupHls(config) {
    try {
      if (isUndefined(this.Hls)) this.Hls = (await loadSDK(this.libSrc, 'Hls')) as any;

      console.log('[HLS version]', this.Hls.version);

      if (!this.Hls.isSupported()) {
        console.error('hls.js is not supported');
        return;
      }

      this.hls = new this.Hls(config);
      this.hls.subtitleDisplay = true;

      this.runtimeEvents = {
        [this.Hls.Events.MANIFEST_LOADED]: (event, data) => {
          if (data.levels.length) {
            const _bitrateLevels = data.levels
              .map(
                (quality, index): BitrateLevel => ({
                  id: index,
                  index: index,
                  resolution: quality.height,
                  bitrate: quality.bitrate
                })
              )
              .reverse();
            this.fire('bitrateLevels', _bitrateLevels);
          }

          if (data.audioTracks.length > 0) {
            const _audioTrackLevels = data.audioTracks.map((audioTrack, index) => ({
              id: audioTrack.id,
              index: index,
              name: audioTrack.name,
              lang: audioTrack.lang
            }));
            // console.log(this.hls.audioTracks, data.audioTracks);
            this.fire('audioTrackLevels', _audioTrackLevels);
          }
          let _subtitles = [];
          if (data.subtitles.length > 0) {
            _subtitles = data.subtitles.map((subtitle, index) => {
              if (subtitle.default) {
                this.changeSubtitle(index);
              }
              return {
                id: subtitle.id,
                index: index,
                name: subtitle.name,
                lang: subtitle.lang,
                src: subtitle.url,
                default: subtitle.default
              };
            });
          }
          this.subtitles = _subtitles;
          this.fire('subtitleLevels', _subtitles);
        },
        [this.Hls.Events.LEVEL_SWITCHED]: (event, data) => {
          this.fire('bitrateChange', {
            auto: this.hls.autoLevelEnabled,
            level: data.level
          });
        },
        [this.Hls.Events.AUDIO_TRACK_SWITCHED]: (event, data) => {
          this.fire('audioTrackChange', data.id);
        }
      };

      for (const event in this.runtimeEvents) {
        this.hls.on(event, this.runtimeEvents[event]);
      }

      const doRetry = () => {
        if (this.loadTimeoutCount >= 2) {
          this.retryPlayback();
          this.loadTimeoutCount = 0;
        } else {
          this.loadTimeoutCount++;
        }
      };

      this.hls.on(this.Hls.Events.ERROR, async (_, data) => {
        // console.log(data.fatal ? '[FATAL ERROR]' : '[ERROR]', data.type, data.details);

        /**
         * Tratamento de erro fatal
         */
        if (data.fatal) {
          switch (data.type) {
            case this.Hls.ErrorTypes.MEDIA_ERROR:
              console.log('Fatal media error encountered, try to recover');
              if (this.recoverTake == 1) {
                this.hls.swapAudioCodec();
              }
              this.hls.recoverMediaError();
              this.recoverTake++;
              break;
            case this.Hls.ErrorTypes.NETWORK_ERROR:
              console.log('Fatal network error encountered, try to recover');

              if (
                data.details === this.Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                data.details === this.Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT
              ) {
                console.log('[error]', data.details);
                this.recoverTake++;
                this.retryPlayback(true);
              } else {
                this.hls.startLoad();
              }
              break;
            default:
              console.log('Fatal error encountered, cannot recover');
              // this.mediator.notify(this, 'player_error', data.details);
              // cannot recover
              console.log('[error] Fatal error encountered, cannot recover');
              this.recoverTake++;
              this.retryPlayback(true);
              // this.hls.destroy();
              break;
          }
          return;
        }

        switch (data.details) {
          case this.Hls.ErrorDetails.BUFFER_STALLED_ERROR:
            console.log(
              '[error] Buffer stalled, possibly a Discontinuity appeared, trying to recover in 5s...'
            );
            const startSeconds = this.video.currentTime;
            await delay(5000);
            if (startSeconds === this.video.currentTime) {
              console.log('[error] Stream stucked, retrying');
              this.retryPlayback();
            }

            break;
          case this.Hls.ErrorDetails.BUFFER_NUDGE_ON_STALL:
            console.log('Buffer nudge on stall, possibly stucked, trying to recover...');
            break;
          case this.Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
            console.log('[error] LevelLoadTimeout count:', this.loadTimeoutCount);
            doRetry();
            break;
          case this.Hls.ErrorDetails.LEVEL_LOAD_ERROR:
            console.log('[error] LevelLoadError count:', this.loadTimeoutCount);
            doRetry();
            break;
          case this.Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
            console.log('[error] FragLoadTimeout count:', this.loadTimeoutCount);
            doRetry();
            break;
          case this.Hls.ErrorDetails.FRAG_LOAD_ERROR:
            console.log('[error] FragLoadError count:', this.loadTimeoutCount);
            doRetry();
            break;
          default:
            this.hls.recoverMediaError();
            break;
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  private retryPlayback = (manifestRetry = false) => {
    const paused = this.video.paused;
    const index = sortNumbers(0, (this.alternatives?.length ? this.alternatives?.length : 0) - 1);
    const currentTime = this.video.currentTime;
    const autoplay = this.autoplay;

    this.video.pause();
    this.loader['show'] = true;

    this.src = this.alternatives[index];

    if (!this.src) {
      this.destroy();
      // this.mediator.notify(this, 'fatal_error');
      return;
    }
    if (this.alternatives.length === 0) {
      if (manifestRetry) {
        const url = new URL(this.src);
        //TODO: Checar em caso de DRM
        url.hostname = 'storage.mais.uol.com.br';
        console.log('[RETRY MANIFEST]', url.href);
        this.alternatives.push(url.href);
      } else {
        this.alternatives = { ...this.origAlternatives };
      }
    }
    this.src = this.alternatives.shift();

    if (!!this.src?.search(/^http[s]?:\/\//)) this.src = 'https://' + this.src;

    this.hls.loadSource(this.src);

    if (!this.isLive) this.video.currentTime = currentTime;

    if (this.isLive) {
      const recoverOnEdge = async () => {
        let edge;
        if (this.video.duration !== Infinity) edge = this.video.duration;
        else if (this.video?.seekable.length > 0) edge = this.video?.seekable?.end(0);

        console.log('[recover position]', 'currentTime', this.video.currentTime, 'edge', edge);

        if (!edge) {
          console.log('[rebuild playback]', 'edge not found');
          this.destroy();
          await delay(1000);
          this.initialize();
          return;
        }

        if (this.video.currentTime < edge - 120) {
          console.log('[RETRY SEEK]', this.video.currentTime, edge);
          this.video.currentTime = edge - 120;
        }

        this.video.removeEventListener('canplaythrough', recoverOnEdge);
      };
      this.video.addEventListener('canplaythrough', recoverOnEdge);
    }

    if (!paused) {
      this.video.autoplay = true;
      this.play();
    }

    if (!autoplay) this.loader['show'] = false;
  };

  private removeLoader = () => (this.loader['show'] = false);

  public changeBitrate(index: BitrateLevel['index']): void {
    this.hls.currentLevel = index;
  }
  public changeAudioTrack(index: number): void {
    // console.log(index);
    // console.log(this.hls.audioTracks);
    this.hls.audioTrack = index;
  }
  public changeSubtitle(index: number): void {
    if (!this.hls.subtitleTracks.length) {
      super.changeSubtitle(index);
    } else {
      this.hls.subtitleTrack = index;
      this.video.textTracks[index].oncuechange = (e) => {
        this.fire('cueChange', e);
      };
      if (index === -1) {
        this.fire('cueChange', -1);
      }
    }
  }

  public destroy = () => {
    super.destroy();
    this.hls?.destroy();
    for (const event in this.runtimeEvents) {
      this.hls.off(event, this.runtimeEvents[event]);
    }
    this.video.removeEventListener('playing', this.removeLoader);
  };
}

export default HlsJs;
