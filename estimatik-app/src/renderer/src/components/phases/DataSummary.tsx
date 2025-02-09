import { useDataStore } from '@renderer/stores/data'
import { LineChart } from '@mui/x-charts/LineChart'
import { createNumberArray } from '../utils/array'
import {
  Box,
  Button,
  Link,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'

const steps: { label: string; description?: string }[] = [
  {
    label: 'Predictions'
  }
]

export default function DataSummary() {
  const { trainingData, bestCandidateFields, unlabeledFields, fields, result, fullData } =
    useDataStore()
  const [activeStep] = useState(0)
  const [link, setLink] = useState<string>()

  useEffect(() => {
    if (!result) return

    console.log({ result })

    window.electron.ipcRenderer.send('open-in-netron', result.model_path)

    window.electron.ipcRenderer.once('netron-link', (_, link) => {
      setLink(link)
    })

    window.electron.ipcRenderer.once('netron-error', (_, error) => {
      console.error(error)
    })

    return () => {
      window.electron.ipcRenderer.send('shutdown-netron')
      setLink(undefined)
    }
  }, [result])

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
    <div className="flex gap-2 h-full grow">
      <Box sx={{ width: 400 }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography>You can also preview the model in netron</Typography>

                  {link ? (
                    <Link href={link} target="_blank" rel="noreferrer" sx={{ mt: 1, mr: 1 }}>
                      Open Netron
                    </Link>
                  ) : (
                    result && (
                      <Button
                        variant="contained"
                        sx={{ mt: 1, mr: 1 }}
                        onClick={() => {
                          window.electron.ipcRenderer.send('open-in-netron', result.model_path)
                        }}
                      >
                        Open Netron
                      </Button>
                    )
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Box>
      <div className="grow flex flex-col">
        <div className={twMerge('grid-cols-2 gap-4 w-full', activeStep == 0 ? 'grid' : 'hidden')}>
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
                },
                {
                  label: 'Data to be Predicted',
                  data: predictedData.map((_, pIndex) => {
                    const found = actualData[pIndex]
                    if (found) {
                      return null
                    } else {
                      return actualData[actualData.length - 1]
                    }
                  }),
                  color: 'red'
                }
              ]}
              height={400}
            />
          </div>
          {result && (
            <img src={`data:image/png;base64,${result.histogramImg}`} className="h-[400px]" />
          )}

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
                    <TableCell>
                      {result?.training.mae && Number(`${result?.training.mae}`).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Testing MAE</TableCell>
                    <TableCell>
                      {result?.testing.mae && Number(`${result?.testing.mae}`).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Validation MAE</TableCell>
                    <TableCell>
                      {result?.validation.mae && Number(`${result?.validation.mae}`).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Average MAE</b>
                    </TableCell>
                    <TableCell>
                      <b>{Number(`${averageMAE}`).toFixed(2)}</b>
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
                    <TableCell>
                      {result?.training.mse && Number(`${result?.training.mse}`).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Testing MSE</TableCell>
                    <TableCell>
                      {result?.testing.mse && Number(`${result?.testing.mse}`).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Validation MSE</TableCell>
                    <TableCell>
                      {result?.validation.mse && Number(`${result?.validation.mse}`).toFixed(2)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Average MSE</b>
                    </TableCell>
                    <TableCell>
                      <b>{Number(`${averageMSE}`).toFixed(2)}</b>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </div>
        <div
          className={twMerge('w-full h-full grow flex-col', activeStep == 1 ? 'flex' : 'hidden')}
        >
          {link && <iframe src={link} className="grow" />}
        </div>
      </div>
    </div>
  )
}
