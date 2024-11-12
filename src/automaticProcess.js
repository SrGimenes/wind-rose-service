import { fetchAndProcessData } from "./dataFetcher.js"
import { sendDataWithDelay, transformDataToPims } from './routes.js'

async function startAutomaticProcess() {
    try {
      console.log('=== Iniciando processo automático ===')
      
      // Primeira execução
      const data = await fetchAndProcessData
      await sendDataWithDelay(data)

      // Configura execução periódica
      setInterval(async () => {
        try {
          console.log('\n=== Nova execução automática ===')
          const newData = await fetchAndProcessData()
          await sendDataWithDelay(newData)
        } catch (error) {
          console.error('Erro na execução automática:', error.message)
        }
      }, 60000)
  
    } catch (error) {
      console.error('Erro ao iniciar processo automático:', error.message)
    }
}