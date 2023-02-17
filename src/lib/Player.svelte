<svelte:options accessors />

<script lang="ts">
  import type { Playback, PlaybackFormat } from '$/model/Playback';
  import type Player from '$/core/Player';
  import type { EventHandler } from '@billjs/event-emitter';
  import type { AudioTrackLevel, BitrateLevel } from '$/model/Player';
  import type PlayerContext from '$/context/PlayerContext.svelte';
  import { onDestroy, createEventDispatcher, getContext } from 'svelte';
  import { delay, getExtension, isNullOrUndefined } from '$/utils';
  import { createEvent } from '$/utils/event';
  import { slotName } from '$/directives/useSlotName';
  import EngineFactory from '$/core/engine/EngineFactory';

  const { videoEl, playback, subtitles, subtitleText } = getContext<PlayerContext>('player');

  export let src: string;

  // type $$Props = Partial<HTMLVideoElement> & {
  //   player: Player;
  // };

  /**
   * URL de imagem que será exibida como capa do player
   */
  export let poster: string = null;

  /**
   * Desabilita os controles nativos e/ou interface de controle
   */
  export let controls: boolean = false;

  /**
   * Define se o playback deve iniciar sem som
   */
  export let muted: boolean = false;

  /**
   * Define se o player inicia o playback automaticamente
   */
  export let autoplay: boolean = false;

  export let crossorigin: string = null;
  /** Gets or sets a flag to specify whether playback should restart after it completes. */
  export let loop: HTMLVideoElement['loop'] = null;
  /** Gets or sets the playsinline of the video element. for example, On iPhone, video elements will now be allowed to play inline, and will not automatically enter fullscreen mode when playback begins. */
  export let playsinline: HTMLVideoElement['playsInline'] = null;
  /** Gets or sets a value indicating what data should be preloaded, if any. */
  export let preload: HTMLVideoElement['preload'] = null;

  export let volume: HTMLVideoElement['volume'] = 1;

  // export { _playback as playback };

  export let currentTime: HTMLVideoElement['currentTime'] = 0;

  export let duration: HTMLVideoElement['duration'] = 0;

  /** Porcentagem do video */
  export let progress = 0;

  export let paused: HTMLVideoElement['paused'] = true;
  // // export let position: number = 0;
  export let bitrateLevels: BitrateLevel[] = [];
  export let audioTrackLevels: AudioTrackLevel[] = [];
  export let isReady = false;

  export let player: Player;
  export let video: HTMLVideoElement = null;

  // export const getVideoTag = () => player?.video;
  // export const play = () => player?.play();
  // export const pause = () => player?.pause();
  // export const isPlaying = () =>
  //   !!(video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2);
  // export const seek = async (time: number) => player.seek(time);
  // export const changeBitrate = (index: BitrateLevel['index']) => player.changeBitrate(index);
  // export const changeAudioTrack = (index: number) => player.changeAudioTrack(index);
  // export const changeSubtitle = (index: number) => player.changeSubtitle(index);
  // export const on = (type: string, handler: EventHandler) => player?.on?.(type, handler);
  // export const off = (type: string, handler: EventHandler) => player?.off?.(type, handler);

  let dispatcher = createEventDispatcher();
  let show = false;
  let extension: 'mpd' | 'm3u8' | 'mp4';
  let _playback: Playback;

  const notify = (e) => customEvent(e.type);
  const customEvent = (type: string, detail?: any) => {
    dispatcher(type, detail, {});
    video?.parentNode.dispatchEvent(createEvent(type, detail));
  };
  const onPlaybackStatusChange = (e) => customEvent('playbackStatusChange', e.type);

  // const onTimeUpdate = (e) => {
  //   const time = Math.floor(video?.currentTime);
  //   if (time !== currentTime) {
  //     currentTime = time;
  //     customEvent('timeupdate', video?.currentTime);
  //   }
  // };
  const onBitrateChange = ({ data }) => customEvent('bitrateChange', data);
  const onSubtitleChange = ({ data }) => customEvent('subtitleChange', data);
  const onBitrateLevels = ({ data }) => (bitrateLevels = data);
  const onAudioTrackLevels = ({ data }) => (audioTrackLevels = data);
  const onSubtitleLevels = ({ data }) => subtitles.set(data);
  const onCueChange = ({ data }) => {
    if (data === -1) {
      subtitleText.set(null);
      return;
    }
    const textTrack = data.target as TextTrack;
    if (textTrack.activeCues.length > 0) {
      const cue = textTrack.activeCues[0] as VTTCue;
      subtitleText.set(cue.text);
      cue.onexit = () => subtitleText.set('');
    }
    customEvent('cueChange', textTrack);
  };
  const onReady = async () => {
    video?.removeEventListener('canplay', onReady);
    customEvent('ready');
    isReady = true;
  };

  onDestroy(() => destroy());

  const mount = async () => {
    show = true;
    await delay(200);

    extension = getExtension(src) as typeof extension;

    const extensionByFormat: Record<typeof extension, PlaybackFormat> = {
      m3u8: 'hls',
      mpd: 'dash',
      mp4: 'simple'
    };

    _playback = {
      format: extensionByFormat[extension],
      type: 'vod',
      src
    };

    console.log(_playback);

    // playback.set(_playback);

    autoplay = !video.paused || autoplay;

    video.addEventListener('canplay', onReady);
    // video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlaybackStatusChange);
    video.addEventListener('pause', onPlaybackStatusChange);
    video.addEventListener('ended', onPlaybackStatusChange);

    player = EngineFactory.create(video, _playback, autoplay);
    player.on('bitrateLevels', onBitrateLevels);
    player.on('audioTrackLevels', onAudioTrackLevels);
    player.on('subtitleLevels', onSubtitleLevels);
    player.on('bitrateChange', onBitrateChange);
    player.on('cueChange', onCueChange);
    player.on('subtitleChange', onSubtitleChange);
    subtitleText.set(null);
  };

  const destroy = () => {
    if (video) {
      // video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlaybackStatusChange);
      video.removeEventListener('pause', onPlaybackStatusChange);
      video.removeEventListener('ended', onPlaybackStatusChange);
      video.removeEventListener('canplay', onReady);
    }

    if (player) {
      player.off('bitrateLevels', onBitrateLevels);
      player.off('audioTrackLevels', onAudioTrackLevels);
      player.off('subtitleLevels', onSubtitleLevels);
      player.off('bitrateChange', onBitrateChange);
      player.off('cueChange', onCueChange);
      player.off('subtitleChange', onSubtitleChange);
      player.destroy();
      player = null;
    }

    show = false;
    isReady = false;
  };

  $: if (!isNullOrUndefined(_playback)) {
    console.log('show');
    destroy();
    (async () => {
      await delay(1000);
      mount();
    })();
  }

  $: progress = Math.floor((currentTime / duration) * 100) || 0;

  $: video && videoEl.set(video);
</script>

{#if show}
  <!-- {controls}
{poster}
{muted}
{autoplay} -->
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    style={$$restProps.style}
    {poster}
    {controls}
    on:ended
    bind:currentTime
    bind:volume
    bind:duration
    bind:paused
    bind:this={video}
    use:slotName={'media'}
  >
    <slot {video} />
    {#if isReady}
      <slot name="ready" />
    {/if}
  </video>
{/if}

<style>
  video {
    width: 100%;
    height: 100%;
    display: flex;
    object-fit: contain;
    background-color: rgb(0, 0, 0);
  }
</style>
