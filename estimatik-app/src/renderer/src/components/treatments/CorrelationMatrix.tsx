import { useDataStore } from '@renderer/stores/data'
import { useEffect, useMemo } from 'react'
import { createCorrelationMatrix } from '../utils/correlation'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import _ from 'lodash'
import colorInterpolate from 'color-interpolate'

const positiveInterpolate = colorInterpolate(['#fcbe7b', '#fcea84', '#63be7b'])
const negativeInterpolate = colorInterpolate(['#fcbe7b', '#f98d72', '#f8696b'])

const interpolate = (n: number) => {
  if (n >= 0) {
    return positiveInterpolate(n)
  } else {
    return negativeInterpolate(Math.abs(n))
  }
}

export default function CorrelationMatrix() {
  const { unlabeledTrainingData, fields, unlabeledFields, setHighCorrelationFields } =
    useDataStore()

  const matrix = useMemo(
    () => createCorrelationMatrix(unlabeledTrainingData),
    [unlabeledTrainingData]
  )

  useEffect(() => {
    const highCorrelationFields: string[] = []

    matrix.forEach((row, i) => {
      Object.entries(row).forEach(([key, value]) => {
        if (value !== null && (Math.abs(value) >= 0.8 || value === 1)) {
          highCorrelationFields.push(fields[i])
          highCorrelationFields.push(key)
        }
      })
    })

    setHighCorrelationFields(
      _.uniq(highCorrelationFields).filter((field) => field != fields[0] && field != fields[1])
    )
  }, [matrix, fields, setHighCorrelationFields])

  return (
    <Paper elevation={3}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              {unlabeledFields.map((field, i) => (
                <TableCell key={i}>{field}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {matrix.map((row, i) => (
              <TableRow key={i}>
                <TableCell component="th" scope="row">
                  {unlabeledFields[i]}
                </TableCell>
                {unlabeledFields.map((field, j) => (
                  <TableCell
                    key={j}
                    style={{
                      background: row[field] !== null ? interpolate(row[field]) : undefined
                    }}
                  >
                    <div className="w-full text-center">
                      {row[field] !== null && row[field].toFixed(2)}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )
}
