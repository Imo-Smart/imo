import { sendEmail } from './src/config/email.js'
;(async () => {
  try {
    await sendEmail({
      to: 'imoveismart0@gmail.com',
      subject: 'Teste envio',
      text: 'Funcionou!',
    })
    console.log('Email enviado com sucesso!')
  } catch (err) {
    console.log('Erro ao enviar email:', err)
  }
})()
