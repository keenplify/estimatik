import { Paper } from '@mui/material'
import dostLogo from '../assets/dost.webp'
import erdt from '../assets/erdt.png'
import mapua from '../assets/mapua.png'

export function Footer() {
  return (
    <Paper
      elevation={3}
      className="justify-self-center self-center mt-auto w-full flex justify-center"
    >
      <footer className="p-4 grid grid-cols-3 text-center max-w-6xl">
        <div className="flex justify-center col-span-2 items-center">
          <p className="text-xs text-gray-500">
            This application is developed by Engr. Julia Bien Florencio and funded by the Department
            of Science and Technology Engineering Research and Development for Technology
            (DOST-ERDT) Scholarship Program under Mapúa University.
          </p>
        </div>
        <div className="flex gap-4 items-center justify-center">
          <img src={dostLogo} className="w-12" />
          <img src={erdt} className="w-12" />
          <img src={mapua} className="w-12" />
        </div>
      </footer>
    </Paper>
  )
}
