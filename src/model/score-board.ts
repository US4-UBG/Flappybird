import { lerp, rescaleDim } from '../utils';

import ParentObject from '../abstracts/parent-class';
import SparkModel from './spark';
import PlayButton from './btn-play';
import RankingButton from './btn-ranking';
import { asset } from '../lib/sprite-destructor';
import { Fly, BounceIn, TimingEvent } from '../lib/animation';
import Storage from '../lib/storage';

export interface IImageState {
  banner: boolean;
  scoreBoard: boolean;
  buttons: boolean;
}

export default class ScoreBoard extends ParentObject {
  private images: Map<string, HTMLImageElement>;
  private playButton: PlayButton;
  private rankingButton: RankingButton;
  private show: IImageState;
  private FlyInAnim: Fly;
  private BounceInAnim: BounceIn;
  private currentScore: number;
  private currentGeneratedNumber: number;
  private currentHighScore: number;
  private TimingEventAnim: TimingEvent;
  private isNewHighScore: boolean;
  private spark: SparkModel;

  constructor() {
    super();
    this.images = new Map<string, HTMLImageElement>();
    this.playButton = new PlayButton();
    this.rankingButton = new RankingButton();
    this.spark = new SparkModel();
    this.currentHighScore = 0;
    this.currentGeneratedNumber = 0;
    this.currentScore = 0;
    this.isNewHighScore = false;
    this.show = {
      banner: false,
      scoreBoard: false,
      buttons: false
    };
    this.FlyInAnim = new Fly({
      duration: 500,
      from: {
        x: 0.5,
        y: 1.5
      },
      to: {
        x: 0.5,
        y: 0.438
      },
      transition: 'easeOutExpo'
    });
    this.TimingEventAnim = new TimingEvent({ diff: 30 });
    this.BounceInAnim = new BounceIn({
      durations: {
        bounce: 300,
        fading: 100
      }
    });
  }

  public init(): void {
    this.images.set('banner-gameover', asset('banner-game-over'));
    this.images.set('score-board', asset('score-board'));
    this.images.set('coin-10', asset('coin-dull-bronze'));
    this.images.set('coin-20', asset('coin-dull-metal'));
    this.images.set('coin-30', asset('coin-shine-gold'));
    this.images.set('coin-40', asset('coin-shine-silver'));
    this.images.set('new-icon', asset('toast-new'));

    for (let i = 0; i < 10; ++i) {
      this.images.set(`number-${i}`, asset(`number-md-${i}`));
    }

    this.rankingButton.init();
    this.playButton.init();

    this.playButton.active = false;
    this.rankingButton.active = false;
    this.spark.init();

    /**
     * We need to make sure about this
     * else may throw any error during
     * image retrieval
     * */
    const prevScore = Storage.get('highscore') as number;
    this.currentHighScore = typeof prevScore === 'number' ? prevScore : 0;
  }

  public resize({ width, height }: IDimension): void {
    super.resize({ width, height });

    this.rankingButton.resize(this.canvasSize);
    this.playButton.resize(this.canvasSize);
    this.spark.resize(this.canvasSize);
  }

  public Update(): void {
    this.rankingButton.Update();
    this.playButton.Update();
    this.spark.Update();
  }

  public Display(context: CanvasRenderingContext2D): void {
    if (this.show.banner) {
      const bgoScaled = rescaleDim(
        {
          width: this.images.get('banner-gameover')!.width,
          height: this.images.get('banner-gameover')!.height
        },
        { width: lerp(0, this.canvasSize.width, 0.7) }
      );
      const anim = this.BounceInAnim.value;
      const yPos = lerp(0, this.canvasSize.height, 0.225) - bgoScaled.height / 2;

      context.globalAlpha = anim.opacity;
      context.drawImage(
        this.images.get('banner-gameover')!,
        lerp(0, this.canvasSize.width, 0.5) - bgoScaled.width / 2,
        yPos + anim.value * lerp(0, this.canvasSize.height, 0.015),
        bgoScaled.width,
        bgoScaled.height
      );
      context.globalAlpha = 1;
    }

    if (this.show.scoreBoard) {
      const sbScaled = rescaleDim(
        {
          width: this.images.get('score-board')!.width,
          height: this.images.get('score-board')!.height
        },
        { width: lerp(0, this.canvasSize.width, 0.85) }
      );

      // Need to clone
      const anim = Object.assign({}, this.FlyInAnim.value);
      anim.x = lerp(0, this.canvasSize.width, anim.x) - sbScaled.width / 2;
      anim.y = lerp(0, this.canvasSize.height, anim.y) - sbScaled.height / 2;

      context.drawImage(
        this.images.get('score-board')!,
        anim.x,
        anim.y,
        sbScaled.width,
        sbScaled.height
      );

      if (this.TimingEventAnim.value && this.currentScore > this.currentGeneratedNumber) {
        this.currentGeneratedNumber++;
      }

      /**
       * Only show the buttons, medal, Update high score if possible
       * and 'new' icon after counting
       * */
      if (this.TimingEventAnim.status.complete && !this.TimingEventAnim.status.running) {
        if (this.currentGeneratedNumber > this.currentHighScore) {
          this.setHighScore(this.currentGeneratedNumber);
          this.isNewHighScore = true;
        }

        this.addMedal(context, anim, sbScaled);
        this.showButtons();
      }

      this.displayScore(context, anim, sbScaled);
      this.displayBestScore(context, anim, sbScaled, this.isNewHighScore);

      if (this.FlyInAnim.status.complete && !this.FlyInAnim.status.running) {
        this.TimingEventAnim.start();

        if (this.currentGeneratedNumber === this.currentScore) {
          this.TimingEventAnim.stop();
        }
      }
    }

    if (this.show.buttons) {
      this.rankingButton.Display(context);
      this.playButton.Display(context);
    }
  }

