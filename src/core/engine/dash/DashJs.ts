import type { BitrateLevel, PlayerParams, QualityLevel } from '$/model/Player';
import type { Drm } from '$/model/Drm';
// import type Dash from './Dash';
import Player from '$/core/Player';
import { info, isUndefined, loadSDK } from '$/utils';
import { Events } from './DashJsEvents';
import type Dash from './Dash';
import type { DashAdapter, MediaPlayerClass } from './Dash';

/**
 * Essa classe carrega o dash.js de modo assincrono,
 * configura um playback a partir do .mpd
 * e aplica drm se necessário
 */
//TODO Criar interface DRMPlayer
class DashJs extends Player {
  // public video:HTMLVideoElement;
  // public src:string;

  // public drm: Drm;
  /**
   * Instância do player Dash
   */
  private dash: MediaPlayerClass;
  /**
   * Módulo do DashJs carregado dinamicamente
   */
  private Dash: any;

  /**
   * The NPM package version of the `hls.js` library to download and use if HLS is not natively
   * supported.
   */
  private version = 'latest';

  /**
   * Readiness design pattern
   * "Don't put the object in a promise, put a promise in the object."
   * @see https://pdconsec.net/blogs/devnull/asynchronous-constructor-design-pattern
   */
  public onReady: Promise<any>;

  public qualityLevels: QualityLevel[];
  public bitrateLevels: Dash.BitrateInfo[];
  public audioTrackLevels: Dash.MediaInfo[];

  /**
   * The URL where the `hls.js` library source can be found. If this property is used, then the
   * `version` property is ignored.
   */
  private libSrc: string = `//cdn.dashjs.org/${this.version}/dash.all.min.js`;

  // public emitter = new EventEmitter();

  constructor({
    src,
    video,
    controls,
    position,
    volume,
    drm,
    autoplay
  }: PlayerParams) {
    super({ src, video, controls, volume, position });

    this.position = position;
    this.video = video;
    this.src = src.replace(/^http:/, 'https:');
    this.drm = drm;
    this.autoplay = autoplay;

    const resourceParts = src.split('?')[0].match(/.*\.(.*)$/) || [];
    const isDash =
      resourceParts.length > 1 && resourceParts[1].toLowerCase() === 'mpd';

    if (!isDash) throw new Error('is not a valid .mpd file');

    console.warn('[Fantascope Player]', 'Powered by Dash.js');

    this.onReady = new Promise((resolve, reject) => {
      this.setupDash().then(resolve).catch(reject);
    });
  }

  public initialize() {
    this.position =
      info.browser === 'Firefox' && this.position === 0 ? 0.5 : this.position;

    this.dash.initialize(this.video, this.src, this.autoplay, this.position);
  }

  private async setupDash() {
    try {
      if (isUndefined(this.Dash))
        this.Dash = await loadSDK(this.libSrc, 'dashjs');

      this.dash = this.Dash.MediaPlayer().create();

      if (this.drm) this.configDrm(this.drm);

      this.dash.on(Events.MANIFEST_LOADED, (e) => {
        // const _qualityLevels = (e.data as any).Period.AdaptationSet[0]
        // .Representation_asArray;
        // console.log(e.data);
        // this.qualityLevels = _qualityLevels.map(
        //   (quality, index): QualityLevel => ({
        //     id: parseInt(quality.id),
        //     index,
        //     resolution: quality.height,
        //     bandwidth: quality.bandwidth
        //   })
        // );
        // this.fire('qualityLevels', this.qualityLevels);
      });
      this.dash.on(Events.QUALITY_CHANGE_REQUESTED, (e) => {
        // console.log('quality change request', e);
      });
      this.dash.on(Events.QUALITY_CHANGE_RENDERED, (e) => {
        if (e.mediaType !== 'video') return;
        const isAuto =
          this.dash.getSettings().streaming.abr.autoSwitchBitrate.video;
        this.fire('bitrateChange', {
          auto: isAuto,
          level: e.newQuality
        });
      });
      this.dash.on(Events.PLAYBACK_METADATA_LOADED, (e) => {
        // console.log(Events.PLAYBACK_METADATA_LOADED);
        // console.log(this.dashPlayer.getBitrateInfoListFor('video'));
        // console.log(this.dashPlayer.getQualityFor('video'));

        this.bitrateLevels = this.dash.getBitrateInfoListFor('video');
        this.audioTrackLevels = this.dash.getTracksFor('audio');

        const _bitrateLevels = this.bitrateLevels.reverse().map(
          (quality): BitrateLevel => ({
            id: quality.qualityIndex,
            index: quality.qualityIndex,
            resolution: quality.height,
            bitrate: quality.bitrate
          })
        );

        const _audioTrackLevels = this.audioTrackLevels.map(
          (audioTrack, index) => ({
            id: audioTrack.id,
            index: audioTrack.index,
            name: audioTrack.lang,
            lang: audioTrack.lang
          })
        );

        this.fire('bitrateLevels', _bitrateLevels);
        this.fire('audioTrackLevels', _audioTrackLevels);
      });
    } catch (e) {
      console.error('[fantascope]', e);
    }
  }

  // public changeQuality(level: QualityLevel): void {
  //   this.dashPlayer.setQualityFor('video', level.index);
  // }
  public changeBitrate(index: BitrateLevel['index']): void {
    if (index === -1) {
      this.setAutoQuality(true);
      this.fire('bitrateChange', index);
      return;
    }
    this.setAutoQuality(false);
    this.dash.setQualityFor('video', index, true);
  }
  public changeAudioTrack(index: number): void {
    console.log(this.audioTrackLevels[index]);
    this.dash.setCurrentTrack(this.audioTrackLevels[index]);
  }

  public setAutoQuality(value: boolean) {
    this.dash.updateSettings({
      streaming: {
        abr: {
          autoSwitchBitrate: { video: value }
        }
      }
    });
  }

  public destroy() {
    super.destroy();
    this.dash?.destroy();
    /**
     * ! Hack para manter o autoplay. o DashJs.destroy() remove a prop automaticamente
     */
    // this.video.autoplay = this.autoplay;
    // console.log('destroy', this.video.autoplay, this._autoplay, this.video);
  }

  /**
   * @see https://reference.dashif.org/dash.js/latest/samples/drm/widevine.html
   */
  private configDrm(params: Drm) {
    let httpRequestHeaders;

    if (params.token) {
      httpRequestHeaders = {
        Authorization: `Bearer ${params.token}`
      };
    }

    const drmData = {
      [params.type]: {
        serverURL: params.licenseServer,
        // withCredentials: true,
        httpRequestHeaders
      }
    };

    this.dash.registerLicenseRequestFilter((request) => {
      request.withCredentials = true;
      return Promise.resolve();
    });
    this.dash.setProtectionData(drmData);
  }
}

export default DashJs;
