# 1. Imagen base: Node 20 sobre Alpine Linux (ligera, ~50 MB frente a ~350 MB de la versión Debian)
FROM node:20-alpine

# 2. Directorio de trabajo dentro de la imagen; los COPY y RUN siguientes se ejecutan aquí
WORKDIR /app

# 3. Primero solo los ficheros de dependencias: así Docker reutiliza en caché la capa de
#    `npm ci` mientras package.json no cambie, aunque modifiquemos el código o las fotos
COPY package*.json ./

# 4. Instala solo las dependencias de producción, exactamente las del package-lock.json
RUN npm ci --omit=dev

# 5. Ahora sí, el código y las imágenes (lo que ignora .dockerignore no se copia)
COPY . .

# 6. Variables de entorno por defecto (se pueden sobrescribir con `docker run -e`)
ENV NODE_ENV=production \
    PORT=3000

# 7. Documenta el puerto en el que escucha la app (no lo publica: eso lo hace `-p` en docker run)
EXPOSE 3000

# 8. No ejecutar como root: la imagen de Node ya trae el usuario sin privilegios "node"
USER node

# 9. Docker comprueba cada 30 s que la app responde; `docker ps` muestra (healthy) o (unhealthy)
#    Se usa 127.0.0.1 y no localhost: en Alpine, localhost resuelve primero a ::1 (IPv6)
#    y la app solo escucha en IPv4 (0.0.0.0), así que el chequeo fallaba con "Connection refused"
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/salud || exit 1

# 10. Proceso principal del contenedor: si termina, el contenedor se detiene
CMD ["node", "server.js"]
