const url = 'https://detectorderaios.com.br/Dados/EURO.csv'

export async function handleProcessError() {
  try {
    console.log('------ Iniciando ciclo de atualização ------')
    console.log('Hora início:', new Date().toLocaleTimeString())

    await fetchAndProcessData()
    console.log('Dados processados com sucesso!')

    // Configura próxima execução
    console.log('------ Configurando próxima execução ------')
    console.log('Próxima atualização em 1 minuto')
    setInterval(async () => {
      console.log('\n------ Novo ciclo iniciando ------')
      console.log('Hora início:', new Date().toLocaleTimeString())
      await fetchAndProcessData()
      console.log('Dados processados com sucesso!')
      console.log('Próxima atualização em 1 minuto')
    }, 60000)
  } catch (error) {
    console.error('❌ Erro durante processamento:', error.message)
    console.error('Tipo do erro:', error.name)
  }
}

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
    const DataHora = originalDate.toISOString()
    const newArray = createObjectFromArrays(
      newHeadersArray,
      newValuesArray,
      DataHora
    )

    //console.log(headers)
    console.log(newArray)
    //console.log(newArray)
    return newArray
  } catch (error) {
    console.log(error)
    throw error
  }
}

function createObjectFromArrays(newHeadersArray, newValuesArray, DataHora) {
  if (newHeadersArray.length !== newValuesArray.length) {
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
    { DataHora }
  )
  return object
}

//console.log(fetchAndProcessData())
