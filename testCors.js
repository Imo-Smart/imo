import fetch from 'node-fetch'

fetch('http://localhost:3333/api/users/register', {
  method: 'OPTIONS',
  headers: {
    Origin: 'http://localhost:5173',
    'Access-Control-Request-Method': 'POST',
  },
})
  .then((res) => {
    console.log('Status:', res.status)
    console.log('Headers:', Object.fromEntries(res.headers.entries()))
  })
  .catch((err) => console.error('Erro:', err))
