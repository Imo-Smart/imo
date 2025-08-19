import transporter from '../config/email.js'

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"ImoSmart" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Erro ao enviar email:', error)
  }
}
