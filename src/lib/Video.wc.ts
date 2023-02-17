import Video from '$/lib/Video.svelte';
import { SmartPlayer } from '$/core/SmartPlayer';

const tagName = 'smart-player';

const availableProps = [
  'autoplay',
  'controls',
  'crossorigin',
  'loop',
  'muted',
  'playsinline',
  'poster',
  'preload',
  'src',
  'full'
];

export default SmartPlayer(tagName, Video, availableProps);
