import 'colors';

export const logError = (error: string, suggestion?: string) => {
  console.error(error.red.bold);
  if (suggestion) {
    console.warn(suggestion.yellow);
  }
};
