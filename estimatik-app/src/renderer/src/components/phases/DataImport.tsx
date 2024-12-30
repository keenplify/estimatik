import { styled } from '@mui/material/styles'
import Button from '@mui/material/Button'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'

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
  return (
    <div>
      <p>Please upload a .CSV file containing your dataset. Ensure that:</p>
      <ol>
        <li>The first column contains the output data.</li>
        <li>The second and subsequent columns contain the input data.</li>
        <li>The first row contains the labels for both output and input data.</li>
        <li>Last rows......</li>
      </ol>
      <div className="mt-4">
        <Button component="label" variant="contained" tabIndex={-1} startIcon={<CloudUploadIcon />}>
          Upload CSV
          <VisuallyHiddenInput type="file" onChange={(event) => console.log(event.target.files)} />
        </Button>
      </div>
    </div>
  )
}
