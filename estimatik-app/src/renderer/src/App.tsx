import { Box, createTheme, CssBaseline, Tab, Tabs, ThemeProvider } from '@mui/material'
import { CustomTabPanel } from '@renderer/components/CustomTabPanel'
import { Footer } from '@renderer/components/Footer'
import Info from '@renderer/components/Info'
import { DataImport } from '@renderer/components/phases/DataImport'
import { DataPreview } from '@renderer/components/phases/DataPreview'
import { usePhaseStore } from '@renderer/stores/phase'
import DataTreatment from './components/phases/DataTreatment'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DataTraining from './components/phases/DataTraining'
import { useDataStore } from './stores/data'
import DataSummary from './components/phases/DataSummary'
import { useEffect } from 'react'

const theme = createTheme({})

const queryClient = new QueryClient()

function App(): JSX.Element {
  const { phase, setPhase } = usePhaseStore()
  const { isSetup, bestCandidateFields, result } = useDataStore()

  const handleChange = (_, newValue: number) => {
    setPhase(newValue)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key == 'F12') {
        window.electron.ipcRenderer.send('devtools')
      }
    }

    document.addEventListener('keydown', handler, true)

    return () => document.removeEventListener('keydown', handler)
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="p-4 flex flex-col gap-4 min-h-screen">
          <Info />
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={phase} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Data Import" />
              <Tab label="Data Preview" disabled={!isSetup} />
              <Tab label="Data Treatment" disabled={!isSetup} />
              <Tab label="Data Training" disabled={!isSetup || bestCandidateFields.length == 0} />
              <Tab
                label="Data Summary"
                disabled={!isSetup || bestCandidateFields.length == 0 || !result}
              />
            </Tabs>
          </Box>
          <CustomTabPanel index={0}>
            <DataImport />
          </CustomTabPanel>
          <CustomTabPanel index={1}>
            <DataPreview />
          </CustomTabPanel>
          <CustomTabPanel index={2}>
            <DataTreatment />
          </CustomTabPanel>
          <CustomTabPanel index={3}>
            <DataTraining />
          </CustomTabPanel>
          <CustomTabPanel index={4}>
            <DataSummary />
          </CustomTabPanel>
          <Footer />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
