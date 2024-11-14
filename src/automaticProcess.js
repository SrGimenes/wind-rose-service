import axios from 'axios'
import { getUrl } from './config.js'
import { fetchAndProcessData } from './dataFetcher.js'
import { auth, headers } from './routes.js'

export function transformDataToPims(inputData) {
  return inputData.map(item => {
    const timestamp = item.DataHora.endsWith('Z')
      ? item.DataHora
      : `${item.DataHora}Z`
    const basePoint = {
      Timestamp: timestamp,
      Good: true,
      Questionable: false,
    }

    return {
      VelVento: {
        ...basePoint,
        UnitsAbbreviation: 'm/s',
        Value: item.VelVento,
      },
      DirVento: {
        ...basePoint,
        UnitsAbbreviation: 'graus',
        Value: item.DirVento,
      },
      Pressao: {
        ...basePoint,
        UnitsAbbreviation: 'hPa',
        Value: item.Pressao,
      },
      Temperatura: {
        ...basePoint,
        UnitsAbbreviation: '°C',
        Value: item.Temperatura,
      },
      Umidade: {
        ...basePoint,
        UnitsAbbreviation: '%',
        Value: item.Umidade,
      },
      RadiacaoSolar: {
        ...basePoint,
        UnitsAbbreviation: 'W/m²',
        Value: item.RadiacaoSolar,
      },
      UV: {
        ...basePoint,
        UnitsAbbreviation: 'índice',
        Value: item.UV,
      },
      Chuva: {
        ...basePoint,
        UnitsAbbreviation: 'mm',
        Value: item.Chuva,
      },
      EvapoTranspiracao: {
        ...basePoint,
        UnitsAbbreviation: 'mm',
        Value: item.EvapoTranspiracao,
      },
    }
  })
}

export const sendRequests = async item => {
  console.log('Enviando item', item)

  if (!item) {
    console.error('Objeto não fornecido')
    return { success: false, message: 'Dados não fornecido', details: [] }
  }

  const requests = Object.entries(item)
    .map(([key, value]) => {
      const url = getUrl(key)
      if (!url) {
        console.warn(`URL não definida para a chave ${key}`)
        return null
      }
      return { key, request: axios.post(url, value, { auth, headers }) }
    })
    .filter(request => request !== null)

  try {
    const results = await Promise.all(
      requests.map(async ({ key, request }) => {
        try {
          const response = await request
          // Verificar se a resposta indica sucesso (pode variar dependendo da API do PIMS)
          if (
            (response.status === 200 || response.status === 202) &&
            response.data
          ) {
            return {
              key,
              success: true,
              status: response.status,
              message: 'Dados cadastrados com sucesso',
            }
          }
          return {
            key,
            success: false,
            status: response.status,
            message: 'Falha ao cadastrar dados',
          }
        } catch (error) {
          return {
            key,
            success: false,
            status: error.response?.status,
            message: error.message,
          }
        }
      })
    )

    const failedRequests = results.filter(result => !result.success)

    console.log('Resultados:', results)

    return {
      success: failedRequests.length === 0,
      message:
        failedRequests.length === 0
          ? 'Todos os dados foram cadastrados com sucesso'
          : 'Alguns dados não foram cadastrados',
      details: results,
    }
  } catch (error) {
    console.error('Erro nas requisições:', error.message)
    console.error('Dados enviados', item)
    return {
      success: false,
      message: 'Erro ao processar requisições',
      error: error.message,
      details: [],
    }
  }
}

export const sendDataWithDelay = async data => {
  console.log('Dados recebidos para envio:', data)

  if (!Array.isArray(data)) {
    console.error('Os dados recebidos não são um array:', data)
    return { success: false, message: 'Dados inválidos', details: [] }
  }

  const transformedData = transformDataToPims(data)
  const results = []

  for (let i = 0; i < transformedData.length; i++) {
    console.log(`Enviando item ${i + 1}:`, transformedData[i])
    const result = await sendRequests(transformedData[i])
    results.push(result)
    // await sendRequests(transformedData[i]);
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 segundos de intervalo
  }

  const allSuccessful = results.every(result => result.success)
  return {
    success: allSuccessful,
    message: allSuccessful
      ? 'Todos os dados foram processados com sucesso'
      : 'Alguns dados não foram processados corretamente',
    details: results,
  }
}

export async function startAutomaticProcess() {
  try {
    console.log('=== Iniciando processo automático ===')

    // Primeira execução
    const data = await fetchAndProcessData()
    await sendDataWithDelay([data])

    // Configura execução periódica
    setInterval(async () => {
      try {
        console.log('\n=== Nova execução automática ===')
        const newData = await fetchAndProcessData()
        await sendDataWithDelay([newData])
      } catch (error) {
        console.error('Erro na execução automática:', error.message)
      }
    }, 60000)
  } catch (error) {
    console.error('Erro ao iniciar processo automático:', error.message)
  }
}
