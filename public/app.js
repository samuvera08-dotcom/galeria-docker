const galeria = document.getElementById('galeria');
const visor = document.getElementById('visor');
const visorImg = document.getElementById('visor-img');
const visorTitulo = document.getElementById('visor-titulo');

async function cargarInfo() {
  const r = await fetch('/api/info');
  const info = await r.json();
  document.getElementById('info').textContent =
    `Contenedor: ${info.host} · Node ${info.node} · arrancado ${new Date(info.arrancado).toLocaleTimeString('es-ES')}`;
}

async function cargarFotos() {
  const r = await fetch('/api/fotos');
  const fotos = await r.json();
  galeria.innerHTML = '';
  fotos.forEach((foto) => {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';
    tarjeta.innerHTML = `<img src="${foto.archivo}" alt="${foto.titulo}" loading="lazy"><h2>${foto.titulo}</h2>`;
    tarjeta.addEventListener('click', () => abrirVisor(foto));
    galeria.appendChild(tarjeta);
  });
}

function abrirVisor(foto) {
  visorImg.src = foto.archivo;
  visorImg.alt = foto.titulo;
  visorTitulo.textContent = foto.titulo;
  visor.hidden = false;
}

document.getElementById('cerrar').addEventListener('click', () => (visor.hidden = true));
visor.addEventListener('click', (e) => { if (e.target === visor) visor.hidden = true; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') visor.hidden = true; });

cargarInfo();
cargarFotos();
