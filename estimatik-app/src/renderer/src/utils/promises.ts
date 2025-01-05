export function sendIpcMessage<Res>(event: string, ...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      window.electron.ipcRenderer.send(event, ...args)

      window.electron.ipcRenderer.once(`${event}-reply`, (_, response) => {
        resolve(response as Res)
      })

      window.electron.ipcRenderer.once(`${event}-error`, (_, error) => {
        reject(error)
      })
    } catch (error) {
      reject(error)
    }
  })
}
