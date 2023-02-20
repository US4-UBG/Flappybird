export type IProgressFunction = (t: number) => number;

export interface IEasingUtils {
  swing: IProgressFunction;
  linear: IProgressFunction;
  quadratic: IProgressFunction;
  cubicBezier: IProgressFunction;
  easeOut: IProgressFunction;
  easeOutCirc: IProgressFunction;
  easeOutExpo: IProgressFunction;
}

export type IEasingKey = keyof IEasingUtils;

export const swing: IEasingUtils['swing'] = (t: number): number => {
  /**
   * f(x) = 1/2 - cos(x • PI)/2
   * */
  return 0.5 - Math.cos(t * Math.PI) / 2;
};

export const linear: IEasingUtils['linear'] = (t: number): number => {
  /**
   * f(x) = x
   * */
  return t;
};

export const quadratic: IEasingUtils['quadratic'] = (t: number): number => {
  /**
   * f(x) = x^2
   * */
  return Math.pow(t, 2);
};

export const cubicBezier: IEasingUtils['cubicBezier'] = (t: number): number => {
  /**
   * f(x) = { 2x^3, if x <= 0.5,
   *        { 1 - 2x^3, > 0.5
   * */
  return t <= 0.5 ? 2 * Math.pow(t, 3) : 1 - 2 * Math.pow(t, 3);
};

export const easeOut: IEasingUtils['easeOut'] = (t: number): number => {
  /**
   * f(x) = 1/2 - cos(x • PI) / 2
   * */
  return 0.5 - Math.cos(t * Math.PI) / 2;
};

/**
 * Code below - Source:
 * https://easings.net
 *
 * Hey, I just like to include or create their Mathematical
 * formula just to make myself look smart. :)
 * */

export const easeOutCirc: IEasingUtils['easeOutCirc'] = (t: number): number => {
  /**
   * f(x) = √1 - (x - 1)^2
   * */
  return Math.sqrt(1 - Math.pow(t - 1, 2));
};

export const easeOutExpo: IEasingUtils['easeOutExpo'] = (t: number): number => {
  /**
   * f(x) = { 1, if x = 1
   *        { 1 - (2)^(-10x), otherwise
   * */
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};
