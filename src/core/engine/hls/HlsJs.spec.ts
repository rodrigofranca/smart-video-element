import HlsJs from './HlsJs';

beforeEach(() => {
  const emptyScriptTag = document.createElement('script');
  emptyScriptTag.id = 'emptyScript'
  document.getElementsByTagName('body')[0].appendChild(emptyScriptTag);
})

afterEach(() => {
  const emptyScriptTag = document.getElementById('emptyScript')
  emptyScriptTag.parentNode.removeChild( emptyScriptTag )
})

describe('hls engine', () => {
  it('should run', () => {
    const video = document.createElement('video');
    const hlsjs = new HlsJs({
      src: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
      video
    })
    hlsjs.onReady.then(()=>{
      hlsjs.initialize();
    })
  });
})
