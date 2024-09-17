import axios from "axios";
import fs from 'fs'

const auth = {
  username: process.env.USERNAME,
  password: process.env.PASSWORD
}

const loadData = () => {
  const data = fs.readFileSync('../db/data.json');
  return JSON.parse(data)
}
const data = loadData();

const requests = [

  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wpioAAARUNTQUxWTTA1NlxSU0RSLUVNLlZFTA/value', {value: data[0].VelVento}, {auth}), //VelVento
  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wpyoAAARUNTQUxWTTA1NlxSU0RSLUVNLkRJUg/value', {value: data[0].DirVento}, {auth}), //DirVento
  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlBSRVM/value', {value: data[0].Pressao}, {auth}), //Pressão
  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqSoAAARUNTQUxWTTA1NlxSU0RSLUVNLlRFTVA/value', {value: data[0].Temperatura}, {auth}), //Temperatura
  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqioAAARUNTQUxWTTA1NlxSU0RSLUVNLlVNSQ/value', {value: data[0].Umidade}, {auth}), //Umidade
  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wqyoAAARUNTQUxWTTA1NlxSU0RSLUVNLlJBRA/value', {value: data[0].Radiacao}, {auth}), //Radiação
  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrCoAAARUNTQUxWTTA1NlxSU0RSLUVNLlVW/value', {value: data[0].UV,}, {auth}), //RaiosUv
  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrSoAAARUNTQUxWTTA1NlxSU0RSLUVNLkNIVQ/value', {value: data[0].Chuva,}, {auth}), //Chuva
  axios.post('F1DPmBHDxoYLp0mMALSvhSrD_wrioAAARUNTQUxWTTA1NlxSU0RSLUVNLlRSQU4/value', {value: data[0].Transpiracao}, {auth}) //Transpiração

]

 axios.all(requests).then(axios.spread((...responses) => {
    responses.forEach(response => {
      console.log('Status:', response.status)
    })
 })).catch(error => {
  console.error('Erro nas requisições:', error.message)
 })
