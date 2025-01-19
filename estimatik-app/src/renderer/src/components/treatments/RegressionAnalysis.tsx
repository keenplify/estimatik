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
import _ from 'lodash'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'
import colorInterpolate from 'color-interpolate'

const positiveInterpolate = colorInterpolate(['#63be7b', '#fcea84', '#fcbe7b'])

function normalizeAIC(aic: number, minAIC: number, maxAIC: number) {
  // Avoid division by zero if all AIC values are the same
  return (aic - minAIC) / (maxAIC - minAIC)
}

export default function RegressionAnalysis() {
  const { highCorrelationFields, unlabeledFields, trainingData, setBestCandidateFields } =
    useDataStore()

  const { data, isLoading } = useQuery({
    queryKey: ['analysis', highCorrelationFields, unlabeledFields, trainingData],
    queryFn: async () => {
      const transformedFields = highCorrelationFields.map((_, index) =>
        highCorrelationFields.slice(0, index + 1)
      )

      const res: (AnalysisResponse & { fields: string[] })[] = []

      for (const fields of transformedFields) {
        const data = trainingData.map((datum) => {
          const d: Record<string, string> = {
            [unlabeledFields[0]]: datum[unlabeledFields[0]]
          }

          for (const field of fields) {
            d[field] = datum[field]
          }

          return d
        })

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

  const minAIC = Math.min(...(data?.map((d) => d.AIC) || []))
  const maxAIC = Math.max(...(data?.map((d) => d.AIC) || []))

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
              {data?.map((d, i) => {
                const isBest = _.isEqual(d.fields, bestCandidate?.fields)

                // Normalize the AIC value before passing it to the positiveInterpolate function
                const normalizedAIC = normalizeAIC(d.AIC, minAIC, maxAIC)

                return (
                  <TableRow key={i}>
                    <TableCell className={twMerge('max-w-xs text-sm')}>
                      <span className={twMerge(isBest && 'font-bold')}>
                        {unlabeledFields[0]} + {d.fields.join(' + ')}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        background: positiveInterpolate(d.rSquared)
                      }}
                    >
                      <span className={twMerge(isBest && 'font-bold')}>
                        {d.rSquared.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        background: positiveInterpolate(d.adjustedRsquared)
                      }}
                    >
                      <span className={twMerge(isBest && 'font-bold')}>
                        {d.adjustedRsquared.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell
                      style={{
                        background: positiveInterpolate(normalizedAIC)
                      }}
                    >
                      <span className={twMerge(isBest && 'font-bold')}>{d.AIC.toFixed(2)}</span>
                    </TableCell>
                  </TableRow>
                )
              })}
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
