import axios from "axios";
import fs from 'fs'
import path from "path";

const auth = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}

const headers = {
  'Content-Type':'application/json',
  'X-Requested-With': 'for-CSRF-defense'
}

const loadData = () => {
  const data = fs.readFileSync('../db/data.json');
  return JSON.parse(data)
}
const data = loadData();

const sendRequests = (data) => {
  
  const requests = [
  
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wpioAAARUNTQUxWTTA1NlxSU0RSLUVNLlZFTA/value', {"Value": data[0].VelVento}, {auth, headers}), //VelVento
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wpyoAAARUNTQUxWTTA1NlxSU0RSLUVNLkRJUg/value', {"Value": data[0].DirVento}, {auth, headers}), //DirVento
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlBSRVM/value', {"Value": data[0].Pressao}, {auth, headers}), //Pressão
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqSoAAARUNTQUxWTTA1NlxSU0RSLUVNLlRFTVA/value', {"Value": data[0].Temperatura}, {auth, headers}), //Temperatura
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqioAAARUNTQUxWTTA1NlxSU0RSLUVNLlVNSQ/value', {"Value": data[0].Umidade}, {auth, headers}), //Umidade
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqyoAAARUNTQUxWTTA1NlxSU0RSLUVNLlJBRA/value', {"Value": data[0].Radiacao}, {auth, headers}), //Radiação
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlVW/value', {"Value": data[0].UV,}, {auth, headers}), //RaiosUv
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrSoAAARUNTQUxWTTA1NlxSU0RSLUVNLkNIVQ/value', {"Value": data[0].Chuva,}, {auth, headers}), //Chuva
    axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrioAAARUNTQUxWTTA1NlxSU0RSLUVNLlRSQU4/value', {"Value": data[0].Transpiracao}, {auth, headers}) //Transpiração
  
  ]
  
   axios.all(requests).then(axios.spread((...responses) => {
      responses.forEach(response => {
        console.log('Status:', response.status)
      })
   })).catch(error => {
    console.error('Erro nas requisições:', error.message)
   })

}

export const routes = [
  {
    method: 'POST',
    path: /^\/api\/send-data$/,
    handler: async(req, res) => {
      try{
        const data = loadData();
        const statuses = await sendRequests(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Dados enviados com sucesso!', statuses }));
      } catch (error){
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    }
  }
]