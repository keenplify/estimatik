import { Box } from '@mui/material'
import { usePhaseStore } from '@renderer/stores/phase'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
}

export function CustomTabPanel(props: TabPanelProps) {
  const { phase } = usePhaseStore()
  const { children, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={phase !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {phase === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  )
}
