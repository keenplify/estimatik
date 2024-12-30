import { Paper } from '@mui/material'

export default function Info(): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Paper elevation={3} className="p-4">
        <h4>Estimatik</h4>
        <p>
          EstiMATIK is an AI-powered application designed to predict construction material prices
          based on macroeconomic indicators using artificial neural networks.
        </p>
      </Paper>
    </div>
  )
}