  public showBanner(): void {
    this.show.banner = true;
    this.BounceInAnim.start();
  }

  public showBoard(): void {
    this.show.scoreBoard = true;
    this.FlyInAnim.start();
    this.spark.doSpark();
  }

  public showButtons(): void {
    this.show.buttons = true;
    this.playButton.active = true;
    this.rankingButton.active = true;
  }

  private setHighScore(num: number): void {
    Storage.save('highscore', num);
    this.currentHighScore = num;
  }

  public setScore(num: number): void {
    this.currentScore = num;
  }

  private addMedal(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension
  ): void {
    if (this.currentScore < 10) return; // So sad having a no medal :)
    let medal: HTMLImageElement | undefined;

    if (this.currentScore >= 10 && this.currentScore < 20) {
      medal = this.images.get('coin-10');
    } else if (this.currentScore >= 20 && this.currentScore < 30) {
      medal = this.images.get('coin-20');
    } else {
      if (Math.floor(this.currentScore / 10) % 2 === 0) {
        medal = this.images.get('coin-40');
      } else {
        medal = this.images.get('coin-30');
      }
    }

    const scaled = rescaleDim(
      {
        width: medal!.width,
        height: medal!.height
      },
      { width: lerp(0, parentSize.width, 0.1878) }
    );
    const pos = {
      x: lerp(0, coord.x + parentSize.width / 2, 0.36),
      y: lerp(0, coord.y + parentSize.height / 2, 0.9196)
    };

    context.drawImage(medal!, pos.x, pos.y, scaled.width, scaled.height);

    this.spark.move(pos, scaled);
    this.spark.Display(context);
  }

  private displayScore(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension
  ): void {
    const numSize = rescaleDim(
      {
        width: this.images.get('number-1')!.width,
        height: this.images.get('number-1')!.height
      },
      { width: lerp(0, parentSize.width, 0.05) }
    );

    coord = Object.assign({}, coord);
    coord.x = lerp(0, coord.x + parentSize.width / 2, 1.565);
    coord.y = lerp(0, coord.y + parentSize.height / 2, 0.864);

    const numArr: string[] = String(this.currentGeneratedNumber).split('');

    numArr.reverse().forEach((c: string, index: number) => {
      context.drawImage(
        this.images.get(`number-${c}`)!,
        coord.x - index * (numSize.width + 5),
        coord.y,
        numSize.width,
        numSize.height
      );
    });
  }

  private displayBestScore(
    context: CanvasRenderingContext2D,
    coord: ICoordinate,
    parentSize: IDimension,
    haveNewToast: boolean
  ): void {
    const numSize = rescaleDim(
      {
        width: this.images.get('number-1')!.width,
        height: this.images.get('number-1')!.height
      },
      { width: lerp(0, parentSize.width, 0.05) }
    );

    coord = Object.assign({}, coord);

    coord.x = lerp(0, coord.x + parentSize.width / 2, 1.565);
    coord.y = lerp(0, coord.y + parentSize.height / 2, 1.074);

    const numArr: string[] = String(this.currentHighScore).split('');

    numArr.reverse().forEach((c: string, index: number) => {
      context.drawImage(
        this.images.get(`number-${c}`)!,
        coord.x - index * (numSize.width + 5),
        coord.y,
        numSize.width,
        numSize.height
      );
    });

    if (!haveNewToast) return;

    const toastSize = rescaleDim(
      {
        width: this.images.get('new-icon')!.width,
        height: this.images.get('new-icon')!.height
      },
      { width: lerp(0, parentSize.width, 0.14) }
    );

    context.drawImage(
      this.images.get('new-icon')!,
      lerp(0, coord.x, 0.73),
      lerp(0, coord.y, 0.922),
      toastSize.width,
      toastSize.height
    );
  }

  /**
   * Hide all at once
   * */
  public hide(): void {
    this.show.banner = false;
    this.show.scoreBoard = false;
    this.show.buttons = false;
    this.playButton.active = false;
    this.rankingButton.active = false;
    this.currentGeneratedNumber = 0;
    this.isNewHighScore = false;
    this.FlyInAnim.reset();
    this.BounceInAnim.reset();
    this.TimingEventAnim.reset();
    this.spark.stop();
  }

  public onRestart(cb: Function): void {
    this.playButton.onClick(cb);
  }

  public onShowRanks(cb: Function): void {
    /**
     * I don't know what to do on ranking?
     *
     * Should i create API for this?
     * */
  }

  public mouseDown({ x, y }: ICoordinate): void {
    this.playButton.mouseEvent('down', { x, y });
    this.rankingButton.mouseEvent('down', { x, y });
  }

  public mouseUp({ x, y }: ICoordinate): void {
    this.playButton.mouseEvent('up', { x, y });
    this.rankingButton.mouseEvent('up', { x, y });
  }
}