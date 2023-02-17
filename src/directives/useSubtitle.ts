import type { PlayerContext } from '$/context/PlayerContext.svelte';
import { stringToBoolean } from '$/utils';
import axios from 'axios';
import { getContext } from 'svelte';

const subtitleDirective = (node: HTMLTrackElement, properties?) => {
  const { subtitleText } = getContext<PlayerContext>('player');

  subtitleText.set(null);

  const loadSubtitle = async (element: HTMLTrackElement) => {
    if (
      !element.src &&
      element.dataset['mode'] !== 'disabled' &&
      element.dataset['src']
    ) {
      try {
        const { data } = await axios.get(element.dataset['src']);
        const blob = new Blob([data], { type: 'text/vtt' });
        element.src = URL.createObjectURL(blob);
      } catch (error) {}
    }
  };

  const handleMutationChange = (mutations) => {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === 'data-mode') {
        const trackElement = mutation.target as HTMLTrackElement;
        const { track } = trackElement;
        track.mode = trackElement.dataset['mode'] as TextTrackMode;
        if (!trackElement.dataset['src'] && track.mode === 'hidden')
          subtitleText.set(null);
        else loadSubtitle(trackElement);
      }
    });
  };

  const handleCueChange = (e: Event) => {
    const textTrack = (e.target as HTMLTrackElement).track;
    if (textTrack.activeCues.length > 0) {
      const cue = textTrack.activeCues[0] as VTTCue;
      subtitleText.set(cue.text);
      cue.onexit = () => subtitleText.set('');
    }
  };

  const mutationObserver = new MutationObserver(handleMutationChange);

  mutationObserver.observe(node, {
    attributeOldValue: true
  });

  node.addEventListener('cuechange', handleCueChange);

  if (node.dataset['mode'] === 'hidden') {
    node.track.mode = node.dataset['mode'] as TextTrackMode;
    loadSubtitle(node);
  }

  return {
    destroy() {
      node.removeEventListener('cuechange', handleCueChange);
      mutationObserver.disconnect();
    }
  };
};

export { subtitleDirective as subtitle };
