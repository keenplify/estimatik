import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useDataStore } from '@renderer/stores/data'

export function DataPreview() {
  const { trainingData, predictionData, fields, units } = useDataStore()

  const columns: GridColDef[] = fields.map((field) => ({
    field,
    headerName: field,
    description: field,
    flex: 1,
    renderHeader: ({ field }) => {
      const unit = units[field]
      return (
        <div className="flex flex-col w-full">
          <div className="truncate w-full font-bold">{field}</div>
          {unit && <small className="truncate w-full italic">({unit})</small>}
        </div>
      )
    }
  }))

  const rows = [
    ...predictionData.map((d) => ({
      ...d
    })),
    ...trainingData.map((d) => ({
      ...d
    }))
  ].map((d, i) => ({ ...d, id: i }))

  return (
    <div>
      <DataGrid
        rows={rows}
        columns={columns}
        autosizeOptions={{
          expand: true
        }}
      />
    </div>
  )
}
