import { Paper } from '@mui/material'
import estimatikLogo from '../../../../resources/full.png'

export default function Info(): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Paper elevation={3} className="p-4 flex items-end gap-2">
        <img src={estimatikLogo} className="h-8" />
        <span>
          is an AI-powered application designed to predict construction material prices based on
          macroeconomic indicators using artificial neural networks.
        </span>
      </Paper>
    </div>
  )
}
