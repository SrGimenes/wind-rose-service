const endpoints = {
  TimeStamp: process.env.TIMESTAMP_ID,
  VelVento: process.env.VELVENTO_ID,
  DirVento: process.env.DIRVENTO_ID,
  Pressao: process.env.PRESSAO_ID,
  Temperatura: process.env.TEMPERATURA_ID,
  Umidade: process.env.UMIDADE_ID,
  RadiacaoSolar: process.env.RADIACAOSOLAR_ID,
  UV: process.env.UV_ID,
  Chuva: process.env.CHUVA_ID,
  EvapoTranspiracao: process.env.EVAPOTRANSPIRACAO_ID,
}

export function getUrl(key) {
  const baseUrl = process.env.BASE_URL
  const id = endpoints[key]
  return id ? `${baseUrl}/${id}/value` : null
}
