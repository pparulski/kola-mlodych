export function debounce<
  A extends unknown[], // Type for the arguments array of the function to be debounced
  R // Type for the return value of the function to be debounced
>(
  func: (...args: A) => R, // The function to debounce
  delay: number
): (...args: A) => void { // The debounced function
  let timeoutId: NodeJS.Timeout | undefined; // Or just `number | undefined` for browser-only

  return function (this: unknown, ...args: A) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this; // Capture the 'this' context from how the debounced function is called

    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}