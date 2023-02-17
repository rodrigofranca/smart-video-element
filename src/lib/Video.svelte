<svelte:options accessors={true} />

<script lang="ts">
  import type { Playback, PlaybackFormat } from '$/model/Playback';
  import type Player from '$/core/Player';
  import { delay, getExtension } from '$/utils';
  import EngineFactory from '$/core/engine/EngineFactory';
  import { slotName } from '$/directives/useSlotName';

  /**
   * @see https://www.viget.com/articles/typing-components-in-svelte/
   */
  interface $$Props extends svelteHTML.HTMLAttributes<HTMLElementTagNameMap['video']> {
    src: HTMLVideoElement['src'];
    autoplay?: HTMLVideoElement['autoplay'];
    controls?: HTMLVideoElement['controls'];
    crossorigin?: HTMLVideoElement['crossOrigin'];
    loop?: HTMLVideoElement['loop'];
    muted?: HTMLVideoElement['muted'];
    playsinline?: HTMLVideoElement['playsInline'];
    poster?: HTMLVideoElement['poster'];
    preload?: HTMLVideoElement['preload'];
    full?: boolean;
    video?: HTMLVideoElement;
  }

  export let src: HTMLVideoElement['src'];
  export let autoplay: HTMLVideoElement['autoplay'] = null;
  export let controls: HTMLVideoElement['controls'] = null;
  export let crossorigin: HTMLVideoElement['crossOrigin'] = '';
  export let loop: HTMLVideoElement['loop'] = null;
  export let muted: HTMLVideoElement['muted'] = null;
  export let playsinline: HTMLVideoElement['playsInline'] = null;
  export let poster: HTMLVideoElement['poster'] = null;
  export let preload: HTMLVideoElement['preload'] = null;
  export let full: boolean = false;
  export let video: HTMLVideoElement = null;

  let player: Player;
  // let video: HTMLVideoElement;
  let playback: Playback;
  let extension: 'mpd' | 'm3u8' | 'mp4';
  const formatByExtension: Record<typeof extension, PlaybackFormat> = {
    m3u8: 'hls',
    mpd: 'dash',
    mp4: 'simple'
  };

  const destroy = () => player?.destroy();
  const mount = () => {
    extension = getExtension(src) as typeof extension;
    playback = {
      format: formatByExtension[extension],
      type: 'vod',
      src
    };
    player = EngineFactory.create(video, playback, autoplay);
  };

  $: if (src && video) {
    destroy();
    (async () => {
      await delay(200);
      mount();
    })();
  }
</script>

<!-- {poster}
{controls}
on:ended
bind:currentTime
bind:volume
bind:duration
bind:paused
bind:this={video}
use:slotName={'media'} -->
<!-- svelte-ignore a11y-media-has-caption -->
<video
  style={$$restProps.style}
  {controls}
  {crossorigin}
  {loop}
  {muted}
  {playsinline}
  {poster}
  {preload}
  bind:this={video}
  class:full
  use:slotName={'media'}
>
  <slot />
</video>

<style>
  video {
    background-color: black;
  }
  .full {
    width: 100%;
    height: 100%;
  }
</style>
