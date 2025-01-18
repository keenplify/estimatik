import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useDataStore } from '@renderer/stores/data'
import { twMerge } from 'tailwind-merge'

export function DataPreview() {
  const { trainingData, predictionData, fields, units } = useDataStore()

  const columns: GridColDef[] = fields.map((field, index) => {
    let renderCell: GridColDef['renderCell']

    switch (index) {
      case 0:
        renderCell = ({ value }) => {
          return (
            <div className="w-full h-[calc(100%-8px)] mt-1 px-2 border-solid border-[1px] flex items-center bg-slate-100 border-slate-300">
              {value}
            </div>
          )
        }
        break
      case 1:
        renderCell = ({ value }) => {
          return (
            <div
              className={twMerge(
                'w-full h-[calc(100%-8px)] mt-1 px-2 border-solid border-[1px] flex items-center',
                `${value}`.length == 0
                  ? 'bg-orange-100 border-orange-300'
                  : 'bg-yellow-100 border-yellow-300'
              )}
            >
              {value}
            </div>
          )
        }
        break
    }

    return {
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
      },
      renderCell
    }
  })

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
      <div className="mb-2">
        <h5>Grid Legend</h5>
        <div className="flex gap-4">
          <div className="flex gap-2 items-center">
            <div className="w-4 h-4 bg-slate-100 outline outline-1 outline-slate-300" />
            <label>Label</label>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-4 h-4 bg-orange-100 outline outline-1 outline-orange-300" />
            <label>Price to Predict</label>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-4 h-4 bg-yellow-100 outline outline-1 outline-yellow-300" />
            <label>Construction Prices</label>
          </div>
          <div className="flex gap-2 items-center">
            <div className="w-4 h-4 outline outline-1 outline-slate-200" />
            <label>Macroeconomic Indicators</label>
          </div>
        </div>
      </div>
      <DataGrid
        rows={rows}
        columns={columns}
        autosizeOptions={{
          expand: true
        }}
        rowSelection={false}
      />
    </div>
  )
}
