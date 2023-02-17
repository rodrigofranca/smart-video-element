import Player from './Player';

const mp4 = 'https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_640_3MG.mp4'
let player:Player;

//@ts-ignore
beforeEach(() => global.window.HTMLMediaElement.prototype._mock.doAutoplay = true)
afterEach(()=> player.destroy())

describe('player core', () => {

  it('does set a valid src to video element', () => {
    const video = document.createElement('video');
    player = new Player({src: mp4, video})
    expect(player.src).toEqual(mp4)
  })

  it('can check autoplay availability', async () => {
    const video = document.createElement('video');
    player = new Player({src: mp4, video});
    /**
     * Hack para simular comportamento de autoplay policy
     */
    //@ts-ignore
    // global.window.HTMLMediaElement.prototype._mock.doAutoplay = true;

    const canAutoplay = await player.canAutoplay()
    expect(canAutoplay).toEqual(true)
  })

  it('can check autoplay rejected', async () => {
    const video = document.createElement('video');
    player = new Player({src: mp4, video});
    /**
     * Hack para simular comportamento de autoplay policy
     */
    //@ts-ignore
    global.window.HTMLMediaElement.prototype._mock.doAutoplay = false;

    const canAutoplay = await player.canAutoplay()
    expect(canAutoplay).toEqual(false)
  })

})
