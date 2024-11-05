import fs from 'node:fs'
import axios from 'axios'

// Configurações
const auth = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
}

const headers = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'for-CSRF-defense',
}

const url = 'https://detectorderaios.com.br/Dados/EURO.csv'

export async function fetchAndProcessData() {
  try {
    const response = await fetch(url)
    const responseText = await response.text()

    const lines = responseText.split('\r\n')

    const headers = lines[0].split(';')
    const values = lines[1].split(';')
    const newHeadersArray = headers.slice(1)
    const newValuesArray = values.slice(1)

    const dateTime = response.headers.get('date')
    const originalDate = new Date(dateTime)
    originalDate.setUTCHours(originalDate.getUTCHours() - 3)
    const dataHora = originalDate.toISOString()
    const newArray = createObjectFromArrays(
      newHeadersArray,
      newValuesArray,
      dataHora
    )

    //console.log(headers)
    console.log(newArray)
    //console.log(newArray)
  } catch (error) {
    console.log(error)
  }
}

function createObjectFromArrays(newHeadersArray, newValuesArray, dataHora) {
  if (
    newHeadersArray.length !== newValuesArray.length ||
    newValuesArray.lenght === 0 ||
    newValuesArray.length === 0
  ) {
    return null
  }

  const object = newHeadersArray.reduce(
    (acc, cur, idx) => {
      return {
        // biome-ignore lint/performance/noAccumulatingSpread: <explanation>
        ...acc,
        [cur]: Number(newValuesArray[idx].replace(',', '.')),
      }
    },
    { dataHora }
  )
  return object
}

await fetchAndProcessData()

function transformDataToPims(inputData) {
  return inputData.map(item => {
    const timestamp = `${item.DataHora}Z`
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
      Radiacao: {
        ...basePoint,
        UnitsAbbreviation: 'W/m²',
        Value: item.Radiacao,
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
      Transpiracao: {
        ...basePoint,
        UnitsAbbreviation: 'mm',
        Value: item.Transpiracao,
      },
    }
  })
}

const loadData = () => {
  try {
    const data = fs.readFileSync(
      'C:/www/Wind-Rose-Service/db/data.json',
      'utf-8'
    )
    const parsedData = JSON.parse(data)

    if (!Array.isArray(parsedData)) {
      console.error('O arquivo JSON não contém um array', parsedData)
      return []
    }

    return parsedData
  } catch (error) {
    console.error('Erro ao ler o arquivo JSON:', error.message)
    return []
  }
}

const sendRequests = async item => {
  console.log('Enviando item', item)

  if (!item || typeof item.DataHora === 'undefined') {
    console.error('O item não possui os dados esperados', item)
    return { success: false, message: 'Dados inválidos', details: [] }
  }
  const requests = Object.entries(item)
    .map(([key, value]) => {
      let url
      switch (key) {
        case 'TimeStamp':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_w3CoAAARUNTQUxWTTA1NlxSU0RSLUVNLlRJTUU/value'
          break
        case 'VelVento':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wpioAAARUNTQUxWTTA1NlxSU0RSLUVNLlZFTA/value'
          break
        case 'DirVento':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wpyoAAARUNTQUxWTTA1NlxSU0RSLUVNLkRJUg/value'
          break
        case 'Pressao':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wqCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlBSRVM/value'
          break
        case 'Temperatura':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wqSoAAARUNTQUxWTTA1NlxSU0RSLUVNLlRFTVA/value'
          break
        case 'Umidade':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wqioAAARUNTQUxWTTA1NlxSU0RSLUVNLlVNSQ/value'
          break
        case 'Radiacao':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wqyoAAARUNTQUxWTTA1NlxSU0RSLUVNLlJBRA/value'
          break
        case 'UV':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wrCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlVW/value'
          break
        case 'Chuva':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wrSoAAARUNTQUxWTTA1NlxSU0RSLUVNLkNIVQ/value'
          break
        case 'Transpiracao':
          url =
            'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wrioAAARUNTQUxWTTA1NlxSU0RSLUVNLlRSQU4/value'
          break
        default:
          console.warn(`URL não definida para a chave: ${key}`)
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
            response.status === 200 &&
            response.data &&
            response.data.Value === item[key].Value
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

const sendDataWithDelay = async data => {
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

export const routes = [
  {
    method: 'POST',
    path: /^\/api\/send-data$/,
    handler: async (req, res) => {
      try {
        const data = loadData()
        await sendDataWithDelay(data)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(
          JSON.stringify({ message: 'Dados enviados com sucesso!', statuses })
        )
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: error.message }))
      }
    },
  },
]
