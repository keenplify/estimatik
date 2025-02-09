export function sendIpcMessage<Res>(event: string, ...args: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      console.log('running', event)
      window.electron.ipcRenderer.send(event, ...args)

      window.electron.ipcRenderer.once(`${event}-reply`, (_, response) => {
        console.log('response', response)
        resolve(response as Res)
      })

      window.electron.ipcRenderer.once(`${event}-error`, (_, error) => {
        console.log('reject', error)
        reject(error)
      })
    } catch (error) {
      console.log('error', error)
      reject(error)
    }
  })
}
