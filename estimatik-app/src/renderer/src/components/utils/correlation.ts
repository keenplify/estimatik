import { sampleCorrelation } from 'simple-statistics'

/**
 * Create a correlation matrix from an array of objects.
 * @param data - Array of objects containing the data.
 * @returns The correlation matrix.
 */
export function createCorrelationMatrix(
  data: Record<string, string | number>[]
): Record<string, number | null>[] {
  const keys = Object.keys(data[0]).filter((key) => key !== 'Period')
  const matrix: Record<string, number | null>[] = []

  keys.forEach((key1, i) => {
    const row: Record<string, number | null> = {}
    keys.forEach((key2, j) => {
      if (i === j) {
        row[key2] = 1
      } else if (i < j) {
        row[key2] = null
      } else {
        const x = data.map((item) => parseFloat(item[key1] as string))
        const y = data.map((item) => parseFloat(item[key2] as string))
        row[key2] = sampleCorrelation(x, y)
      }
    })
    matrix.push(row)
  })

  return matrix
}
