import type { Media } from '$/model/Media';
import type { PlaybackStrategy, PlaybackStrategyReturn } from './Strategy';

export class Playback {
  strategies: Record<string, PlaybackStrategy> = {};
  use(type: Media['type'], strategy: PlaybackStrategy) {
    this.strategies[type] = strategy;
  }
  create(media: Media): PlaybackStrategyReturn {
    if (!this.strategies[media.type]) {
      console.error('Playback policy has not been set!');
      return null;
    }
    return this.strategies[media.type].mount.apply(null, [media]);
  }
}
