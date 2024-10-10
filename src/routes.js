import axios from "axios";
import fs from 'node:fs';

const auth = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}

const headers = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'for-CSRF-defense'
}

function transformDataToPims(inputData) {
  return inputData.map(item => {
    const timestamp = `${item.DataHora}Z`;
    const basePoint = {
      Timestamp: timestamp,
      Good: true,
      Questionable: false
    };

    return {
      VelVento: {
        ...basePoint,
        UnitsAbbreviation: "m/s",
        Value: item.VelVento
      },
      DirVento: {
        ...basePoint,
        UnitsAbbreviation: "graus",
        Value: item.DirVento
      },
      Pressao: {
        ...basePoint,
        UnitsAbbreviation: "hPa",
        Value: item.Pressao
      },
      Temperatura: {
        ...basePoint,
        UnitsAbbreviation: "°C",
        Value: item.Temperatura
      },
      Umidade: {
        ...basePoint,
        UnitsAbbreviation: "%",
        Value: item.Umidade
      },
      Radiacao: {
        ...basePoint,
        UnitsAbbreviation: "W/m²",
        Value: item.Radiacao
      },
      UV: {
        ...basePoint,
        UnitsAbbreviation: "índice",
        Value: item.UV
      },
      Chuva: {
        ...basePoint,
        UnitsAbbreviation: "mm",
        Value: item.Chuva
      },
      Transpiracao: {
        ...basePoint,
        UnitsAbbreviation: "mm",
        Value: item.Transpiracao
      }
    }
  })
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


const sendRequests = async (item) => {
  console.log('Enviando item', item)

  if (!item || typeof item.DataHora === 'undefined') {
    console.error('O item não possui os dados esperados', item)
    return
  }
  const requests = Object.entries(item).map(([key, value]) => {
    let url;
    switch (key) {
      case 'TimeStamp':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_w3CoAAARUNTQUxWTTA1NlxSU0RSLUVNLlRJTUU/value';
        break;
      case 'VelVento':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wpioAAARUNTQUxWTTA1NlxSU0RSLUVNLlZFTA/value';
        break;
      case 'DirVento':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wpyoAAARUNTQUxWTTA1NlxSU0RSLUVNLkRJUg/value';
        break;
      case 'Pressao':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wqCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlBSRVM/value';
        break;
      case 'Temperatura':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wqSoAAARUNTQUxWTTA1NlxSU0RSLUVNLlRFTVA/value';
        break;
      case 'Umidade':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wqioAAARUNTQUxWTTA1NlxSU0RSLUVNLlVNSQ/value';
        break;
      case 'Radiacao':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wqyoAAARUNTQUxWTTA1NlxSU0RSLUVNLlJBRA/value';
        break;
      case 'UV':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wrCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlVW/value';
        break;
      case 'Chuva':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wrSoAAARUNTQUxWTTA1NlxSU0RSLUVNLkNIVQ/value';
        break;
      case 'Transpiracao':
        url = 'https://vision.eurochemsam.com/PIwebapi/streams/F1DPmBHDxoYLp0mMALSvhSrD_wrioAAARUNTQUxWTTA1NlxSU0RSLUVNLlRSQU4/value';
        break;
      default:
        console.warn(`URL não definida para a chave: ${key}`);
        return null;
    }
    return axios.post(url, value, { auth, headers });
  }).filter(request => request !== null)

  try {
    const responses = await axios.all(requests);
    responses.for(response => {
      console.log('Status', response.status);
    });
    return responses.map(response => response.status);
  } catch (error) {
    console.error('Erro nas requisições:', error.message);
    console.error('Dados enviados', item);
  }
};

const sendDataWithDelay = async (data) => {
  console.log('Dados recebidos para envio:', data)

  if (!Array.isArray(data)) {
    console.error('Os dados recebidos não são um array:', data)
    return;
  }

  const transformedData = transformDataToPIMS(data);

  for (let i = 0; i < transformedData.length; i++) {
    console.log(`Enviando item ${i + 1}:`, transformedData[i]);
    await sendRequests(transformedData[i]);
    await new Promise(resolve => setTimeout(resolve, 2000));  // 2 segundos de intervalo
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