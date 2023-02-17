import type { PlayerParams } from '$/model/Player';
import type { Playback } from '$/model/Playback';
import type { PlaybackFormat } from '$/model/Playback';
import type { Engines } from '$/model/Engines';
import type EngineAdapter from './abstract/EngineAdapter';
// import { engineAdapter } from './-EngineAdapter';
import { isIOS, isSafari } from '$/utils/utils';
import DashJsAdapter from './dash/DashJsAdapter';
import HlsJsAdapter from './hls/HlsJsAdapter';
import PlayerAdapter from '$/core/PlayerAdapter';

export const engineAdapter: EngineAdapter = {
  dashjs: DashJsAdapter,
  hlsjs: HlsJsAdapter,
  simple: PlayerAdapter
};

export default class EngineFactory {
  static create(video: HTMLVideoElement, playback: Playback, autoplay: boolean) {
    const { src, controls, position, volume } = playback;

    const playerParams: PlayerParams = {
      src,
      controls,
      autoplay,
      position,
      volume,
      video
    };

    if (playback.type === 'stream') playerParams.isLive = true;

    if (playback.format === 'simple') playback.type = 'vod';

    if (playback.drm) playerParams.drm = playback.drm;

    const engines: Record<PlaybackFormat, Engines> = {
      dash: 'dashjs',
      hls: 'hlsjs',
      simple: 'simple'
    };

    if (!playback.engine) playback.engine = engines[playback.format];

    if (isIOS || isSafari) playback.engine = 'simple';

    return engineAdapter[playback.engine].create(playerParams);
  }
}
