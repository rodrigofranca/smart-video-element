import type Player from '$/core/Player';
import type IMASdk from '$/core/engine/ima/IMASdk';
import type { PlaybackImaEvents } from '$/core/engine/ima/IMASdk';
import type { Mediator } from '$/model/Mediator';
import type { PlaybackEvents } from '$/model/PlayerEvents';
import type { GA } from '$/metrics/GA';
import { EventEmitter } from 'events';
import { Logger, loggerSingleton } from '$/service/Logger';
import { inView, type InView } from '$/utils/inview';
import { isIOS } from '$/utils';

type Actions = {
  [key in PlaybackEvents]?: (event?) => void;
} & {
  [key in PlaybackImaEvents]?: (event?) => void;
};

/**
 * O Player Mediator faz todo controle de playback.
 * Ele recebe uma instancia de player e uma de ima,
 * recebe as notificações enviada pelos dois e executa a orquestração.
 * O Player Mediator também dispara os eventos necessários para seus ouvintes
 */
export class PlayerMediator extends EventEmitter implements Mediator {
  private _actions: Actions;
  private _initialPlay: boolean = true;
  /**
   * Indica se um ad está em execução
   */
  private _adsActive: boolean = false;
  /**
   * Indica se a execução de todos os ads foi concluida
   */
  private _adsDone: boolean = false;
  /**
   * Indica se a execução do video terminou
   */
  private _videoDone: boolean = false;
  private _firstPlay: boolean = true;

  private player: Player;
  private metrics: GA;
  private ima: IMASdk;
  private ui: any;
  private logger: Logger = loggerSingleton;

  public isInView: InView;

  private _muted = true;
  public get muted() {
    return this._muted;
  }
  public set muted(value) {
    this._muted = value;
  }

  private _isUserClicked: boolean = false;
  public get isUserClicked(): boolean {
    return this._isUserClicked;
  }
  public set isUserClicked(value: boolean) {
    this._isUserClicked = value;
  }

  public get isPlayingAd() {
    return this._adsActive;
  }

  private _playbackStatus:
    | 'adWaitingStart'
    | 'adPlaying'
    | 'adPaused'
    | 'adEnded'
    | 'videoPlaying'
    | 'videoPaused'
    | 'videoEnded';

  constructor({
    player,
    metrics,
    ima,
    ui
  }: {
    player: Player;
    metrics: GA;
    ima: IMASdk;
    ui: any;
  }) {
    super();

    this.player = player;
    this.player.setMediator(this);

    if (ima) {
      this.ima = ima;
      this.ima.setMediator(this);
      this._playbackStatus = 'adWaitingStart';
    }

    this.metrics = metrics;
    this.ui = ui;

    this._muted = this.player.video.muted;
    this._actions = this.buildActions();

    //TODO: Jogar para o fantascope-player.tsx
    this.isInView = inView({ target: this.player.video, considerArea: true });

    this.ui.addListener('playrequest', () => {
      this.metrics.click('play', this.getGaClickInfo());
      this.play();
    });
    this.ui.addListener('pauserequest', () => {
      this.metrics.click('pause', this.getGaClickInfo());
      this.pause();
    });
    this.ui.addListener('muterequest', () => {
      this.metrics.click('mute', this.getGaClickInfo());
      this.ima.mute();
    });
    this.ui.addListener('unmuterequest', () => {
      this.metrics.click('unmute', this.getGaClickInfo());
      this.ima.setVolume(this.player.video.volume);
    });
    this.ui.addListener('volumerequest', () =>
      this.ima?.setVolume(this.player.video.volume)
    );
  }

  public notify(_: object, event: PlaybackEvents, e) {
    if (this.player || this.ima) {
      if (this._actions[event]) {
        this._actions[event](e);
      }
    }
  }

  public play() {
    if (this.ima && (this._initialPlay || this._adsActive)) {
      this._playbackStatus === 'adWaitingStart' && this.ima.play();
      this._playbackStatus === 'adPaused' && this.ima.resume();
    } else {
      this.player.play();
    }
  }

  public pause() {
    if (this.ima && this._adsActive) {
      this.ima.pause();
    } else {
      this.player.pause();
    }
  }

