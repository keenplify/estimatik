import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import Papa from 'papaparse'
import { useDataStore } from '@renderer/stores/data'
import { usePhaseStore } from '@renderer/stores/phase'

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
})

export function DataImport() {
  const { setup } = useDataStore()
  const { setPhase } = usePhaseStore()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse<Record<string, string>>(file, {
        complete: (result) => {
          setup(result.data, result.meta.fields)
          setPhase(1)
        },
        header: true,
        skipEmptyLines: true
      })
    }
  }

  return (
    <div>
      <p>Please upload a .CSV file containing your dataset. Ensure that:</p>
      <ol>
        <li>The first column should contain the Period of the data (e.g., "2021Q3").</li>
        <li>The second column should contain the Construction Material Prices.</li>
        <li>
          The third column onward should contain Macroeconomic Indicators (e.g., Inflation Rate,
          GDP, Employment Rate, etc.).
        </li>
        <li>
          The first row must contain the labels for each column (e.g., "Period," "Material Prices,"
          "GDP," etc.).
        </li>
        <li>
          The second row must contain the units of measurement for each column (e.g., "Month-Year,"
          "USD/ton," "%," etc.).
        </li>
        <li>
          From the third row onward, provide the data points for each column in the respective units
          of measurement.
        </li>
        <li>
          Do not include commas (,) within the data values or labels. Use alternative formatting
          such as a space or period if necessary.
        </li>
      </ol>
      <div className="mt-4">
        <Button component="label" variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}>
          Upload CSV
          <VisuallyHiddenInput type="file" onChange={handleFileChange} />
        </Button>
      </div>
    </div>
  )
}
