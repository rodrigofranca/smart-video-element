import type { PlayerParams } from '$/model/Player';
import type EngineAdapter from '../abstract/EngineAdapter';
import HlsJs from './HlsJs';

export default class HlsJsAdapter implements EngineAdapter {
  static create(params: PlayerParams) {
    const hls = new HlsJs(params);

    hls.onReady.then(() => {
      hls.initialize();
    });

    return hls;
  }
}