  private buildActions = () => {
    return {
      /** Player Actions */
      player_loadeddata: () => {
        this.logger.log('', 'MEDIALOADED', {}, true);
      },
      player_playing: () => {
        this._initialPlay = false;
        this._videoDone = false;
        this._playbackStatus = 'videoPlaying';

        if (this._firstPlay) {
          this._firstPlay = false;
          this.logger.log('', 'MEDIASTARTED', {}, true);
          this.metrics.event('start', this.getGaVideoInfo());
        }

        this.emit('play');
      },
      player_pause: () => {
        this._playbackStatus = 'videoPaused';
        this._videoDone = false;

        this.logger.log('', 'PAUSED', {}, true);

        this.emit('pause');
      },
      player_seeked: () => {
        this.logger.log('', 'SEEKED', {}, true);
      },
      player_waiting: () => {
        this.logger.log('', 'WAITING', {}, true);
      },
      player_ratechange: () => {},
      player_retry: () => this.ima?.destroy(),
      player_error: () => {
        this.logger.log('', 'ERROR', {}, true);
        this.metrics.event('error');
      },
      player_volumechange: (event) => {
        this._muted = event.target.muted;
        this.logger.log('', 'VOLUME CHANGED', {}, true);
      },
      player_ended: () => {
        this._videoDone = true;
        this._playbackStatus = 'videoEnded';

        this.ima?.contentEnded();

        this.metrics.event('complete', this.getGaVideoInfo());

        if (!this.ima?.contentEnded || this._adsDone) this.emit('ended');

        this.logger.log('player_ended');
      },
      /** IMA Sdk Actions */
      // ima_ad_metadata: () =>{
      //   this.logger.log('', "ADMETADATA", {}, true)
      // },
      ima_ad_request: () => {
        this._initialPlay = false;

        this.logger.log('ima_ad_requested');
      },
      ima_started: () => {
        this._adsActive = true;
        this._adsDone = false;
        this._playbackStatus = 'adPlaying';

        this.player.pause();

        this.logger.log(`ima_started ${this.ima.getAdPosition()}`);
        this.logger.log('', 'ADBEGIN', {}, true);

        this.metrics.event('adstart', this.getGaAdInfo());

        if (isIOS) this.ui.exitFullscreen();

        this.emit('play');
      },
      ima_first_quartile: () => {
        this.metrics.event('ad25', this.getGaAdInfo());
        this.logger.log('ima_first_quartile');
      },
      ima_midpoint: () => {
        this.metrics.event('ad50', this.getGaAdInfo());
        this.logger.log('ima_midpoint');
      },
      ima_third_quartile: () => {
        this.metrics.event('ad75', this.getGaAdInfo());
        this.logger.log('ima_third_quartile');
      },
      ima_ad_end: () => {
        const adPosition = this.ima.getAdPosition();

        if (this._adsActive) {
          this.metrics.event('adcomplete', this.getGaAdInfo());
          this.logger.log('ima_ad_end');
        } else {
          this.logger.log('ima_ad_end: no ads found');
          this._adsDone = true;
        }

        this._adsActive = false;
        this._playbackStatus = 'adEnded';

        if (adPosition !== 'post-roll') this.player.play();
      },
      ima_paused: () => {
        this._playbackStatus = 'adPaused';

        this.logger.log('ima_paused');

        this.emit('pause');
      },
      ima_resumed: () => {
        this._playbackStatus = 'adPlaying';

        this.logger.log('ima_resumed');

        this.emit('play');
      },
      ima_ad_error: () => {
        this.logger.log('', 'ADERROR', {}, true);
      },
      ima_all_ads_completed: () => {
        console.log('all ads completed');

        this._adsDone = true;
        this._adsActive = false;

        if (this._videoDone) this.emit('ended');
      }
    };
  };

  private getGaVideoInfo = () => {
    return {
      mute: this._muted,
      nonInteraction: !!!this._isUserClicked,
      mediaType: 'video'
    };
  };

  private getGaAdInfo = () => {
    return {
      mute: this._muted,
      adPosition: this.ima.getAdPosition(),
      nonInteraction: !!!this._isUserClicked,
      mediaType: 'video-ad'
    };
  };

  private getGaClickInfo = () => {
    return {
      mute: this.muted,
      mediaType: this.isPlayingAd ? 'video-ad' : 'video'
    };
  };

  get paused() {
    return (
      this._initialPlay ||
      this._playbackStatus === 'videoPaused' ||
      this._playbackStatus === 'adPaused'
    );
  }

  public destroy() {
    this.removeAllListeners();
    this.ima?.destroy();
    this.player?.destroy();
    this.player = null;
    this.ima = null;
  }
}
