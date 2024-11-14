// Configurações
const auth = {
  username: 'process.env.USERNAME',
  password: 'process.env.PASSWORD',
}

const headers = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'for-CSRF-defense',
}

// Array de rotas (vazio por enquanto, pode adicionar outras rotas se necessário no futuro)
export const routes = []

// Exportar configurações para uso em automaticProcess.js
export { auth, headers }
