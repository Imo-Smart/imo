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
    h1 { color: #333333; }
    p { color: #555555; line-height: 1.6; }
    .button { display: inline-block; padding: 12px 25px; margin-top: 20px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s ease; }
    .button:hover { background-color: #3730a3; }
    .footer { margin-top: 30px; font-size: 12px; color: #999999; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Bem-vindo(a), ${userName}!</h1>
    <p>Estamos muito felizes em ter você no nossa plataforma de imóveis. Agora você já pode fazer login e começar a aproveitar todos os recursos disponíveis.</p>
    <a href="${process.env.FRONTEND_URL}/sign-in" class="button">Fazer Login</a>
    <div class="footer">
      <p>Se você não se cadastrou, ignore este e-mail.</p>
    </div>
  </div>
</body>
</html>
`
