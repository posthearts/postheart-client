import { useEffect, RefObject } from "react";

export function getAsset(assetUrl: `${string}.${string}`) {
  return new URL(`./assets/${assetUrl}`, import.meta.url).href;
}

export function truncateString(str: string, maxLength = 20) {
  // Normalize all whitespace (including newlines, tabs) to a single space
  str = str.replace(/\s+/g, ' ').trim();

  // Truncate if necessary
  return str.length > maxLength ? str.slice(0, maxLength - 3).trimEnd() + '...' : str;
}

export const select = (s: string) => document.querySelector(s);
export const selectFrom = (s: string, el: HTMLElement) => el.querySelector(s);
export const selectAllFrom = (s: string, el: HTMLElement) => el.querySelectorAll(s);
export const getCssProperty = (el: Element, property: `--${string}`) => getComputedStyle(el).getPropertyValue(property);
export const getNumberFromPx = (value: string) => {
  if (value === '') return null;
  const valueToNumber = Number(value.replace('px', ''));
  return isNumber(valueToNumber) ? valueToNumber : null;
};
export const getNumberFromUnit = (value: string, unit: string) => {
  if (value === '') return null;
  const valueToNumber = Number(value.replace(unit, ''));
  return isNumber(valueToNumber) ? valueToNumber : null;
}
export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value);
export function getTemplate(e: string) {
  const template = select(e) as HTMLTemplateElement;
  const wrapper = template.content.firstElementChild!.cloneNode(true) as HTMLElement;

  return wrapper;
}

// NOTE!!!!
// this requires that the button that toggles the element in stops propagation to the document

export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  onClickOut?: () => void,
  deps: unknown[] = []
): void {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Get fresh ref value on each click
      const element = ref.current;
      // Check if element exists and is still mounted
      if (!element?.isConnected) return;

      // Check if click is outside
      if (!e.composedPath().includes(element)) {
        onClickOut?.();
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [ref, ...deps]); // ref object is stable, but included for eslint
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const noop = (..._args: unknown[]) => { };

export function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}