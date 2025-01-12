import { app } from 'electron';
import { writeFile, unlink } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';

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
  return new Promise((resolve, reject) => {
    // Convert data to CSV
    const csv = Papa.unparse(data);

    // Create a temporary folder path
    const tempFolderPath = app.getPath('temp');

    // Create a temporary file path with a UUID
    const tempFilePath = join(tempFolderPath, `${uuidv4()}.csv`);

    // Write the CSV data to the temporary file
    writeFile(tempFilePath, csv, (err) => {
      if (err) {
        return reject(err);
      }

      let command = `python3 "${join(app.getAppPath(), 'src', 'main', 'python', scriptName)}" -file "${tempFilePath}"`;

      if (predictionData) {
        // Convert prediction data to CSV
        const predictionCsv = Papa.unparse(predictionData);
        const tempPredictionFilePath = join(tempFolderPath, `${uuidv4()}.csv`);

        // Write the prediction CSV data to the temporary file
        writeFile(tempPredictionFilePath, predictionCsv, (err) => {
          if (err) {
            return reject(err);
          }

          command += ` -predictionfile "${tempPredictionFilePath}"`;

          if (args) {
            for (const [key, value] of Object.entries(args)) {
              command += ` -${key} "${value}"`;
            }
          }

          // Call the Python script
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error('Error executing Python script:', error);
            }

            if (stderr) {
              console.error('Python script stderr:', stderr);
            }

            // Delete the temporary files
            unlink(tempFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Failed to delete temporary file:', unlinkErr);
              }
            });

            unlink(tempPredictionFilePath, (unlinkErr) => {
              if (unlinkErr) {
                console.error('Failed to delete temporary prediction file:', unlinkErr);
              }
            });

            resolve(stdout);
          });
        });
      } else {
        if (args) {
          for (const [key, value] of Object.entries(args)) {
            command += ` -${key} "${value}"`;
          }
        }

        // Call the Python script
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error('Error executing Python script:', error);
            return reject(error);
          }

          if (stderr) {
            console.error('Python script stderr:', stderr);
          }

          // Delete the temporary file
          unlink(tempFilePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Failed to delete temporary file:', unlinkErr);
            }
          });

          resolve(stdout);
        });
      }
    });
  });
}

/**
 * Calls the Python analysis script with the provided data and additional arguments.
 * @param data - Array of objects containing the data.
 * @param args - Additional arguments to pass to the Python script.
 * @returns A promise that resolves with the analysis result.
 */
export function callPythonAnalysis(data: Record<string, string>[], args?: Record<string, any>): Promise<string> {
  return executePythonScript(data, null, 'analysis.py', args);
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
  return executePythonScript(data, predictionData, 'train.py', args);
}