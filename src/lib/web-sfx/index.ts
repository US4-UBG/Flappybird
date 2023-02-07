/**
 * A library for handling sound Effects
 * Handling Sound Effects
 * */

export type IWebSfxObject = { [key: string]: string };
export type IWebSfxCache = { [key: string]: AudioBuffer };
export interface ILoadRequest {
  content: AudioBuffer;
  name: string;
  path: string;
}

declare var webkitAudioContext: AudioContext;

export interface IWebSfxOptions {
  autoInitAudioContext: boolean;
  files: IWebSfxObject;
}

export default class WebSfx {
  public static audioContext: AudioContext;
  private static Cached: IWebSfxCache = {};
  private static concurrentDownload = 5;
  private static gainContext: undefined | GainNode;
  private static isReady: boolean = false;

  /**
   * Load Files and call the callback function after all files has been loaded
   *
   * @param {string:string} = {key:path to audio}
   * @param callback = complete function
   * */
  constructor(files: IWebSfxObject, callback: Function) {
    WebSfx.audioContext = new (AudioContext || webkitAudioContext)();

    WebSfx.audioContext.addEventListener('statechange', () => {
      WebSfx.isReady = WebSfx.audioContext.state === 'running';
    });

    WebSfx.load(files, callback);
  }

  public static play(key: string): void {
    if (typeof WebSfx.Cached[key] === void 0) {
      throw new TypeError(`Key ${key} does not load or not exists.`);
    }

    if (!WebSfx.isReady) return;

    try {
      const context = WebSfx.audioContext!;
      const gain = WebSfx.gainContext!;
      const bufferSource = context.createBufferSource();

      bufferSource.buffer = WebSfx.Cached[key];
      bufferSource.connect(gain);
      bufferSource.start();
    } catch (err) {
      throw new Error(`Failed to play audio: ${key}. Error: ${err}`);
    }
  }

  public static volume(num: number) {
    if (typeof WebSfx.gainContext === void 0) {
      throw new TypeError('Static WebSfx.initAudioContext does not initialize');
    }

    try {
      WebSfx.gainContext!.gain.value = num;
    } catch (err) {}
  }

  public static async init(): Promise<void> {
    if (WebSfx.isReady) return;

    // We should start after user event
    await WebSfx.audioContext.resume();

    const audioContext = WebSfx.audioContext!;
    const gain = audioContext.createGain();

    // Output channel
    gain.connect(audioContext.destination);

    WebSfx.gainContext = gain;
  }

  /**
   * Loading Assets Section
   * */
  private static load(files: IWebSfxObject, complete: Function, level: number = 0): void {
    const loading = [];
    const entries = Object.entries(files);

    /**
     * Do not load all files at once.
     * */
    for (let i = level * WebSfx.concurrentDownload; i < Math.min(entries.length, WebSfx.concurrentDownload); i++) {
      // Validating files
      if (!/\.(wav|ogg|mp3)$/i.test(entries[i][1])) {
        throw new TypeError("WebSfx.contructor accepts 'wav|ogg|mp3' type of files");
      }

      loading.push(WebSfx.load_requests(entries[i][0], entries[i][1]));
    }

    Promise.allSettled(loading).then((results) => {
      // Store thr buffer in WebSfx.Cached
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          WebSfx.Cached[result.value.name] = result.value.content;
        } else {
          // What can I do to rejected?
        }
      });

      if (entries.length > (level + 1) * WebSfx.concurrentDownload) {
        WebSfx.load(files, complete, level + 1);
      } else {
        complete(WebSfx.Cached);
      }
    });
  }

  private static load_requests(name: string, path: string): Promise<ILoadRequest> {
    return new Promise<ILoadRequest>(async (resolve: Function, reject: Function) => {
      try {
        const response = await fetch(path, { method: 'GET', mode: 'no-cors' });

        if (!response.ok) throw new TypeError(`Erro while fetching '${path}`);

        // We cannot cannot cache array buffer with attached head
        const buffer = await response.arrayBuffer();

        // But luckily, we can do cache the AudioBuffer
        const content = await WebSfx.audioContext!.decodeAudioData(buffer);

        resolve({ content, path, name });
      } catch (err) {
        reject();
      }
    });
  }
}