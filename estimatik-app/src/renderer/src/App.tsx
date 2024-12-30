import { Box, createTheme, CssBaseline, Tab, Tabs, ThemeProvider } from '@mui/material'
import { CustomTabPanel } from '@renderer/components/CustomTabPanel'
import { Footer } from '@renderer/components/Footer'
import Info from '@renderer/components/Info'
import { DataImport } from '@renderer/components/phases/DataImport'
import { DataPreview } from '@renderer/components/phases/DataPreview'
import { usePhaseStore } from '@renderer/stores/phase'

const theme = createTheme({
  palette: {
    mode: 'dark'
  }
})

function App(): JSX.Element {
  const { phase, setPhase } = usePhaseStore()
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const handleChange = (_, newValue: number) => {
    setPhase(newValue)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="p-4 flex flex-col gap-4 min-h-screen">
        <Info />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={phase} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Data Import" />
            <Tab label="Data Preview" />
            <Tab label="Output" />
          </Tabs>
        </Box>
        <CustomTabPanel index={0}>
          <DataImport />
        </CustomTabPanel>
        <CustomTabPanel index={1}>
          <DataPreview />
        </CustomTabPanel>
        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
