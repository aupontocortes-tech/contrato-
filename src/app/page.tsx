export default function HomePage() {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Contraton</title>
      </head>
      <body style={{ margin: 0, padding: "20px", fontFamily: "system-ui, sans-serif", backgroundColor: "#fff" }}>
        <h1>Contraton - Carregando...</h1>
        <p>Redirecionando para o dashboard...</p>
        <script dangerouslySetInnerHTML={{ __html: `
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 100);
        ` }} />
      </body>
    </html>
  );
}
