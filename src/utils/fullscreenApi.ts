export const fullscreenApi = {
  enter: 'requestFullscreen',
  exit: 'exitFullscreen',
  event: 'fullscreenchange',
  element: 'fullscreenElement',
  error: 'fullscreenerror',
};

if (document.fullscreenElement === undefined) {
  fullscreenApi.enter = 'webkitRequestFullScreen';
  fullscreenApi.exit =
    (document as any).webkitExitFullscreen != null
      ? 'webkitExitFullscreen'
      : 'webkitCancelFullScreen';
  fullscreenApi.event = 'webkitfullscreenchange';
  fullscreenApi.element = 'webkitFullscreenElement';
  fullscreenApi.error = 'webkitfullscreenerror';
}
