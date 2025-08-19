import nodemailer from 'nodemailer'

// Substitua diretamente pelos seus dados (teste apenas)
const EMAIL_USER = 'imoveismart0@gmail.com'
const EMAIL_PASS = 'nwvumhrnwgzlzvsl'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
})

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: `"ImoSmart" <${EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    })
    console.log(`📧 Email enviado para ${to} com sucesso!`)
  } catch (err) {
    console.log('❌ Falha ao enviar email:', err.message)
    throw new Error('Falha ao enviar email')
  }
}
