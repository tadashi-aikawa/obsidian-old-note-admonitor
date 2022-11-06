export function smartLineBreakSplit(text: string): string[] {
  return text.split("\n").filter((x) => x);
}
