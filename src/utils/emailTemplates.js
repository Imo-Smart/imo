export const welcomeTemplate = (userName) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo(a)</title>
  <style>
    body { font-family: Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; font-size: 24px; }
    p { color: #555555; line-height: 1.6; font-size: 16px; }
    .button { display: inline-block; padding: 12px 25px; margin-top: 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; transition: background-color 0.3s ease; }
    .button:hover { background-color: #3730a3; }
    .footer { margin-top: 30px; font-size: 13px; color: #999999; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bem-vindo(a), ${userName}!</h1>
    <p>É um prazer ter você conosco na <strong>nossa plataforma de imóveis</strong>. A partir de agora, você terá acesso a ferramentas exclusivas para gerenciar e encontrar imóveis de forma simples e eficiente.</p>
    <p>Para começar, acesse sua conta clicando no botão abaixo:</p>
    <a href="${process.env.FRONTEND_URL}/sign-in" class="button">Acessar Conta</a>
    <div class="footer">
      <p>Se você não realizou este cadastro, por favor, desconsidere esta mensagem.</p>
      <p>© ${new Date().getFullYear()} Plataforma de Imóveis Imosmart. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
`
