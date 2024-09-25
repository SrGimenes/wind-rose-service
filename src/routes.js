import axios from "axios";
import fs from 'fs'

const auth = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}

const headers = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'for-CSRF-defense'
}

const loadData = () => {
  try {
    const data = fs.readFileSync('C:/www/Wind-Rose-Service/db/data.json', 'utf-8');
    const parsedData = JSON.parse(data)

    if (!Array.isArray(parsedData)) {
      console.error('O arquivo JSON não contém um array', parsedData)
      return [];
    }

    return parsedData;
  } catch (error) {
    console.error('Erro ao ler o arquivo JSON:', error.message);
    return [];
  }
}

const data = loadData();
const sendRequests = async (item) => {
  console.log('Enviando item', item)

  if (!item || typeof item.DataHora === 'undefined') {
    console.error('O item não possui os dados esperados', item)
    return
  }
  const requests = [
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wpioAAARUNTQUxWTTA1NlxSU0RSLUVNLlZFTA/value', { "Value": item.VelVento }, { auth, headers }), //VelVento
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wpyoAAARUNTQUxWTTA1NlxSU0RSLUVNLkRJUg/value', { "Value": item.DirVento }, { auth, headers }), //DirVento
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlBSRVM/value', { "Value": item.Pressao }, { auth, headers }), //Pressão
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqSoAAARUNTQUxWTTA1NlxSU0RSLUVNLlRFTVA/value', { "Value": item.Temperatura }, { auth, headers }), //Temperatura
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqioAAARUNTQUxWTTA1NlxSU0RSLUVNLlVNSQ/value', { "Value": item.Umidade }, { auth, headers }), //Umidade
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqyoAAARUNTQUxWTTA1NlxSU0RSLUVNLlJBRA/value', { "Value": item.Radiacao }, { auth, headers }), //Radiação
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlVW/value', { "Value": item.UV, }, { auth, headers }), //RaiosUv
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrSoAAARUNTQUxWTTA1NlxSU0RSLUVNLkNIVQ/value', { "Value": item.Chuva, }, { auth, headers }), //Chuva
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrioAAARUNTQUxWTTA1NlxSU0RSLUVNLlRSQU4/value', { "Value": item.Transpiracao }, { auth, headers }) //Transpiração

  ]

  try {
    const responses = await axios.all(requests);
    responses.forEach(response => {
      console.log('Status', response.status)
    })
  } catch (error) {
    console.error('Erro nas requisições:', error.message)
    console.error('Dados enviados', item)
  }
}
const sendDataWithDelay = async (data) => {
  console.log('Dados recebidos para envio:', data)

  if (!Array.isArray(data)) {
    console.error('Os dados recebidos não são um array:', data)
    return;
  }

  for (let i = 0; i < data.length; i++) {
    console.log(`Enviando item ${i + 1}:`, data)
    await sendRequests(data[i])
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

export const routes = [
  {
    method: 'POST',
    path: /^\/api\/send-data$/,
    handler: async (req, res) => {
      try {
        const data = loadData();
        await sendDataWithDelay(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Dados enviados com sucesso!', statuses }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
  }
]