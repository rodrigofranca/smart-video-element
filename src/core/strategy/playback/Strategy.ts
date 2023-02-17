import type { Media } from '$/model/Media';
import type { Playback } from '$/model/Playback';
import type { Collection, Entry } from '$/model/Collection';
import type { Episode } from '$/model/Collection';

export type PlaybackStrategyReturn = Promise<{
  playback?: Playback;
  entry?: Entry;
  episode?: Episode;
  collection?: Collection;
}>;
export interface PlaybackStrategy {
  mount(media: Media): PlaybackStrategyReturn;
}
