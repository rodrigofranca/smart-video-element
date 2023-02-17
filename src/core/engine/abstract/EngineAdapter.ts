import type { PlayerParams } from '$/model/Player';

abstract class IEngineAdapter {
  static create: (params: PlayerParams) => void;
}

export default class EngineAdapter extends IEngineAdapter {
  static create = (params: PlayerParams) => {};
}
