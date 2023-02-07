import './styles/main.scss';
import raf from 'raf';
import prepareAssets from './asset-preparation';
import GameObject from './game';
import { rescaleDim, framer as Framer } from './utils';
import EventHandler from './events';
//import WebSfx from './lib/web-sfx';

if (document.querySelector('[name=app_mode]')!.getAttribute('content') === 'production') {
  // Load Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

const canvas = document.querySelector('#main-canvas')! as HTMLCanvasElement;
const canvasDimension = {
  width: 500,
  height: 779
};
let isLoaded = false;

/**
 * While waiting to all assets to load
 * All event that has possibilities to call
 * during loading state should be preserve.
 * */
const stacks: Function[] = [];

const Game = new GameObject(canvas);
const fps = new Framer(Game.context);

// prettier-ignore
fps.text({ x: 50, y: 50 }, '', ' Cycle');
// prettier-ignore
fps.container({ x: 10, y: 10}, { x: 230, y: 70});

/**
 * Update the game
 * */
const GameUpdate = (): void => {
  Game.Update();
  Game.Display();

  fps.mark();
  raf(GameUpdate);
};

const GameDisplay = (): void => {
  Game.Display();

  raf(GameDisplay);
};

const ScreenResize = () => {
  const { innerWidth, innerHeight } = window;
  let sizeResult: IDimension;
  sizeResult = rescaleDim(canvasDimension, { height: innerHeight });

  // Adjust the canvas DOM size
  canvas.style.maxWidth = String(sizeResult.width / 2);
  canvas.style.maxHeight = String(sizeResult.height / 2);

  // Adjust Canvas Drawing Size
  canvas.height = sizeResult.height;
  canvas.width = sizeResult.width;

  Game.Resize(sizeResult);
};

window.addEventListener('DOMContentLoaded', () => {
  /**
   * Initialize Audio Context
   *
   * This thing should be on event where gesture has been detected
   * */
  //WebSfx.initAudioContext();

  // Load Assets
  prepareAssets(() => {
    isLoaded = true;
    // Begin
    Game.init();
    ScreenResize();

    for (const stack of stacks) {
      stack();
    }

    //raf(GameDisplay);
    raf(GameUpdate);

    // Listen to events: Mouse, Touch, Keyboard
    EventHandler(Game);
  });
});

window.addEventListener('resize', () => {
  if (!isLoaded) {
    stacks.push(ScreenResize);
    return;
  }

  ScreenResize();
});