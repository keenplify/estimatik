import { writeFile, unlink } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { v4 as uuidv4 } from 'uuid'
import Papa from 'papaparse'
import { netron } from '..'
import { isProd, isWindows } from './env'
import { sync } from 'mkdirp'
import { app } from 'electron'

/**
 * Executes a Python script with the provided CSV data and additional arguments.
 * @param data - Array of objects containing the data.
 * @param predictionData - Array of objects containing the prediction data.
 * @param scriptName - The name of the Python script to execute.
 * @param args - Additional arguments to pass to the Python script.
 * @returns A promise that resolves with the script result.
 */
function executePythonScript(
  data: Record<string, string>[],
  predictionData: Record<string, string>[] | null,
  scriptName: string,
  args?: Record<string, any>
): Promise<string> {
  const python = import.meta.env.VITE_WSL_PYTHON_PATH || 'python'

  return new Promise((resolve, reject) => {
    // Convert data to CSV
    const csv = Papa.unparse(data)

    // Create a temporary folder path
    sync('temp')

    // Create a temporary file path with a UUID
    const tempFilePath = `temp/${uuidv4()}.csv`

    // Write the CSV data to the temporary file
    writeFile(tempFilePath, csv, (err) => {
      if (err) {
        return reject(err)
      }

      let command: string

      command = `${python} "${join(app.getAppPath(), 'resources', scriptName).replace(/\\/g, '/')}" -file "${tempFilePath}"`

      if (predictionData) {
        // Convert prediction data to CSV
        const predictionCsv = Papa.unparse(predictionData)
        const tempPredictionFilePath = `temp/${uuidv4()}.csv`

        // Write the prediction CSV data to the temporary file
        writeFile(tempPredictionFilePath, predictionCsv, (err) => {
          if (err) {
            return reject(err)
          }

          command += ` -predictionfile "${tempPredictionFilePath}"`

          if (args) {
            for (const [key, value] of Object.entries(args)) {
              command += ` -${key} "${value}"`
            }
          }

          // Call the Python script
          exec(
            isProd && isWindows ? `wsl ${command.replace('C:/', '/mnt/c/')}` : command,
            (error, stdout, stderr) => {
              if (error) {
                console.error('Error executing Python script:', error)
              }

              if (stderr) {
                console.error('Python script stderr:', stderr)
              }

              setTimeout(() => {
                // Delete the temporary files
                unlink(tempFilePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error('Failed to delete temporary file:', unlinkErr)
                  }
                })

                unlink(tempPredictionFilePath, (unlinkErr) => {
                  if (unlinkErr) {
                    console.error('Failed to delete temporary prediction file:', unlinkErr)
                  }
                })
              }, 5000)

              resolve(stdout)
            }
          )
        })
      } else {
        if (args) {
          for (const [key, value] of Object.entries(args)) {
            command += ` -${key} "${value}"`
          }
        }

        // Call the Python script
        exec(
          isProd && isWindows ? `wsl ${command.replace('C:/', '/mnt/c/')}` : command,
          (error, stdout, stderr) => {
            if (error) {
              console.error('Error executing Python script:', error)
              return reject(error)
            }

            if (stderr) {
              console.error('Python script stderr:', stderr)
            }

            // Delete the temporary file
            unlink(tempFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Failed to delete temporary file:', unlinkErr)
              }
            })

            resolve(stdout)
          }
        )
      }
    })
  })
}

/**
 * Calls the Python analysis script with the provided data and additional arguments.
 * @param data - Array of objects containing the data.
 * @param args - Additional arguments to pass to the Python script.
 * @returns A promise that resolves with the analysis result.
 */
export function callPythonAnalysis(
  data: Record<string, string>[],
  args?: Record<string, any>
): Promise<string> {
  return executePythonScript(data, null, 'analysis.py', args)
}

/**
 * Calls the Python training script with the provided data, prediction data, and additional arguments.
 * @param data - Array of objects containing the data.
 * @param predictionData - Array of objects containing the prediction data.
 * @param args - Additional arguments to pass to the Python script.
 * @returns A promise that resolves with the training result.
 */
export function callPythonTraining(
  data: Record<string, string>[],
  predictionData: Record<string, string>[] | null,
  args?: Record<string, any>
): Promise<string> {
  return executePythonScript(data, predictionData, 'train.py', args)
}

export function openNetron(path: string, event: Electron.IpcMainEvent) {
  return new Promise((resolve) => {
    netron.process = exec(`netron "${path}"`, (error, stdout, stderr) => {
      if (error) {
        // console.error('Error executing Netron start:', error)
      }

      if (stderr) {
        console.error('Netron start stderr:', stderr)
      }

      resolve(stdout) // You still return the final stdout when the process ends
    })

    // Listen to the stdout stream and log output as it arrives
    netron.process.stdout?.on('data', (data) => {
      // Check if the data contains a URL like "http://localhost:8080"
      const match = data.toString().match(/Serving.*at\s+(http:\/\/\S+)/)
      if (match && match[1]) {
        const link = match[1] // This will be the URL, e.g., 'http://localhost:8080'
        event.reply('netron-link', link) // Send the link back to the renderer
      }
    })

    // You can also listen to stderr if you want to log errors
    netron.process.stderr?.on('data', (data) => {
      event.reply('netron-err', data)
      console.error(data.toString())
    })
  })
}
