# 🥑 Registro Campaña de Paltas

App web para registrar mensajes de WhatsApp de producción/recepción/envíos de paltas, guardando todo en un Excel en Dropbox.

## Estructura del proyecto

```
paltas-app/
├── index.html          ← App web principal
├── api/
│   ├── parse.js        ← Parsea mensajes con IA (Claude)
│   ├── test-dropbox.js ← Prueba la conexión con Dropbox
│   ├── save-dropbox.js ← Guarda el Excel en Dropbox
│   └── load-dropbox.js ← Carga el Excel desde Dropbox
├── vercel.json         ← Configuración de Vercel
└── package.json
```

## Deploy en Vercel

1. Subí esta carpeta a GitHub
2. En vercel.com → New Project → importá el repositorio
3. En "Environment Variables" agregá:
   - `ANTHROPIC_API_KEY` = tu clave de API de Anthropic
4. Deploy!

## Uso diario

1. Abrí la URL de tu app
2. Pegá el token de Dropbox y guardá la configuración
3. Pegá el mensaje de WhatsApp
4. Clic en "Parsear y guardar" → listo
