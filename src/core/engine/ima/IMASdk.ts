declare var google: any;

import { createEvent } from '$/utils/event';
import { loadSDK } from '$/utils/network';
import { isUndefined } from '$/utils/unit';
import { isIOS, isNullOrUndefined } from '$/utils/utils';
import { googleAdTags } from '$/constants';
// import { createEvent } from '$/components/UI/utils';
import * as qs from '$/utils/qs';
import type { Media } from '$/model/Media';

export type ImaAdTagConfig = {
  // codProfile: string,
  // tags: string,
  type: Media['type'];
  iuDFP: string;
  size: string;
  mediaId: number;
  url: string;
};

export type ImaParams = {
  video: HTMLVideoElement;
  displayContainer: HTMLElement;
  tag?: string;
  continuousPlayback?: boolean;
  adsRequestOptions?: {
    liveStreamPrefetchSeconds?: number;
  };
};

export const imaEvents = [
  'ad_begin',
  'ad_end',
  'ad_non_linear',
  'ad_play',
  'ad_play_intent',
  'ad_request',
  'ad_request_intent',
  'ad_stop',
  'ad_stop_intent',
  'ads_manager',
  'ads_manager_loaded',
  'ads_rendering_settings',
  'error',
  'ad_break_ready',
  'ad_buffering',
  'ad_can_play',
  'ad_error',
  'ad_metadata',
  'ad_progress',
  'all_ads_completed',
  'click',
  'complete',
  'content_pause_requested',
  'content_resume_requested',
  'duration_change',
  'first_quartile',
  'impression',
  'interaction',
  'linear_changed',
  'loaded',
  'log',
  'midpoint',
  'paused',
  'resumed',
  'skippable_state_changed',
  'skipped',
  'started',
  'third_quartile',
  'user_close',
  'video_clicked',
  'video_icon_clicked',
  'viewable_impression',
  'volume_changed',
  'volume_muted'
] as const;
export type ImaEvents = typeof imaEvents[number];
export type PlaybackImaEvents = `ima_${typeof imaEvents[number]}`;

const forcedfp = qs.get('forcedfp');

const customAdTag = () => {
  if ((window as any)?.DYNAD_TV?.config?.URL_VAST) {
    const adTag = (window as any)?.DYNAD_TV?.config?.URL_VAST;
    console.log('[UOLPlayer] usando url VAST customizada: ' + adTag);
    return adTag;
  } else {
    return undefined;
  }
};

export const createAdTag = (config: ImaAdTagConfig) => {
  if (forcedfp && googleAdTags[forcedfp]) return googleAdTags[forcedfp];

  let _customAdTag = customAdTag();

  if (_customAdTag) {
    console.warn('[FantascopePlayer] usando url VAST customizada: ' + _customAdTag);
    return _customAdTag;
  }

  if (!config.iuDFP) {
    console.warn('[FantascopePlayer] DFP desligado');
    return undefined;
  }

  let customDataLayer = '',
    customParam = {},
    urlDFP = '',
    iuDFP = config.iuDFP,
    videoplayertype = '%26videoplayertype%3Dhtml5';

  customParam = videoplayertype + customDataLayer;

  urlDFP =
    'https://' +
    'pubads.g.doubleclick.net/gampad/ads?' +
    'sz=' +
    (config.size || '640x480') +
    '&gdfp_req=1' +
    '&iu=' +
    iuDFP +
    '&ciu_szs=300x250' +
    '&url=[referrer_url]' +
    '&correlator=[timestamp]' +
    '&env=vp' +
    '&unviewed_position_start=1' +
    '&output=vast' +
    '&impl=s' +
    '&vid=' +
    config.mediaId +
    '&description_url=' +
    config.url +
    '&cust_params=' +
    customParam;

  console.log('[FantascopePlayer] DFP adTag: ' + urlDFP);

  return urlDFP;
};

/**
 * Essa classe carrega o imasdk de modo assincrono,
 * configura todo o fluxo de publicidade e dispara seus eventos
 */
class IMASdk {
  imaAdPlayer: any; //SDK
  ima: any;
  version = 'latest';
  parameters: ImaParams;
  resizeObserver: ResizeObserver;

  podIndex: number = undefined;
  duration: number = 0;

  private libSrc = `//player.fantascope.uol.com.br/lib/ima-ad-player.min.js`;
  // private libSrc = `https://cdn.jsdelivr.net/npm/ima-ad-player@${this.version}/dist/ima-ad-player.min.js`

