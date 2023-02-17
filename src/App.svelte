<script lang="ts">
  import { Button } from 'attractions';
  import Video from './lib/Video.svelte';
  import type { Playback, PlaybackExtensions } from './model/Playback';
  import '../dist/smart-player.iife.js';
  import { slotName } from './directives/useSlotName';
  import { attributes } from './directives/useAttributes';
  import { props } from './directives/useProps';

  // let player: Player;

  // const playback: Playback = {
  //   format: 'hls',
  //   type: 'vod',
  //   src: 'https://storage.googleapis.com/shaka-demo-assets/sintel-fmp4-aes/master.m3u8'
  // };
  // const playback: Playback = {
  //   format: 'dash',
  //   type: 'vod',
  //   src: 'https://cdn.bitmovin.com/content/assets/sintel/sintel.mpd'
  // };
  // const playback: Playback = {
  //   format: 'dash',
  //   type: 'vod',
  //   src: 'https://dash.akamaized.net/dash264/TestCasesUHD/2b/11/MultiRate.mpd',
  //   position: 300
  // };
  const playback: Playback = {
    format: 'simple',
    type: 'vod',
    src: 'https://edisciplinas.usp.br/pluginfile.php/5196097/mod_resource/content/1/Teste.mp4',
    position: 15
  };

  //https://gist.github.com/jsturgis/3b19447b304616f18657

  const files: Record<PlaybackExtensions, string> = {
    mp4: 'https://file-examples.com/storage/fe1aa0c9d563ea1e4a1fd34/2017/04/file_example_MP4_640_3MG.mp4',
    // mp4: 'https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4',
    // mp4: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4',
    // mp4: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    // mp4: 'https://freetestdata.com/wp-content/uploads/2022/02/Free_Test_Data_10MB_MP4.mp4',
    dash: 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
    hls: 'https://storage.googleapis.com/shaka-demo-assets/sintel-fmp4-aes/master.m3u8'
  };

  let src = files['mp4'];
</script>

<main>
  <div class="player">
    <media-controller>
      <smart-player {src} autoplay full crossorigin={false} use:slotName={'media'} />
      <!-- <video
        slot="media"
        src="https://stream.mux.com/DS00Spx1CV902MCtPj5WknGlR102V5HFkDe/high.mp4"
      ></video> -->
      <media-control-bar>
        <media-play-button />
        <media-mute-button />
        <media-volume-range />
        <media-time-range />
        <media-pip-button />
        <media-fullscreen-button />
      </media-control-bar>
    </media-controller>
    <!-- <Video {src} controls autoplay full /> -->
  </div>

  <div class="files">
    {#each Object.entries(files) as [key, value] (key)}
      <Button filled on:click={() => (src = value)}>{key}</Button>
    {/each}
  </div>
</main>

<style global>
  body {
    margin: 0;
  }
  main {
    width: 100vw;
    height: 100vh;
  }
  .player {
    padding: 32px;
    height: 70vh;
  }
  .files {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    padding: 1rem;
    gap: 1rem;
    border-top: 1px solid rgba(0, 0, 0, 0.5);
    background-color: white;
  }
  media-controller {
    width: 100%;
    height: 100%;
  }
</style>
