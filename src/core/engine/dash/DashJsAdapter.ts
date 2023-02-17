import type EngineAdapter from '../abstract/EngineAdapter';
import type { PlayerParams } from '$/model/Player';
import DashJs from './DashJs';

export default class DashJsAdapter implements EngineAdapter {
  static create(params: PlayerParams) {
    const dash = new DashJs(params);

    dash.onReady.then(() => dash.initialize());

    return dash;
  }
}
