const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');

const app = express();
// El puerto se lee de una variable de entorno para poder cambiarlo con `docker run -e PORT=...`
const PORT = process.env.PORT || 3000;
const CARPETA_IMG = path.join(__dirname, 'public', 'img');
const arranque = new Date();

app.use(express.static(path.join(__dirname, 'public')));

// La lista de fotos se lee del disco: si añades una imagen y reconstruyes la imagen Docker, aparece sola.
app.get('/api/fotos', (req, res) => {
  const fotos = fs.readdirSync(CARPETA_IMG)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .map((f) => ({
      archivo: `/img/${f}`,
      titulo: f.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
    }));
  res.json(fotos);
});

// Dentro de un contenedor, os.hostname() devuelve el ID corto del contenedor:
// sirve para demostrar en el vídeo que quien responde es el contenedor.
app.get('/api/info', (req, res) => {
  res.json({
    host: os.hostname(),
    node: process.version,
    arrancado: arranque.toISOString(),
  });
});

// Ruta que usa el HEALTHCHECK del Dockerfile.
app.get('/salud', (req, res) => res.send('ok'));

const servidor = app.listen(PORT, '0.0.0.0', () => {
  // Escuchar en 0.0.0.0 y no en localhost: si no, el puerto publicado con -p no llega a la app.
  console.log(`Galería escuchando en el puerto ${PORT} (host ${os.hostname()})`);
});

// `docker stop` envía SIGTERM. Node es el PID 1 del contenedor y el PID 1 ignora SIGTERM
// si el programa no lo atiende: Docker acababa matándolo con SIGKILL (Exited 137).
// Así cerramos el servidor de forma ordenada y el contenedor sale con código 0.
function apagar(senal) {
  console.log(`Recibido ${senal}: cerrando el servidor`);
  servidor.close(() => process.exit(0));
  // closeAllConnections cierra también las conexiones keep-alive del navegador
  servidor.closeAllConnections();
}
process.on('SIGTERM', () => apagar('SIGTERM'));
process.on('SIGINT', () => apagar('SIGINT'));
