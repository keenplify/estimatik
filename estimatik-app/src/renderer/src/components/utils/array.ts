export function createNumberArray(length: number) {
  return Array.from({ length: length + 1 }, (_, i) => i)
}
