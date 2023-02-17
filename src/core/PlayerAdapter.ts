import type EngineAdapter from './engine/abstract/EngineAdapter';
import type { PlayerParams } from '$/model/Player';
import Player from './Player';

export default class PlayerAdapter implements EngineAdapter {
  static create(params: PlayerParams) {
    console.log(params);

    const player = new Player(params);
    player.initialize();

    return player;
  }
}
