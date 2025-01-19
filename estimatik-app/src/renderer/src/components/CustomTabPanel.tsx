import { usePhaseStore } from '@renderer/stores/phase'
import { twMerge } from 'tailwind-merge'

interface TabPanelProps {
  children?: React.ReactNode
  className?: string
  index: number
}

export function CustomTabPanel(props: TabPanelProps) {
  const { phase } = usePhaseStore()
  const { children, index, className, ...other } = props

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={twMerge(
        'h-full grow flex flex-col',
        phase !== index ? 'hidden' : 'flex',
        className
      )}
      {...other}
    >
      {phase === index && <div className="p-2 flex flex-col h-full grow">{children}</div>}
    </div>
  )
}