  private _paused = true;
  public get paused() {
    return this._paused;
  }

  private _isPlaying = false;
  public get isPlaying() {
    return this._isPlaying;
  }

  /**
   * Readiness design pattern
   * "Don't put the object in a promise, put a promise in the object."
   * @see https://pdconsec.net/blogs/devnull/asynchronous-constructor-design-pattern
   */
  public onReady: Promise<any>;

  constructor(parameters?: ImaParams) {
    this.parameters = parameters;
    this.onReady = this.setupIMA(parameters);

    console.log('Powered by ima-ad-player');
  }

  private async setupIMA(config?: ImaParams) {
    if (!isUndefined(this.imaAdPlayer)) return;

    try {
      await loadSDK('https://imasdk.googleapis.com/js/sdkloader/ima3.js', 'google');

      if (isIOS) google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true);

      this.imaAdPlayer = (await loadSDK(this.libSrc, 'ImaAdPlayer')) as any;

      return new Promise((resolve, reject) => {
        this.imaAdPlayer(config, (ima, error) => {
          //TODO Adicionar log error
          if (error) return reject(error);

          ima.on('started', (e) => {
            this._paused = false;

            const adInstance = e.data?.getAd();
            if (adInstance) {
              const adPod = adInstance?.getAdPodInfo();
              this.podIndex = adPod && adPod.getPodIndex();
              this.duration = adInstance?.getDuration();
            } else {
              this.podIndex = undefined;
            }
          });
          ima.on('resumed', () => (this._paused = false));
          ima.on('paused', () => {
            this._paused = true;
          });
          ima.on('ad_request', () => (this.podIndex = undefined));
          ima.on('ad_begin', () => {
            this._isPlaying = true;
            this.parameters.displayContainer.style.display = 'initial';
          });
          ima.on('ad_end', () => {
            this._isPlaying = false;
            this.parameters.displayContainer.style.display = 'none';
          });
          ima.on('log', (response) => {
            console.log('LOG', response.data.getAdData().adError);
          });

          for (const event of imaEvents) {
            ima.on(event, (response) => {
              // console.log('ima', event);
              this.parameters.displayContainer.dispatchEvent(
                createEvent(event, { ...response, duration: this.duration })
              );
            });
          }

          this.ima = ima;

          // this.createResizeObserver(this.parameters.video);

          resolve(ima);
        });
      });
    } catch (e) {
      console.error(e);
    }
  }

  // createResizeObserver(video: HTMLVideoElement) {
  //   this.resizeObserver = new ResizeObserver((entries) => {
  //     for (let entry of entries) {
  //       const cr = entry.contentRect;
  //       if (this.ima) this.ima.resize(cr.width, cr.height);
  //     }
  //   });
  //   this.resizeObserver.observe(video);
  // }

  destroyResizeObserver() {
    this.resizeObserver.disconnect();
  }

  public play() {
    this.onReady.then(() => {
      this.ima.play();
    });
  }

  public pause() {
    this.onReady.then(() => {
      this.ima.pause();
    });
  }

  public resume() {
    this.onReady.then(() => {
      this.ima.resume();
    });
  }

  public mute() {
    // this.onReady.then(() => {
    this.ima?.setVolume(0);
    // });
  }

  public getCurrentTime = () =>
    this.getRemainingTime() === -1 ? 0 : this.duration - this.getRemainingTime();

  public getCurrentPerc = () => Math.floor(100 * (this.getCurrentTime() / this.duration));

  public getRemainingTime = () => this.ima?.getRemainingTime();

  public setVolume(volume: number) {
    // this.onReady.then(() => {
    this.ima?.setVolume(volume);
    // });
  }

  public contentEnded() {
    this.onReady.then(() => {
      this.ima.ended();
    });
  }

  public getAdPosition() {
    var position: 'pre-roll' | 'post-roll' | 'mid-roll' = '' as any;

    if (!isNullOrUndefined(this.podIndex)) {
      switch (this.podIndex) {
        case 0:
          position = 'pre-roll';
          break;
        case -1:
          position = 'post-roll';
          break;
        default:
          position = 'mid-roll';
          break;
      }
    }

    return position;
  }

  public destroy = () => {
    // this.parameters.displayContainer.innerHTML = '';

    this.onReady.then(() => {
      this.ima?.stop();
      this.ima?.destroy();
      // this.destroyResizeObserver();
    });
  };
}

export default IMASdk;
