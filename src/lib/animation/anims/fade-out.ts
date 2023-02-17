import { swing } from '../easing';

export interface IFadeOutOptions {
  duration: number;
}

export interface IConstructorFadeOutOptions extends Partial<IFadeOutOptions> {}

export interface IFadeOutStatus {
  running: boolean;
  complete: boolean;
}

export class FadeOut {
  private startTime: number;
  private isRunning: boolean;
  private isComplete: boolean;
  private options: IFadeOutOptions;

  constructor(options?: IConstructorFadeOutOptions) {
    this.startTime = 0;
    this.isRunning = false;
    this.isComplete = true;
    this.options = {
      duration: 500 // sec
    };

    Object.assign(this.options, options ?? {});
  }

  public reset(): void {
    this.isComplete = true;
    this.isRunning = false;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startTime = this.time;
    this.isComplete = false;
  }

  public stop(): void {
    this.isRunning = false;
    this.isComplete = true;
  }

  private get time(): number {
    return performance.now();
  }

  public get status(): IFadeOutStatus {
    return {
      running: this.isRunning,
      complete: this.isComplete
    };
  }

  public get value(): number {
    if (this.isComplete && !this.isRunning) return 0;

    const value = (this.time - this.startTime) / this.options.duration;

    if (value >= 1) {
      this.isRunning = false;
      this.isComplete = true;
    }

    return swing(1 - value);
  }
}
