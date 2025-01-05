import { exec } from 'child_process'
import { writeFile, unlink, mkdir, rmdir } from 'fs'
import { join } from 'path'
import Papa from 'papaparse'
import { app } from 'electron'
import { v4 as uuidv4 } from 'uuid'

/**
 * Calls the Python analysis script with the provided data.
 * @param data - Array of objects containing the data.
 * @returns A promise that resolves with the analysis result.
 */
export function callPythonAnalysis(data: Record<string, string>[]): Promise<string> {
  return new Promise((resolve, reject) => {
    // Convert data to CSV
    const csv = Papa.unparse(data)

    // Create a temporary folder path
    const tempFolderPath = app.getPath('temp')

    // Create a temporary file path with a UUID
    const tempFilePath = join(tempFolderPath, `${uuidv4()}.csv`)

    // Write the CSV data to the temporary file
    writeFile(tempFilePath, csv, (err) => {
      if (err) {
        return reject(err)
      }

      // Construct the absolute path to the Python script
      const pythonScriptPath = join(app.getAppPath(), 'src', 'main', 'python', 'analysis.py')

      // Call the Python script
      exec(`python "${pythonScriptPath}" -file "${tempFilePath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error('Error executing Python script:', error)
          return reject(error)
        }

        if (stderr) {
          console.error('Python script stderr:', stderr)
          return reject(new Error(stderr))
        }

        // Delete the temporary file and folder
        // unlink(tempFilePath, (unlinkErr) => {
        //   if (unlinkErr) {
        //     console.error('Failed to delete temporary file:', unlinkErr)
        //   }
        // })

        resolve(stdout)
      })
    })
  })
}
