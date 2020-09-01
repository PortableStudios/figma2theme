import 'colors';

export const logError = (error: string, suggestion?: string | string[]) => {
  console.error(error.red.bold);
  if (suggestion) {
    if (Array.isArray(suggestion)) {
      suggestion.forEach((s) => console.warn(s.yellow));
    } else {
      console.warn(suggestion.yellow);
    }
  }
};
