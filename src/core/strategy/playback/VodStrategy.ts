import type { PlaybackStrategy } from './Strategy';
import type { Media } from '$/model/Media';
import { getPlayback } from '$/service/Playback';

export class VodStrategy implements PlaybackStrategy {
  async mount(media: Media) {
    const playback = await getPlayback({
      id: media.id,
      type: 'vod'
    });

    return { playback };
  }
}
