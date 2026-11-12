/** "Jean Claude" becomes "JC". One word gives one letter. Used for the profile icon. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.slice(0, 2).map((w) => Array.from(w)[0]?.toUpperCase() ?? '');
  return letters.join('') || '?';
}