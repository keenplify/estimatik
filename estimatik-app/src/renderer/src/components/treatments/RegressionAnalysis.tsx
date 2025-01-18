import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { useDataStore } from '@renderer/stores/data'
import { AnalysisResponse } from '@renderer/types'
import { sendIpcMessage } from '@renderer/utils/promises'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export default function RegressionAnalysis() {
  const { highCorrelationFields, unlabeledFields, trainingData, setBestCandidateFields } =
    useDataStore()

  console.log({ highCorrelationFields, unlabeledFields, trainingData, setBestCandidateFields })

  const { data, isLoading } = useQuery({
    queryKey: ['analysis', highCorrelationFields, unlabeledFields, trainingData],
    queryFn: async () => {
      const transformedFields = highCorrelationFields.map((_, index) =>
        highCorrelationFields.slice(0, index + 1)
      )

      console.log({ transformedFields })

      const res: (AnalysisResponse & { fields: string[] })[] = []

      for (const fields of transformedFields) {
        console.log({ fields })
        const data = trainingData.map((datum) => {
          const d: Record<string, string> = {
            [unlabeledFields[0]]: datum[unlabeledFields[0]]
          }

          for (const field of fields) {
            d[field] = datum[field]
          }

          return d
        })

        console.log({ data })

        const analysis = await sendIpcMessage<AnalysisResponse>('analysis', data)

        res.push({
          fields,
          ...(analysis ? JSON.parse(analysis) : {})
        })
      }

      return res
    }
  })

  const bestCandidate = data?.reduce((best, current) => {
    if (
      current.AIC < best.AIC ||
      (current.AIC === best.AIC && current.adjustedRsquared > best.adjustedRsquared)
    ) {
      return current
    }
    return best
  }, data?.[0])

  useEffect(() => {
    if (!bestCandidate) return
    setBestCandidateFields(bestCandidate.fields)
  }, [bestCandidate])

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div>Loading</div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Variable</TableCell>
                <TableCell>R Squared</TableCell>
                <TableCell>Adjusted R Squared</TableCell>
                <TableCell>Akaike's Information Criterion (AIC)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="max-w-xs text-sm">
                    {unlabeledFields[0]} + {d.fields.join(' + ')}
                  </TableCell>
                  <TableCell>{d.rSquared.toFixed(2)}</TableCell>
                  <TableCell>{d.adjustedRsquared.toFixed(2)}</TableCell>
                  <TableCell>{d.AIC.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {bestCandidate && (
        <Paper elevation={2} className="p-2">
          The best is{' '}
          <b>
            {bestCandidate ? `${unlabeledFields[0]} + ${bestCandidate.fields.join(' + ')}` : 'N/A'}
          </b>
        </Paper>
      )}
    </div>
  )
}
