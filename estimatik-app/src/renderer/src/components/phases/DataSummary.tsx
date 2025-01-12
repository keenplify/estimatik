import { useDataStore } from '@renderer/stores/data'
import { LineChart } from '@mui/x-charts/LineChart'
import { createNumberArray } from '../utils/array'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'

export default function DataSummary() {
  const { trainingData, bestCandidateFields, unlabeledFields, fields, result, fullData } =
    useDataStore()

  console.log(result)

  const dataMapper = (d: Record<string, string>) => {
    const res: Record<string, string> = {}

    res[unlabeledFields[0]] = d[unlabeledFields[0]]

    for (const field of bestCandidateFields) {
      res[field] = d[field]
    }

    return res
  }

  const training = trainingData.map(dataMapper)

  const predictions = result
    ? [
        ...Object.entries(result.testing.predictions).map(([key, value]) => ({ key, value })),
        ...Object.entries(result.training.predictions).map(([key, value]) => ({ key, value })),
        ...Object.entries(result.validation.predictions).map(([key, value]) => ({ key, value })),
        ...Object.entries(result.prediction.predictions).map(([key, value]) => ({ key, value }))
      ]
    : []

  const xAxisData = fullData.map((d) => d[fields[0]])
  const actualData = training.map((d) => Number.parseFloat(d[unlabeledFields[0]]))
  const predictedData = result
    ? fullData.map((data) => predictions.find((p) => p.key == data[fields[0]])?.value ?? null)
    : []

  const totalDataSize = fullData.length
  const averageMAE =
    ((result?.training.mae ?? 0) + (result?.testing.mae ?? 0) + (result?.validation.mae ?? 0)) / 3

  const averageMSE =
    ((result?.training.mse ?? 0) + (result?.testing.mse ?? 0) + (result?.validation.mse ?? 0)) / 3

  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div>
        <LineChart
          xAxis={[
            {
              label: fields[0],
              data: createNumberArray(fullData.length),
              valueFormatter: (d) => xAxisData[d]
            }
          ]}
          series={[
            {
              label: 'Actual Data',
              data: actualData,
              color: 'gray'
            },
            {
              label: 'Predicted Data',
              data: predictedData
            }
          ]}
          height={400}
        />
      </div>
      <Box className="grid grid-cols-2 gap-4">
        <TableContainer className="h-max-content">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell colSpan={2}>
                  <span className="flex justify-center font-bold">Data Size</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Training Data Size</TableCell>
                <TableCell>{result?.training.size}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Testing Data Size</TableCell>
                <TableCell>{result?.testing.size}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Validation Data Size</TableCell>
                <TableCell>{result?.validation.size}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Prediction Data Size</TableCell>
                <TableCell>{result?.prediction.size}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Total Data Size</b>
                </TableCell>
                <TableCell>
                  <b>{totalDataSize}</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer className="h-max-content">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell colSpan={2}>
                  <span className="flex justify-center font-bold">Mean Average Error</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Training MAE</TableCell>
                <TableCell>{result?.training.mae}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Testing MAE</TableCell>
                <TableCell>{result?.testing.mae}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Validation MAE</TableCell>
                <TableCell>{result?.validation.mae}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Average MAE</b>
                </TableCell>
                <TableCell>
                  <b>{averageMAE}</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <TableContainer className="h-max-content">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell colSpan={2}>
                  <span className="flex justify-center font-bold">Mean Squared Error</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Training MSE</TableCell>
                <TableCell>{result?.training.mse}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Testing MSE</TableCell>
                <TableCell>{result?.testing.mse}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Validation MSE</TableCell>
                <TableCell>{result?.validation.mse}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Average MSE</b>
                </TableCell>
                <TableCell>
                  <b>{averageMSE}</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  )
}
