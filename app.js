'use strict';

/* ══════════════════════════════════════════════════════════════════
   ARCANA STUDIES — CONFIGURACIÓN DE RECURSOS
   ══════════════════════════════════════════════════════════════════

   INSTRUCCIONES RÁPIDAS:
   ─────────────────────
   1. Pon tus archivos en las carpetas correspondientes dentro de /assets/
   2. Edita este bloque con los nombres exactos de tus archivos
   3. Guarda y recarga el navegador (con servidor local activo)

   ESTRUCTURA DE CARPETAS:
     assets/
       audio/
         music/      ← tus .mp3 de música lofi
         ambient/    ← rain.mp3, wind.mp3, fire.mp3, birds.mp3, ocean.mp3, thunder.mp3
       backgrounds/  ← tu imagen de fondo (.jpg .png .gif .webp)
       character/    ← tu imagen/GIF del personaje (.gif .png .webp)
   ══════════════════════════════════════════════════════════════════ */

/* ── MÚSICA ── Añade aquí tus pistas de música lofi
   Formato: { name: 'Nombre visible en la lista', url: 'assets/audio/music/NOMBRE_ARCHIVO.mp3' }
   Si no tienes archivos todavía, deja el array vacío: []                                        */
const TRACKS = [
  // Descomenta y edita estas líneas con tus archivos reales:
   { name: 'New Beginnings',     url: 'assets/audio/music/track1.mp3' },
   { name: 'Sunset',          url: 'assets/audio/music/track2.mp3' },
   { name: 'Focus',          url: 'assets/audio/music/track3.mp3' },
];

/* ── SONIDOS AMBIENTALES ── Pon tus .mp3 en assets/audio/ambient/
   Nombra los archivos EXACTAMENTE así: rain.mp3, wind.mp3, fire.mp3, birds.mp3, ocean.mp3, thunder.mp3
   Si algún archivo no existe, ese sonido usará síntesis automática (funciona sin archivo).
   IMPORTANTE: si usas un servidor local, los archivos se cargan desde la carpeta.
   Si quieres desactivar un sonido específico para que use síntesis, pon null.              */
const AMBIENT_FILES = {
  rain:    'assets/audio/ambient/rain.mp3',
  wind:    'assets/audio/ambient/wind.mp3',
  fire:    'assets/audio/ambient/fire.mp3',
  birds:   'assets/audio/ambient/birds.mp3',
  ocean:   'assets/audio/ambient/ocean.mp3',
  thunder: 'assets/audio/ambient/thunder.mp3',
};

/* ── IMÁGENES POR ESCENARIO + AMBIENTE ──
   Cada escenario tiene una imagen por cada ambiente (day, sunset, night, rain).
   Nomenclatura sugerida para los archivos en assets/backgrounds/:
     mountain_day.gif  mountain_sunset.gif  mountain_night.gif  mountain_rain.gif
     lake_day.gif      lake_sunset.gif      lake_night.gif      lake_rain.gif
     meadow_day.gif    meadow_sunset.gif    meadow_night.gif    meadow_rain.gif
     forest_day.gif    forest_sunset.gif    forest_night.gif    forest_rain.gif

   Si el archivo de una combinación no existe → se usa el SVG animado.
   Si quieres una imagen genérica por escena (sin importar el ambiente),
   pon el mismo archivo en las cuatro entradas del escenario.               */
const SCENE_IMAGES = {
  mountain: {
    day:    'assets/backgrounds/mountain_day.gif',
    sunset: 'assets/backgrounds/mountain_sunset.gif',
    night:  'assets/backgrounds/mountain_night.gif',
    rain:   'assets/backgrounds/mountain_rain.gif',
  },
  lake: {
    day:    'assets/backgrounds/lake_day.gif',
    sunset: 'assets/backgrounds/lake_sunset.gif',
    night:  'assets/backgrounds/lake_night.gif',
    rain:   'assets/backgrounds/lake_rain.gif',
  },
  meadow: {
    day:    'assets/backgrounds/meadow_day.gif',
    sunset: 'assets/backgrounds/meadow_sunset.gif',
    night:  'assets/backgrounds/meadow_night.gif',
    rain:   'assets/backgrounds/meadow_rain.gif',
  },
  forest: {
    day:    'assets/backgrounds/forest_day.gif',
    sunset: 'assets/backgrounds/forest_sunset.gif',
    night:  'assets/backgrounds/forest_night.gif',
    rain:   'assets/backgrounds/forest_rain.gif',
  },
};

/* ── IMAGEN DE FONDO GLOBAL (opcional) ──
   Si quieres un único fondo para TODOS los escenarios, ponlo aquí.
   Déjalo como '' para usar los GIFs individuales de SCENE_IMAGES.     */
const BACKGROUND_IMAGE = '';

/* ── IMAGEN DEL PERSONAJE ──
   Pon tu imagen/GIF en assets/character/ y escribe el nombre del archivo.
   Déjalo como '' para usar el personaje SVG animado por defecto.
   Ejemplo: 'assets/character/mage.gif'                                  */
const CHARACTER_IMAGE = '';

/* ── ASISTENTE IA (via Cloudflare Worker — API key segura) ──
   1. Ve a https://console.groq.com → crea cuenta gratuita → genera una API key
   2. Ve a https://cloudflare.com → crea un Worker llamado "arcana-proxy"
   3. Pega el código del Worker (ver instrucciones del proyecto)
   4. En Settings → Variables and Secrets → añade GROQ_API_KEY como Secret
   5. Sustituye la URL de abajo por la URL de tu Worker                    */
const PROXY_URL = ''; // ej: 'https://arcana-proxy.TU-SUBDOMINIO.workers.dev'

/* ══════════════════════════════════════════════
   UTILS
   ══════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function fmtTime(s) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00';
  return `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
}

/* ── LocalStorage ── */
function lsSave(key, val) {
  try { localStorage.setItem('arcana_' + key, JSON.stringify(val)); } catch(e) {}
}
function lsLoad(key, def) {
  try {
    const v = localStorage.getItem('arcana_' + key);
    return v !== null ? JSON.parse(v) : def;
  } catch(e) { return def; }
}

/* ══════════════════════════════════════════════
   CLOCK
   ══════════════════════════════════════════════ */
function updateClock() {
  const now = new Date();
  $('clock').textContent = [now.getHours(), now.getMinutes()]
    .map(n => String(n).padStart(2,'0')).join(':');
  const days   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio',
                  'Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  $('date-display').textContent =
    `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ══════════════════════════════════════════════
   STATE — scene & time (used by SVG builders)
   ══════════════════════════════════════════════ */
let currentScene = lsLoad('scene', 'mountain');
let currentTime  = lsLoad('time',  'day');

// Apply saved background class immediately
$('scene').className = 'scene-' + currentTime;

/* ══════════════════════════════════════════════
   SCENE SVG BUILDERS
   ══════════════════════════════════════════════ */

/* ══════════════════════════════════════════════
   SCENE SVG BUILDERS — Montaña · Lago · Pradera · Bosque
   ══════════════════════════════════════════════ */

function buildMountainScene() {
  const dark   = currentTime === 'night';
  const rain   = currentTime === 'rain';
  const sunset = currentTime === 'sunset';
  const sky1 = dark ? '#0a0e1a' : rain ? '#5a6070' : sunset ? '#c03010' : '#4a80c0';
  const sky2 = dark ? '#1a1428' : rain ? '#7a8090' : sunset ? '#e06020' : '#8ab8e8';
  const snow  = dark ? '#c0cce0' : rain ? '#b0b8c8' : '#e8eef8';
  const rock  = dark ? '#2a2838' : rain ? '#404850' : sunset ? '#6a4030' : '#6a7080';
  const gnd   = dark ? '#0a1208' : rain ? '#384038' : sunset ? '#3a2818' : '#3a5828';
  return `<svg width="100%" height="100%" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="msky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${sky1}"/>
        <stop offset="100%" stop-color="${sky2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#msky)"/>
    ${dark ? `
      ${[1,2,3,4,5,6,7,8,9,10,11,12].map(i=>`<circle cx="${i*52-10}" cy="${15+i%4*18}" r="${0.8+i%3*0.6}" fill="white" opacity="${0.5+Math.random()*0.5}">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="${2+i*0.3}s" repeatCount="indefinite"/>
      </circle>`).join('')}
      <circle cx="80" cy="55" r="28" fill="#d8e4f8" opacity="0.9"/>
      <circle cx="72" cy="55" r="22" fill="${sky1}"/>
    ` : sunset ? `
      <ellipse cx="520" cy="80" rx="45" ry="45" fill="#f5c040" opacity="0.9"/>
      <ellipse cx="300" cy="220" rx="320" ry="40" fill="rgba(240,120,40,0.15)"/>
    ` : `
      <ellipse cx="150" cy="70" rx="70" ry="28" fill="white" opacity="0.55"/>
      <ellipse cx="420" cy="50" rx="90" ry="32" fill="white" opacity="0.45"/>
      <ellipse cx="530" cy="90" rx="55" ry="22" fill="white" opacity="0.35"/>
    `}
    <!-- Far mountains -->
    <polygon points="0,260 80,120 160,260"   fill="${rock}" opacity="0.5"/>
    <polygon points="80,260 180,100 280,260"  fill="${rock}" opacity="0.6"/>
    <polygon points="200,260 320,80 440,260"  fill="${rock}" opacity="0.7"/>
    <polygon points="360,260 480,110 600,260" fill="${rock}" opacity="0.55"/>
    <polygon points="460,260 560,130 660,260" fill="${rock}" opacity="0.45"/>
    <!-- Snow caps -->
    <polygon points="180,102 220,155 140,155" fill="${snow}" opacity="0.9"/>
    <polygon points="320,82  360,140 280,140" fill="${snow}" opacity="0.95"/>
    <polygon points="480,112 510,155 450,155" fill="${snow}" opacity="0.85"/>
    <!-- Mid mountain darker -->
    <polygon points="100,280 260,160 420,280" fill="${dark?'#1a1e28':rain?'#303840':sunset?'#4a2c18':'#485860'}"/>
    <polygon points="300,280 430,180 600,280" fill="${dark?'#151820':rain?'#283038':sunset?'#3a2010':'#384048'}"/>
    <!-- Ground / valley -->
    <path d="M0 300 Q150 270 300 285 Q450 300 600 270 L600 400 L0 400Z" fill="${gnd}"/>
    <!-- Pine trees silhouettes -->
    ${[30,80,130,440,490,540,580].map((x,i)=>`
      <polygon points="${x},${280-i%2*20} ${x-12},310 ${x+12},310" fill="${dark?'#0a1808':rain?'#1a2818':sunset?'#1a1008':'#1a3018'}" opacity="0.9"/>
      <rect x="${x-3}" y="310" width="6" height="20" fill="${dark?'#1a1208':'#2a1808'}"/>
    `).join('')}
    <!-- Snow on ground if rain -->
    ${rain ? `<path d="M0 310 Q300 295 600 310 L600 320 L0 320Z" fill="rgba(200,220,240,0.3)"/>` : ''}
    <!-- Mist in valley -->
    <ellipse cx="300" cy="305" rx="280" ry="30" fill="rgba(220,230,240,${dark?'0.06':'0.12'})"/>
    <!-- Stars/moon extras -->
    ${dark ? `<path d="M 80 35 L82 41 L88 41 L83 45 L85 51 L80 47 L75 51 L77 45 L72 41 L78 41 Z" fill="#f5e080" opacity="0.7"/>` : ''}
  </svg>`;
}

function buildLakeScene() {
  const dark   = currentTime === 'night';
  const rain   = currentTime === 'rain';
  const sunset = currentTime === 'sunset';
  const sky1 = dark ? '#05080f' : rain ? '#4a5560' : sunset ? '#b02808' : '#3a70b8';
  const sky2 = dark ? '#101828' : rain ? '#6a7580' : sunset ? '#d05018' : '#70a8d8';
  const water = dark ? '#0a1828' : rain ? '#404e58' : sunset ? '#8a3010' : '#2860a8';
  const shore = dark ? '#1a1c10' : rain ? '#303828' : sunset ? '#2a1808' : '#405030';
  return `<svg width="100%" height="100%" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${sky1}"/>
        <stop offset="100%" stop-color="${sky2}"/>
      </linearGradient>
      <linearGradient id="lwater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${water}"/>
        <stop offset="100%" stop-color="${dark?'#050c18':rain?'#303840':sunset?'#601808':'#1848808'}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#lsky)"/>
    <!-- Celestial body -->
    ${dark ? `
      <circle cx="300" cy="70" r="35" fill="#e8f0ff" opacity="0.95"/>
      <circle cx="288" cy="66" r="26" fill="${sky1}"/>
      ${[1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(i=>`<circle cx="${30+i*40}" cy="${10+i%5*18}" r="1.2" fill="white" opacity="0.7">
        <animate attributeName="opacity" values="1;0.2;1" dur="${1.5+i*0.25}s" repeatCount="indefinite"/>
      </circle>`).join('')}
    ` : sunset ? `
      <circle cx="300" cy="200" r="55" fill="#f5a020" opacity="0.9"/>
      <ellipse cx="300" cy="340" rx="55" ry="18" fill="#f5a020" opacity="0.35"/>
    ` : `
      <circle cx="480" cy="60" r="38" fill="#f5e090" opacity="0.85"/>
      <ellipse cx="140" cy="80" rx="80" ry="30" fill="white" opacity="0.5"/>
      <ellipse cx="420" cy="50" rx="100" ry="35" fill="white" opacity="0.4"/>
    `}
    <!-- Mountains in background -->
    <polygon points="0,200 120,100 240,200"  fill="${dark?'#101828':rain?'#283038':sunset?'#4a1808':'#2a4060'}" opacity="0.7"/>
    <polygon points="160,200 300,90 440,200" fill="${dark?'#0c1420':rain?'#202830':sunset?'#3a1005':'#203050'}" opacity="0.8"/>
    <polygon points="380,200 520,110 640,200" fill="${dark?'#101828':rain?'#283038':sunset?'#4a1808':'#2a4060'}" opacity="0.65"/>
    <!-- Shore / land -->
    <path d="M0 220 Q100 205 200 215 Q300 225 600 210 L600 260 Q400 250 300 255 Q150 260 0 250Z" fill="${shore}"/>
    <!-- Lake surface -->
    <path d="M0 250 Q150 240 300 245 Q450 250 600 240 L600 400 L0 400Z" fill="url(#lwater)"/>
    <!-- Water shimmer / ripples -->
    ${dark ? [1,2,3,4,5].map(i=>`
      <ellipse cx="${100+i*90}" cy="${310+i%3*20}" rx="${30+i*5}" ry="4" fill="rgba(255,255,255,0.06)" >
        <animate attributeName="rx" values="${30+i*5};${40+i*5};${30+i*5}" dur="${2+i*0.5}s" repeatCount="indefinite"/>
      </ellipse>`).join('')
    : [1,2,3,4,5,6].map(i=>`
      <ellipse cx="${60+i*80}" cy="${290+i%3*25}" rx="${25+i*4}" ry="3" fill="rgba(255,255,255,0.12)">
        <animate attributeName="opacity" values="0.12;0.04;0.12" dur="${3+i*0.4}s" repeatCount="indefinite"/>
      </ellipse>`).join('')}
    <!-- Moon/sun reflection -->
    ${dark ? `<ellipse cx="300" cy="340" rx="18" ry="60" fill="rgba(232,240,255,0.12)"/>` : ''}
    ${sunset ? `<ellipse cx="300" cy="360" rx="40" ry="55" fill="rgba(245,160,32,0.18)"/>` : ''}
    <!-- Reeds / cattails on shore -->
    ${[60,90,110,450,480,510].map((x,i)=>`
      <line x1="${x}" y1="255" x2="${x+i%2*4-2}" y2="210" stroke="${dark?'#2a3018':'#4a5828'}" stroke-width="2"/>
      <ellipse cx="${x+i%2*4-2}" cy="208" rx="3" ry="8" fill="${dark?'#3a2818':'#6a4828'}"/>
    `).join('')}
    <!-- Rain ripples on water -->
    ${rain ? [1,2,3,4,5,6,7,8].map(i=>`
      <ellipse cx="${50+i*70}" cy="${280+i%3*30}" rx="8" ry="3" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1">
        <animate attributeName="rx" values="2;12;2" dur="${1+i*0.2}s" repeatCount="indefinite" begin="${i*0.15}s"/>
        <animate attributeName="opacity" values="0.3;0;0.3" dur="${1+i*0.2}s" repeatCount="indefinite" begin="${i*0.15}s"/>
      </ellipse>`).join('') : ''}
    <!-- Fog band -->
    <ellipse cx="300" cy="248" rx="320" ry="18" fill="rgba(220,235,250,${dark?'0.05':'0.1'})"/>
  </svg>`;
}

function buildMeadowScene() {
  const dark   = currentTime === 'night';
  const rain   = currentTime === 'rain';
  const sunset = currentTime === 'sunset';
  const sky1 = dark ? '#080c18' : rain ? '#505a65' : sunset ? '#c03818' : '#5090d0';
  const sky2 = dark ? '#151a2a' : rain ? '#707a85' : sunset ? '#e07028' : '#90c0e8';
  const grass = dark ? '#0c1808' : rain ? '#2a3828' : sunset ? '#2a2010' : '#3a6820';
  const mid   = dark ? '#142010' : rain ? '#304030' : sunset ? '#382818' : '#4a8030';
  return `<svg width="100%" height="100%" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="prsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${sky1}"/>
        <stop offset="100%" stop-color="${sky2}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="400" fill="url(#prsky)"/>
    <!-- Sky elements -->
    ${dark ? `
      <circle cx="420" cy="60" r="30" fill="#d8e8f8" opacity="0.9"/>
      <circle cx="412" cy="58" r="23" fill="${sky1}"/>
      ${[1,2,3,4,5,6,7,8,9,10,11,12].map(i=>`<circle cx="${i*52}" cy="${8+i%5*16}" r="1" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="${1.8+i*0.2}s" repeatCount="indefinite"/>
      </circle>`).join('')}
    ` : sunset ? `
      <circle cx="500" cy="180" r="50" fill="#f5b030" opacity="0.9"/>
      <ellipse cx="300" cy="120" rx="320" ry="50" fill="rgba(220,80,20,0.12)"/>
      <ellipse cx="150" cy="100" rx="110" ry="35" fill="rgba(180,60,20,0.3)"/>
      <ellipse cx="450" cy="80" rx="90" ry="28" fill="rgba(200,80,30,0.25)"/>
    ` : `
      <ellipse cx="120" cy="70" rx="90" ry="35" fill="white" opacity="0.6"/>
      <ellipse cx="350" cy="55" rx="120" ry="40" fill="white" opacity="0.5"/>
      <ellipse cx="530" cy="80" rx="70" ry="28" fill="white" opacity="0.45"/>
      <circle  cx="490" cy="55" r="40" fill="#f5e880" opacity="${rain?'0':'0.7'}"/>
    `}
    <!-- Rolling hills background -->
    <path d="M0 220 Q150 170 300 185 Q450 200 600 165 L600 280 L0 280Z" fill="${mid}" opacity="0.7"/>
    <path d="M0 240 Q200 195 400 210 Q520 220 600 200 L600 300 L0 300Z" fill="${mid}"/>
    <!-- Main ground -->
    <path d="M0 285 Q100 270 300 278 Q500 286 600 265 L600 400 L0 400Z" fill="${grass}"/>
    <!-- Wildflowers -->
    ${!dark && !rain ? [40,85,130,180,230,290,350,400,450,500,545].map((x,i)=>[
      `<line x1="${x}" y1="300" x2="${x}" y2="${275+i%3*5}" stroke="#4a6820" stroke-width="1.5"/>`,
      `<circle cx="${x}" cy="${273+i%3*5}" r="4" fill="${['#f5c040','#f07050','#d060c0','#60c0d0','#f5e060'][i%5]}"/>`,
      i%3===0 ? `<circle cx="${x}" cy="${273+i%3*5}" r="2" fill="#f5f060"/>` : ''
    ].join('')).join('') : ''}
    <!-- Grass blades -->
    ${[20,60,100,150,200,260,320,380,440,490,530,570].map((x,i)=>`
      <path d="M${x} 310 Q${x-4} ${290+i%3*5} ${x+2} ${278+i%3*5}" stroke="${dark?'#1a2808':rain?'#2a3818':'#4a7020'}" stroke-width="1.5" fill="none"/>
      <path d="M${x+6} 308 Q${x+10} ${285+i%3*5} ${x+5} ${274+i%3*5}" stroke="${dark?'#142010':rain?'#223020':'#3a6018'}" stroke-width="1.5" fill="none"/>`).join('')}
    <!-- Lone tree -->
    <rect x="478" y="210" width="8" height="70" rx="2" fill="${dark?'#2a1808':rain?'#302018':'#4a3010'}"/>
    <ellipse cx="482" cy="200" rx="32" ry="40" fill="${dark?'#0a1808':rain?'#1a2818':sunset?'#1a1008':'#1a4010'}"/>
    <ellipse cx="462" cy="215" rx="20" ry="28" fill="${dark?'#081408':rain?'#182218':sunset?'#140c04':'#142e08'}"/>
    <ellipse cx="502" cy="212" rx="22" ry="30" fill="${dark?'#081408':rain?'#182218':sunset?'#140c04':'#142e08'}"/>
    <!-- Path through meadow -->
    <path d="M260 400 Q280 350 300 320 Q310 305 320 290" stroke="${dark?'#2a2010':rain?'#3a3020':'#7a6030'}" stroke-width="14" fill="none" stroke-linecap="round" opacity="0.5"/>
    <!-- Butterflies / fireflies -->
    ${dark ? [1,2,3,4,5,6].map(i=>`
      <circle cx="${80+i*80}" cy="${200+i%3*35}" r="3" fill="#c8f080" opacity="0.8">
        <animate attributeName="opacity" values="0;0.8;0" dur="${2+i*0.3}s" repeatCount="indefinite" begin="${i*0.4}s"/>
        <animate attributeName="cx"      values="${80+i*80};${85+i*80};${80+i*80}" dur="${3+i*0.5}s" repeatCount="indefinite"/>
      </circle>`).join('') : !rain ? [1,2,3].map(i=>`
      <path d="M${150+i*120} ${230+i*10} Q${145+i*120} ${222+i*10} ${148+i*120} ${228+i*10} Q${152+i*120} ${222+i*10} ${155+i*120} ${228+i*10}" 
            fill="${['#f5c040','#80c8f0','#f080c0'][i]}" opacity="0.7">
        <animate attributeName="transform" values="translate(0,0);translate(5,-3);translate(0,0)" dur="${1.5+i*0.4}s" repeatCount="indefinite"/>
      </path>`).join('') : ''}
    <!-- Rain puddles -->
    ${rain ? [1,2,3].map(i=>`<ellipse cx="${100+i*160}" cy="${340+i*10}" rx="${20+i*8}" ry="6" fill="rgba(160,190,220,0.25)"/>`).join('') : ''}
  </svg>`;
}

function buildForestScene() {
  const dark   = currentTime === 'night';
  const rain   = currentTime === 'rain';
  const sunset = currentTime === 'sunset';
  const sky  = dark ? '#05080e' : rain ? '#485058' : sunset ? '#a03010' : '#507898';
  const gnd  = dark ? '#080e06' : rain ? '#202c20' : sunset ? '#180e04' : '#2a4818';
  const trunk = dark ? '#1a0e06' : rain ? '#281c10' : '#3a2010';
  const leaf1 = dark ? '#040e04' : rain ? '#182618' : sunset ? '#100800' : '#1a3810';
  const leaf2 = dark ? '#060c06' : rain ? '#203020' : sunset ? '#180a00' : '#244c18';
  const leaf3 = dark ? '#081008' : rain ? '#283828' : sunset ? '#201005' : '#305a20';
  return `<svg width="100%" height="100%" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${sky}"/>
        <stop offset="100%" stop-color="${dark?'#101420':rain?'#606870':sunset?'#c04820':'#80a8c0'}"/>
      </linearGradient>
    </defs>
    <!-- Sky peek through canopy -->
    <rect width="600" height="400" fill="url(#fsky)"/>
    ${dark ? [1,2,3,4,5,6,7,8].map(i=>`
      <circle cx="${60+i*65}" cy="${15+i%4*20}" r="1.2" fill="white" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.1;0.7" dur="${1.8+i*0.3}s" repeatCount="indefinite"/>
      </circle>`).join('') : sunset ? `
      <circle cx="300" cy="80" r="42" fill="#f5a830" opacity="0.7"/>
      <ellipse cx="300" cy="200" rx="200" ry="60" fill="rgba(220,80,20,0.1)"/>
    ` : `
      <ellipse cx="300" cy="60" rx="80" ry="30" fill="rgba(255,255,255,0.3)"/>
    `}
    <!-- Deep background trees -->
    ${[0,1,2,3,4,5,6,7].map(i=>`
      <rect x="${i*85-5}" y="${160+i%2*20}" width="${14+i%3*4}" height="${140+i%2*30}" rx="3" fill="${dark?'#0e0806':rain?'#181810':sunset?'#0e0604':'#1a1008'}"/>
      <ellipse cx="${i*85+5}" cy="${150+i%2*20}" rx="${28+i%3*6}" ry="${40+i%2*15}" fill="${leaf1}"/>
    `).join('')}
    <!-- Mid trees -->
    ${[20,120,220,320,420,520].map((x,i)=>`
      <rect x="${x+5}" y="${180+i%2*15}" width="${18+i%3*5}" height="${110+i%2*25}" rx="4" fill="${trunk}"/>
      <ellipse cx="${x+15}" cy="${165+i%2*15}" rx="${38+i%3*10}" ry="${55+i%2*15}" fill="${leaf2}"/>
      <ellipse cx="${x}" cy="${180+i%2*15}" rx="${28+i%2*8}" ry="${42+i%2*10}" fill="${leaf1}"/>
      <ellipse cx="${x+28}" cy="${175+i%2*15}" rx="${25+i%2*8}" ry="${38+i%2*10}" fill="${leaf3}"/>
    `).join('')}
    <!-- Ground -->
    <path d="M0 310 Q150 295 300 302 Q450 310 600 295 L600 400 L0 400Z" fill="${gnd}"/>
    <!-- Roots and undergrowth -->
    ${[40,120,200,300,400,480,560].map((x,i)=>`
      <path d="M${x} 325 Q${x-6} 310 ${x+2} 298 Q${x+4} 310 ${x} 325" fill="${dark?'#1a2008':rain?'#283018':'#305020'}" opacity="0.8"/>
      <path d="M${x+8} 322 Q${x+14} 308 ${x+10} 295 Q${x+8} 308 ${x+8} 322" fill="${dark?'#142010':rain?'#202818':'#284818'}" opacity="0.7"/>`).join('')}
    <!-- Mushrooms -->
    ${[70,190,350,490].map((x,i)=>`
      <rect x="${x}" y="${316}" width="5" height="10" rx="1" fill="#d8c090"/>
      <ellipse cx="${x+2}" cy="${315}" rx="8" ry="5" fill="${['#c04040','#a06030','#d08040','#806040'][i]}"/>
      <ellipse cx="${x+2}" cy="${314}" rx="6" ry="3" fill="${['#d05050','#b07040','#e09050','#907050'][i]}" opacity="0.7"/>
    `).join('')}
    <!-- Fireflies at night -->
    ${dark ? [1,2,3,4,5,6,7].map(i=>`
      <circle cx="${80+i*70}" cy="${240+i%4*30}" r="2.5" fill="#a0ff80" opacity="0.8">
        <animate attributeName="opacity" values="0;0.8;0" dur="${2.5+i*0.4}s" repeatCount="indefinite" begin="${i*0.6}s"/>
        <animate attributeName="cx"      values="${80+i*70};${86+i*70};${80+i*70}" dur="${4+i*0.5}s" repeatCount="indefinite"/>
      </circle>`).join('') : ''}
    <!-- Light rays through canopy (day only) -->
    ${!dark && !rain ? [1,2,3].map(i=>`
      <path d="M${150+i*120} 0 L${120+i*120} 310 L${180+i*120} 310Z" fill="rgba(255,240,180,0.04)"/>
    `).join('') : ''}
    <!-- Fog layer -->
    <ellipse cx="300" cy="315" rx="320" ry="25" fill="rgba(200,220,200,${dark?'0.04':'0.08'})"/>
  </svg>`;
}

/* ══════════════════════════════════════════════
   SCENE CONFIG + RENDER
   ══════════════════════════════════════════════ */
const sceneConfig = {
  mountain: { fn: buildMountainScene, particles: [{color:'#e8f0ff',size:2},{color:'#c0d0e8',size:2}] },
  lake:     { fn: buildLakeScene,     particles: [{color:'#a0c8f8',size:2},{color:'#d0e8ff',size:2}] },
  meadow:   { fn: buildMeadowScene,   particles: [{color:'#f0e060',size:3},{color:'#a0d870',size:2}] },
  forest:   { fn: buildForestScene,   particles: [{color:'#80e880',size:3},{color:'#c0f0a0',size:2}] },
};

function renderScene() {
  const sceneView = $('scene-view');

  // Look up image: global override > scene+time combo > SVG fallback
  const imgUrl = BACKGROUND_IMAGE
    || (SCENE_IMAGES[currentScene] && SCENE_IMAGES[currentScene][currentTime])
    || '';

  if (imgUrl) {
    const tester = new Image();
    tester.onload = () => {
      sceneView.innerHTML = '';
      sceneView.style.cssText = `
        position:absolute; inset:0;
        background: url('${imgUrl}') center/cover no-repeat;
      `;
    };
    tester.onerror = () => {
      // Combination not found — fall back to SVG
      sceneView.style.cssText = '';
      sceneView.innerHTML = sceneConfig[currentScene].fn();
    };
    tester.src = imgUrl;
  } else {
    sceneView.style.cssText = '';
    sceneView.innerHTML = sceneConfig[currentScene].fn();
  }

  spawnParticles(sceneConfig[currentScene].particles);
}

function setScene(name, btn) {
  currentScene = name;
  document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  lsSave('scene', name);
  renderScene();
  applyTheme(currentTime);
  const labels = { mountain:'Montaña', lake:'Lago', meadow:'Pradera', forest:'Bosque' };
  showNotif('✦ ' + labels[name]);
}

function setTime(t, btn) {
  currentTime = t;
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  $('scene').className = 'scene-' + t;
  lsSave('time', t);
  renderScene();
  applyTheme(t);
  const labels = { day:'Día ☀', sunset:'Ocaso 🌅', night:'Noche 🌙', rain:'Lluvia 🌧' };
  showNotif(labels[t]);
}

/* ── Dynamic themes by time-of-day ── */
const themes = {
  day: {
    '--panel-bg':          'rgba(245, 232, 205, 0.93)',
    '--panel-border':      'rgba(184, 131, 42, 0.5)',
    '--panel-border-dark': 'rgba(122, 74, 32, 0.65)',
    '--ink':               '#1e1208',
    '--ink-light':         '#4a2e14',
    '--ink-faint':         '#8a6444',
    '--gold':              '#b8832a',
    '--gold-light':        '#d4a850',
    '--parchment':         '#f0e2c4',
    '--parchment-dark':    '#d9c49a',
    '--leather':           '#7a4a20',
    '--leather-dark':      '#4a2a0e',
    '--crimson':           '#6e2020',
    '--forest':            '#2a4a20',
  },
  sunset: {
    '--panel-bg':          'rgba(248, 215, 178, 0.93)',
    '--panel-border':      'rgba(200, 100, 40, 0.5)',
    '--panel-border-dark': 'rgba(150, 60, 20, 0.65)',
    '--ink':               '#1e0a04',
    '--ink-light':         '#5a2010',
    '--ink-faint':         '#9a5030',
    '--gold':              '#c05020',
    '--gold-light':        '#e07030',
    '--parchment':         '#f5d8b0',
    '--parchment-dark':    '#dbb080',
    '--leather':           '#8a3010',
    '--leather-dark':      '#5a1808',
    '--crimson':           '#8a1818',
    '--forest':            '#3a3010',
  },
  night: {
    '--panel-bg':          'rgba(24, 18, 36, 0.95)',
    '--panel-border':      'rgba(100, 80, 160, 0.4)',
    '--panel-border-dark': 'rgba(70, 55, 120, 0.7)',
    '--ink':               '#d8cce8',
    '--ink-light':         '#b0a0d0',
    '--ink-faint':         '#7060a0',
    '--gold':              '#9880d8',
    '--gold-light':        '#b0a0e8',
    '--parchment':         '#1e1830',
    '--parchment-dark':    '#14102a',
    '--leather':           '#4a3880',
    '--leather-dark':      '#2a2050',
    '--crimson':           '#8840a0',
    '--forest':            '#204060',
  },
  rain: {
    '--panel-bg':          'rgba(208, 224, 212, 0.93)',
    '--panel-border':      'rgba(80, 120, 100, 0.45)',
    '--panel-border-dark': 'rgba(50, 90, 70, 0.65)',
    '--ink':               '#0e1c14',
    '--ink-light':         '#2a4830',
    '--ink-faint':         '#5a7860',
    '--gold':              '#4a8060',
    '--gold-light':        '#6aa880',
    '--parchment':         '#daeade',
    '--parchment-dark':    '#b8d0be',
    '--leather':           '#2a5840',
    '--leather-dark':      '#183828',
    '--crimson':           '#305848',
    '--forest':            '#1a4030',
  },
};

function applyTheme(t) {
  const th = themes[t] || themes.day;
  const root = document.documentElement;
  Object.entries(th).forEach(([k, v]) => root.style.setProperty(k, v));
  // Toggle theme body classes
  ['day','sunset','night','rain'].forEach(name =>
    document.body.classList.toggle('theme-' + name, t === name)
  );
}

/* ══════════════════════════════════════════════
   PARTICLES
   ══════════════════════════════════════════════ */
let particleInterval = null;

function spawnParticles(types) {
  document.querySelectorAll('.particle').forEach(p => p.remove());
  if (particleInterval) clearInterval(particleInterval);

  function spawn() {
    const type = types[Math.floor(Math.random() * types.length)];
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left:${Math.random()*100}%;
      width:${type.size}px; height:${type.size}px;
      background:${type.color};
      opacity:${0.4+Math.random()*0.4};
      animation-duration:${5+Math.random()*8}s;
      animation-delay:${Math.random()*2}s;
    `;
    $('scene').appendChild(p);
    setTimeout(() => p.remove(), 15000);
  }

  for (let i = 0; i < 8; i++) setTimeout(spawn, i * 300);
  particleInterval = setInterval(spawn, 1200);
}

/* ══════════════════════════════════════════════
   RAIN CANVAS
   ══════════════════════════════════════════════ */
(function setupRain() {
  const canvas = $('rain-overlay');
  const ctx    = canvas.getContext('2d');

  function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const drops = Array.from({length: 200}, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    l: Math.random() * 20 + 10,
    s: Math.random() * 3  + 1,
    o: Math.random() * 0.3 + 0.1,
  }));

  (function drawRain() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if ($('scene').classList.contains('scene-rain')) {
      ctx.strokeStyle = 'rgba(180,210,220,0.4)';
      ctx.lineWidth   = 1;
      drops.forEach(d => {
        ctx.globalAlpha = d.o;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.l * 0.3, d.y + d.l);
        ctx.stroke();
        d.y += d.s * 4;
        d.x += d.s * 0.5;
        if (d.y > canvas.height) { d.y = -d.l; d.x = Math.random() * canvas.width; }
      });
    }
    requestAnimationFrame(drawRain);
  })();
})();

/* ══════════════════════════════════════════════
   WEB AUDIO CONTEXT
   ══════════════════════════════════════════════ */
const AudioCtxCtor = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtxCtor();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/* ══════════════════════════════════════════════
   MUSIC PLAYER
   ══════════════════════════════════════════════ */
const tracks    = TRACKS.map(t => ({ ...t })); // copy from config
let currentIdx  = -1;
let isPlaying   = false;
let isShuffle   = false;
let isLoop      = false;
const musicAudio = new Audio();
musicAudio.volume = 0.7;

musicAudio.addEventListener('ended', () => {
  if (isLoop) { musicAudio.currentTime = 0; musicAudio.play(); }
  else nextTrack();
});
musicAudio.addEventListener('timeupdate',    updateProgress);
musicAudio.addEventListener('loadedmetadata', updateProgress);

function loadTrack(idx) {
  if (idx < 0 || idx >= tracks.length) return;
  currentIdx         = idx;
  musicAudio.src     = tracks[idx].url;
  musicAudio.load();
  renderPlaylist();
  $('time-current').textContent = '0:00';
  $('time-total').textContent   = '0:00';
  $('progress-bar-fill').style.width = '0%';
  if (isPlaying) musicAudio.play().catch(() => {});
}

function playPause() {
  getAudioCtx();
  if (tracks.length === 0) { showNotif('♪ Sin pistas cargadas'); return; }
  if (currentIdx === -1) loadTrack(0);
  if (isPlaying) {
    musicAudio.pause();
    isPlaying = false;
    $('btn-play').textContent = '▶';
  } else {
    musicAudio.play().catch(err => showNotif('Error: ' + err.message));
    isPlaying = true;
    $('btn-play').textContent = '⏸';
  }
}

function prevTrack() {
  if (!tracks.length) return;
  if (musicAudio.currentTime > 3) { musicAudio.currentTime = 0; return; }
  loadTrack(currentIdx <= 0 ? tracks.length - 1 : currentIdx - 1);
  if (isPlaying) musicAudio.play().catch(() => {});
}

function nextTrack() {
  if (!tracks.length) return;
  let idx;
  if (isShuffle) {
    do { idx = Math.floor(Math.random() * tracks.length); }
    while (tracks.length > 1 && idx === currentIdx);
  } else {
    idx = (currentIdx + 1) % tracks.length;
  }
  loadTrack(idx);
  if (isPlaying) musicAudio.play().catch(() => {});
}

function toggleShuffle(btn) {
  isShuffle = !isShuffle;
  btn.classList.toggle('active', isShuffle);
  showNotif(isShuffle ? '⇄ Aleatorio ON' : '⇄ Aleatorio OFF');
}

function toggleLoop(btn) {
  isLoop = !isLoop;
  btn.classList.toggle('active', isLoop);
  showNotif(isLoop ? '↻ Repetir ON' : '↻ Repetir OFF');
}

function setVolume(val) { musicAudio.volume = val / 100; }

function seekMusic(e) {
  if (!musicAudio.duration) return;
  const rect = $('progress-bar-bg').getBoundingClientRect();
  musicAudio.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    * musicAudio.duration;
}

function updateProgress() {
  const dur = musicAudio.duration || 0;
  const cur = musicAudio.currentTime || 0;
  $('progress-bar-fill').style.width = dur ? (cur / dur * 100) + '%' : '0%';
  $('time-current').textContent = fmtTime(cur);
  $('time-total').textContent   = fmtTime(dur);
}

function clickTrack(idx) {
  if (idx === currentIdx) { playPause(); return; }
  const wasPlaying = isPlaying;
  isPlaying = true;
  loadTrack(idx);
  if (!wasPlaying) {
    isPlaying = false;
    musicAudio.pause();
    $('btn-play').textContent = '▶';
  }
}

function renderPlaylist() {
  const pl = $('playlist');
  if (!tracks.length) {
    pl.innerHTML = '<div id="no-tracks">Sin pistas configuradas</div>';
    return;
  }
  pl.innerHTML = tracks.map((t, i) => `
    <div class="playlist-item ${i === currentIdx ? 'playing' : ''}" onclick="clickTrack(${i})">
      <span class="dot"></span>
      <span class="track-name">🎵 ${escHtml(t.name)}</span>
    </div>`).join('');
}

// Init playlist from config
renderPlaylist();
if (tracks.length > 0) loadTrack(0);

/* ══════════════════════════════════════════════
   AMBIENT SOUNDS — estado centralizado
   ══════════════════════════════════════════════ */
const ambientState = {};

/* toggleAmb usa ambientState[key].active como fuente de verdad,
   no el estado visual del botón. Así nunca hay solapamiento. */
function toggleAmb(btn, key) {
  const isActive = ambientState[key]?.active === true;

  if (isActive) {
    // Desactivar sonido
    stopAmb(key);
    // Desactivar TODOS los botones con este key (normal + fs clones)
    _syncAmbBtn(key, false);
    showNotif(`✦ ${key} desactivado`);
  } else {
    // Activar — pero solo si no está ya activo (evita solapamiento)
    if (ambientState[key]?.active) return; // ya corriendo
    const vol = parseInt($('vol-' + key)?.value ?? 50);
    const filePath = AMBIENT_FILES[key];
    if (filePath) {
      const testAudio = new Audio();
      testAudio.addEventListener('canplaythrough', () => {
        if (!ambientState[key]?.active) { // doble-check antes de iniciar
          playAmbAudio(key, vol, filePath);
          _syncAmbBtn(key, true);
        }
      }, { once: true });
      testAudio.addEventListener('error', () => {
        if (!ambientState[key]?.active) {
          playAmbSynth(key, vol);
          _syncAmbBtn(key, true);
        }
      }, { once: true });
      testAudio.src = filePath;
      testAudio.load();
    } else {
      playAmbSynth(key, vol);
      _syncAmbBtn(key, true);
    }
    showNotif(`✦ ${key} activado`);
  }
}

/* Sincroniza el estado visual de TODOS los botones amb-{key}
   (panel principal + posibles clones en fullscreen) */
function _syncAmbBtn(key, active) {
  document.querySelectorAll(`#amb-${key}, [id$="amb-${key}"]`).forEach(btn => {
    btn.classList.toggle('active', active);
  });
  // También busca por clase+data si hay clones sin id exacto
  document.querySelectorAll(`.amb-btn`).forEach(btn => {
    const onclick = btn.getAttribute('onclick') || btn._onclickKey || '';
    if (onclick.includes(`'${key}'`) || onclick.includes(`"${key}"`)) {
      btn.classList.toggle('active', active);
    }
  });
}

function setAmbVol(key, val) {
  const s = ambientState[key];
  if (s?.gainNode) {
    s.gainNode.gain.setTargetAtTime(val / 100 * 0.6, getAudioCtx().currentTime, 0.05);
  }
  if (s?.audio) {
    s.audio.volume = val / 100 * 0.6;
  }
}

function stopAmb(key) {
  const s = ambientState[key];
  if (!s) return;
  s.active = false;
  if (s.intervals) s.intervals.forEach(id => clearTimeout(id));
  try {
    if (s.gainNode) s.gainNode.gain.setTargetAtTime(0, getAudioCtx().currentTime, 0.3);
    if (s.audio)    setTimeout(() => { s.audio.pause(); s.audio.src = ''; }, 400);
    if (s.sourceNode) setTimeout(() => { try { s.sourceNode.stop(); } catch(e) {} }, 400);
  } catch(e) {}
  ambientState[key] = { active: false };
}

/* Play an audio-file-based ambient loop */
function playAmbAudio(key, vol, filePath) {
  const url   = filePath || AMBIENT_FILES[key];
  const audio   = new Audio(url);
  audio.loop    = true;
  audio.volume  = (vol / 100) * 0.6;
  audio.play().catch(() => { playAmbSynth(key, vol); }); // fallback if blocked
  ambientState[key] = { audio, active: true };
}

/* Synthesised ambient sounds via Web Audio */
function playAmbSynth(key, vol) {
  const ctx  = getAudioCtx();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ctx.destination);

  let sourceNode = null;

  if (key === 'rain') {
    sourceNode = makeNoise(ctx, 'white', 0.4);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 3000; f.Q.value = 0.5;
    sourceNode.connect(f); f.connect(gain);

  } else if (key === 'wind') {
    sourceNode = makeNoise(ctx, 'pink', 0.3);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 600;
    sourceNode.connect(f); f.connect(gain);
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.15; lg.gain.value = 0.2;
    lfo.connect(lg); lg.connect(gain.gain); lfo.start();

  } else if (key === 'fire') {
    sourceNode = makeNoise(ctx, 'brown', 0.5);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = 400; f.Q.value = 0.8;
    sourceNode.connect(f); f.connect(gain);
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 3; lfo.type = 'sawtooth'; lg.gain.value = 0.15;
    lfo.connect(lg); lg.connect(gain.gain); lfo.start();

  } else if (key === 'birds') {
    ambientState[key] = { active: true, gainNode: gain, intervals: [] };
    gain.gain.value = vol / 100 * 0.4;
    (function chirp() {
      if (!ambientState[key]?.active) return;
      const osc = ctx.createOscillator(), g2 = ctx.createGain();
      osc.connect(g2); g2.connect(gain);
      const freq = 800 + Math.random() * 1200;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.08);
      g2.gain.setValueAtTime(0.3, ctx.currentTime);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
      ambientState[key].intervals.push(setTimeout(chirp, 600 + Math.random() * 2400));
    })();
    return;

  } else if (key === 'ocean') {
    sourceNode = makeNoise(ctx, 'pink', 0.6);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 800;
    sourceNode.connect(f); f.connect(gain);
    const lfo = ctx.createOscillator(), lg = ctx.createGain();
    lfo.frequency.value = 0.08; lg.gain.value = 0.3;
    lfo.connect(lg); lg.connect(gain.gain); lfo.start();

  } else if (key === 'thunder') {
    ambientState[key] = { active: true, gainNode: gain, intervals: [] };
    gain.gain.value = vol / 100 * 0.5;
    // Continuous rain bed
    const rain = makeNoise(ctx, 'white', 0.2);
    const rf   = ctx.createBiquadFilter();
    rf.type = 'bandpass'; rf.frequency.value = 2000; rf.Q.value = 0.5;
    rain.connect(rf); rf.connect(gain); rain.start();
    // Occasional thunder booms
    (function boom() {
      if (!ambientState[key]?.active) return;
      const bg = ctx.createGain(), bn = makeNoise(ctx, 'brown', 0.8);
      const bf  = ctx.createBiquadFilter();
      bf.type = 'lowpass'; bf.frequency.value = 200;
      bn.connect(bf); bf.connect(bg); bg.connect(gain);
      bg.gain.setValueAtTime(0, ctx.currentTime);
      bg.gain.linearRampToValueAtTime(1.2,   ctx.currentTime + 0.05);
      bg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      bn.start(); setTimeout(() => { try { bn.stop(); } catch(e){} }, 2000);
      ambientState[key].intervals.push(setTimeout(boom, 5000 + Math.random() * 15000));
    })();
    return;
  }

  if (sourceNode) {
    sourceNode.start();
    ambientState[key] = { sourceNode, gainNode: gain, active: true };
  }
  gain.gain.setTargetAtTime(vol / 100 * 0.6, ctx.currentTime, 0.5);
}

/* Noise buffer generator */
function makeNoise(ctx, type, amp) {
  const n    = ctx.sampleRate * 2;
  const buf  = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = buf.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * amp;

  } else if (type === 'pink') {
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
      data[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11 * amp;
      b6 = w * 0.115926;
    }
  } else { // brown
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = last = (last + 0.02 * w) / 1.02 * amp * 3.5;
    }
  }

  const src = ctx.createBufferSource();
  src.buffer = buf; src.loop = true;
  return src;
}

/* ══════════════════════════════════════════════
   POMODORO
   ══════════════════════════════════════════════ */
const circumference = 2 * Math.PI * 50;
const pomoLabels    = { focus:'ENFOQUE', short:'DESCANSO', long:'PAUSA LARGA' };

let pomoCustom   = lsLoad('pomoCustom',  { focus:25, short:5, long:15 });
let pomoType     = lsLoad('pomoType',    'focus');
let pomoTotal    = pomoCustom[pomoType] * 60;
let pomoLeft     = pomoTotal;
let pomoRunning  = false;
let pomoInterval = null;
let pomoSessions = lsLoad('pomoSessions', 0);

function updatePomoDisplay() {
  const m = String(Math.floor(pomoLeft / 60)).padStart(2,'0');
  const s = String(pomoLeft % 60).padStart(2,'0');
  $('pomo-time').textContent  = `${m}:${s}`;
  $('pomo-label').textContent = pomoLabels[pomoType];
  $('pomo-progress').style.strokeDashoffset = circumference * (1 - pomoLeft / pomoTotal);
  document.title = pomoRunning ? `(${m}:${s}) Arcana Studies` : 'Arcana Studies ✦';
}

function setPomoType(type, _mins, btn) {
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoType    = type;
  pomoTotal   = pomoCustom[type] * 60;
  pomoLeft    = pomoTotal;
  _updatePomoBtn(false);
  document.querySelectorAll('.pomo-mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  lsSave('pomoType', type);
  updatePomoDisplay();
  updateSessionDots();
  showNotif(`⧗ ${pomoLabels[type]}`);
}

function togglePomo() {
  if (pomoLeft <= 0) { resetPomo(); return; }
  pomoRunning = !pomoRunning;
  if (pomoRunning) {
    _updatePomoBtn(true);
    pomoInterval = setInterval(tickPomo, 1000);
    showNotif('⧗ Temporizador iniciado');
  } else {
    _updatePomoBtn(false, true);
    clearInterval(pomoInterval);
    showNotif('⧗ Pausado');
  }
}

function _updatePomoBtn(running, paused) {
  const btn = $('pomo-play-btn');
  if (!btn) return;
  if (running) {
    btn.textContent = '⏸ Pausar';
    btn.classList.add('running');
  } else if (paused) {
    btn.textContent = '▶ Continuar';
    btn.classList.remove('running');
  } else {
    btn.textContent = '▶ Iniciar';
    btn.classList.remove('running');
  }
}

function tickPomo() {
  if (pomoLeft <= 0) {
    clearInterval(pomoInterval);
    pomoRunning = false;
    _updatePomoBtn(false);
    document.title = 'Arcana Studies ✦';
    pomoFinished();
    return;
  }
  pomoLeft--;
  updatePomoDisplay();
}

function pomoFinished() {
  playPomoSound();
  $('pomo-progress').style.strokeDashoffset = 0;
  if (pomoType === 'focus') {
    pomoSessions = (pomoSessions + 1) % 5;
    lsSave('pomoSessions', pomoSessions);
    updateSessionDots();
    const prog = $('pomo-progress');
    prog.style.stroke = '#4a9a4a';
    setTimeout(() => { prog.style.stroke = ''; }, 1500);
    showNotif('✦ ¡Sesión completada! Iniciando descanso 🌟');
    setTimeout(() => {
      // Find the "Descanso" tab — query by text content
      const tabs = document.querySelectorAll('.pomo-mode-tab');
      const breakBtn = Array.from(tabs).find(b => b.textContent.trim() === 'Descanso');
      if (breakBtn) setPomoType('short', 5, breakBtn);
    }, 1600);
  } else {
    showNotif('✦ ¡Descanso terminado! A por otra sesión 📖');
    setTimeout(() => {
      const tabs = document.querySelectorAll('.pomo-mode-tab');
      const focusBtn = Array.from(tabs).find(b => b.textContent.trim() === 'Enfoque');
      if (focusBtn) setPomoType('focus', 25, focusBtn);
    }, 1600);
  }
}

function resetPomo() {
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoLeft    = pomoTotal;
  _updatePomoBtn(false);
  document.title = 'Arcana Studies ✦';
  updatePomoDisplay();
  showNotif('↺ Reiniciado');
}

function skipPomo() {
  clearInterval(pomoInterval);
  pomoRunning = false;
  pomoLeft    = 0;
  _updatePomoBtn(false);
  document.title = 'Arcana Studies ✦';
  updatePomoDisplay();
  showNotif('⇥ Sesión saltada');
}

function adjustPomo(deltaMin) {
  // Snap total to nearest 5-minute multiple, then add delta
  const currentMins = Math.round(pomoTotal / 60);
  // Round current to nearest 5 so we always land on clean multiples
  const snapped  = Math.round(currentMins / 5) * 5;
  const newMins  = Math.min(120, Math.max(5, snapped + deltaMin));
  const newTotal = newMins * 60;

  // Keep pomoLeft proportional, but also snap it so it never exceeds new total
  const ratio  = pomoLeft / pomoTotal;
  pomoTotal    = newTotal;
  pomoLeft     = Math.min(newTotal, Math.max(0, Math.round(newTotal * ratio)));

  pomoCustom[pomoType] = newMins;
  lsSave('pomoCustom', pomoCustom);
  updatePomoDisplay();
  const sign = deltaMin > 0 ? '+' : '';
  showNotif(`⧗ ${sign}${deltaMin} min → ${newMins} min`);
}

function updateSessionDots() {
  document.querySelectorAll('.session-dot').forEach((d, i) =>
    d.classList.toggle('done', i < pomoSessions));
}

// Double-click timer to edit minutes
$('pomo-time').addEventListener('dblclick', () => {
  if (pomoRunning) return;
  const val = prompt(`Minutos para "${pomoLabels[pomoType]}" (1–120):`, Math.floor(pomoTotal / 60));
  if (val === null) return;
  const n = parseInt(val);
  if (isNaN(n) || n < 1 || n > 120) { showNotif('⚠ Valor inválido (1–120 min)'); return; }
  pomoCustom[pomoType] = n;
  lsSave('pomoCustom', pomoCustom);
  pomoTotal = n * 60;
  pomoLeft  = pomoTotal;
  updatePomoDisplay();
  showNotif(`⧗ Ajustado a ${n} min`);
});

// Pomodoro ding sound
function playPomoSound() {
  try {
    const ctx   = getAudioCtx();
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.start(t); osc.stop(t + 0.7);
    });
  } catch(e) {}
}

// Init arc
$('pomo-progress').style.strokeDasharray  = circumference;
$('pomo-progress').style.strokeDashoffset = 0;
updatePomoDisplay();
updateSessionDots();

/* ══════════════════════════════════════════════
   TASKS — Misión Principal + Secundarias
   ══════════════════════════════════════════════ */
let tasks = lsLoad('tasks', []); // each task: { id, text, done, type:'main'|'side' }
let activeTaskType = 'main'; // which input is active

function setActiveTaskType(type, btn) {
  activeTaskType = type;
  document.querySelectorAll('.task-type-tab').forEach(b => b.classList.remove('active'));
  // Activate all tabs with same type across normal + fs
  document.querySelectorAll('.task-type-tab').forEach(b => {
    const txt = b.textContent.trim();
    if ((type === 'main' && txt.includes('Principal')) ||
        (type === 'side' && txt.includes('Secundaria'))) {
      b.classList.add('active');
    }
  });
  const ph = type === 'main' ? 'Misión principal...' : 'Misión secundaria...';
  document.querySelectorAll('#task-input').forEach(i => { i.placeholder = ph; });
  // Focus whichever is in the active view
  const fsInput = document.querySelector('#fs-inner-tasks-panel #task-input');
  if (fsActive && fsInput) fsInput.focus();
  else $('task-input')?.focus();
}

function addTask() {
  // Support both normal panel and fs clone — find whichever input has content or is visible
  let input = $('task-input');
  // If in fullscreen, check if the fs clone input has focus/content
  if (fsActive) {
    const fsInput = document.querySelector('#fs-inner-tasks-panel #task-input');
    if (fsInput && (document.activeElement === fsInput || fsInput.value.trim())) {
      input = fsInput;
    }
  }
  const text = input?.value.trim();
  if (!text) { input?.focus(); return; }
  tasks.unshift({ id: Date.now(), text, done: false, type: activeTaskType });
  input.value = '';
  // Also clear the other input if it exists
  const other = document.querySelector((input.id === 'task-input' && fsActive)
    ? '#task-input' : '#fs-inner-tasks-panel #task-input');
  if (other && other !== input) other.value = '';
  lsSave('tasks', tasks);
  renderTasks();
  updateSessionInfo();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  if (t.done) {
    tasks = tasks.filter(x => x.id !== id);
    tasks.push(t);
    playCheckSound();
    showNotif('✦ ¡Misión completada!');
  } else {
    // Move undone back to top of its category
    tasks = tasks.filter(x => x.id !== id);
    tasks.unshift(t);
  }
  lsSave('tasks', tasks);
  renderTasks();
  updateSessionInfo();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  lsSave('tasks', tasks);
  renderTasks();
  updateSessionInfo();
}

function clearDoneTasks() {
  tasks = tasks.filter(t => !t.done);
  lsSave('tasks', tasks);
  renderTasks();
  updateSessionInfo();
  showNotif('✦ Completadas eliminadas');
}

function renderTasks() {
  const list     = $('task-list');
  const doneCount = tasks.filter(t => t.done).length;
  const clearBtn  = $('clear-done-btn');
  if (clearBtn) clearBtn.style.display = doneCount > 0 ? 'block' : 'none';

  const mainTasks = tasks.filter(t => t.type === 'main');
  const sideTasks = tasks.filter(t => t.type === 'side');

  if (!mainTasks.length && !sideTasks.length) {
    list.innerHTML = `<div class="tasks-empty">
      Sin misiones activas...<br>
      <span>Añade tu primera tarea ✦</span>
    </div>`;
    return;
  }

  function renderSection(sectionTasks, label, icon) {
    if (!sectionTasks.length) return '';
    return `
      <div class="task-section-header">${icon} ${label}</div>
      ${sectionTasks.map(t => `
        <div class="task-item ${t.done ? 'task-done-item':''}" data-id="${t.id}">
          <div class="task-check ${t.type} ${t.done?'done':''}"
               onclick="toggleTask(${t.id})"
               title="${t.done?'Deshacer':'Completar'}"></div>
          <span class="task-text ${t.done?'done':''}">${escHtml(t.text)}</span>
          <button class="task-del" onclick="deleteTask(${t.id})" title="Eliminar">✕</button>
        </div>`).join('')}
    `;
  }

  list.innerHTML =
    renderSection(mainTasks, 'Misión Principal', '⚔') +
    renderSection(sideTasks, 'Misiones Secundarias', '📜');
}

function playCheckSound() {
  try {
    const ctx  = getAudioCtx(); // resumes suspended context automatically
    // Two-note chime: root + fifth, like a little bell
    const notes = [
      { freq: 880, delay: 0,    dur: 0.5 },
      { freq: 1320, delay: 0.06, dur: 0.4 },
    ];
    notes.forEach(({ freq, delay, dur }) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t); osc.stop(t + dur + 0.05);
    });
  } catch(e) {}
}

renderTasks();

/* ══════════════════════════════════════════════
   NOTIFICATIONS
   ══════════════════════════════════════════════ */
let notifTimeout;
function showNotif(msg) {
  const n = $('notif');
  n.textContent = msg;
  n.classList.add('show');
  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => n.classList.remove('show'), 2500);
}

/* ══════════════════════════════════════════════
   SESSION INFO
   ══════════════════════════════════════════════ */
function updateSessionInfo() {
  const done  = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const info  = $('session-info');
  info.textContent = total === 0
    ? '✦ Sesión de estudio activa ✦'
    : done === total
      ? `✦ ¡Todas las misiones completadas! (${total}/${total}) ✦`
      : `✦ ${done}/${total} misiones completadas ✦`;
}
setInterval(updateSessionInfo, 3000);
updateSessionInfo();

/* ══════════════════════════════════════════════
   QUOTES
   ══════════════════════════════════════════════ */
const quotes = [
  { t:'La magia comienza donde termina la comodidad.',                    s:'Diario de Ithya, p.1'      },
  { t:'Cada hechizo aprendido es una puerta abierta al infinito.',        s:'Biblioteca de Lathea'      },
  { t:'El conocimiento es el más poderoso de los conjuros.',              s:'Maestra Sera'              },
  { t:'Estudia hoy, vuela mañana.',                                       s:'Proverbio Arcano'          },
  { t:'Un pequeño paso cada día construye montañas con el tiempo.',       s:'Viejo mago errante'        },
  { t:'La paciencia es la primera lección de toda magia.',                s:'Libro de los Elementales'  },
  { t:'No existe tarea demasiado pequeña para quien persigue la grandeza.',s:'Tomo de los Sabios'       },
  { t:'El silencio es el primer paso hacia la concentración profunda.',   s:'Escuela de Arcana'         },
  { t:'Quien estudia en la oscuridad, brilla con más fuerza al alba.',    s:'Crónicas del Archivista'   },
  { t:'La disciplina es el puente entre el deseo y el logro.',            s:'Maestro Aldric, año 1402'  },
  { t:'Cada página leída es un tesoro que nadie puede robarte.',          s:'Biblioteca de los Susurros'},
  { t:'El tiempo dedicado al saber jamás se pierde.',                     s:'Inscripción en la Torre'   },
];
let qIdx = 0;

function nextQuote() {
  qIdx = (qIdx + 1) % quotes.length;
  const q = quotes[qIdx];

  // Bottom bar — fade
  const quoteEl = $('quote');
  if (quoteEl) {
    quoteEl.style.transition = 'opacity 0.5s';
    quoteEl.style.opacity = '0';
    setTimeout(() => {
      if ($('quote-text')) $('quote-text').textContent = q.t;
      if ($('quote-src'))  $('quote-src').textContent  = '— ' + q.s;
      quoteEl.style.opacity = '1';
    }, 500);
  }

  // Topbar — fade too
  const topWrap = $('quote-wrap-top');
  if (topWrap) {
    topWrap.style.transition = 'opacity 0.5s';
    topWrap.style.opacity = '0';
    setTimeout(() => {
      if ($('quote-text-top')) $('quote-text-top').textContent = q.t;
      if ($('quote-src-top'))  $('quote-src-top').textContent  = '— ' + q.s;
      topWrap.style.opacity = '1';
    }, 500);
  }
}

// Init both
if ($('quote-text'))     $('quote-text').textContent     = quotes[0].t;
if ($('quote-src'))      $('quote-src').textContent      = '— ' + quotes[0].s;
if ($('quote-text-top')) $('quote-text-top').textContent = quotes[0].t;
if ($('quote-src-top'))  $('quote-src-top').textContent  = '— ' + quotes[0].s;
setInterval(nextQuote, 12000);

/* ══════════════════════════════════════════════
   RESTORE UI STATE ON LOAD
   ══════════════════════════════════════════════ */
(function restoreUI() {
  document.querySelectorAll('.scene-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.scene === currentScene));

  const timeMap = { 'Día':'day', 'Ocaso':'sunset', 'Noche':'night', 'Lluvia':'rain' };
  document.querySelectorAll('.time-btn').forEach(b =>
    b.classList.toggle('active', timeMap[b.textContent.trim()] === currentTime));

  const pomoTabMap = { 'Enfoque':'focus', 'Descanso':'short', 'Pausa larga':'long' };
  document.querySelectorAll('.pomo-mode-tab').forEach(b =>
    b.classList.toggle('active', pomoTabMap[b.textContent.trim()] === pomoType));

  // Apply initial theme
  applyTheme(currentTime);

})();

/* ══════════════════════════════════════════════
   FULLSCREEN MODE
   ══════════════════════════════════════════════
   Layout: pomodoro top-left · tasks top-right
           music bottom-right · character center
   ══════════════════════════════════════════════ */
let fsActive = false;

function toggleFullscreen() {
  fsActive = !fsActive;
  if (fsActive) enterFullscreen();
  else exitFullscreen();
}

function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen)       el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();

  document.body.classList.add('fs-active');
  $('fs-overlay').classList.add('active');

  // Reset all panels to visible state
  ['fs-pomo','fs-tasks','fs-music'].forEach(id => {
    const p = $(id);
    if (p) p.classList.remove('fs-hidden');
  });
  const ghost = $('pomo-ghost');
  if (ghost) ghost.classList.remove('visible');
  ['fs-pomo-tab','fs-tasks-tab','fs-music-tab'].forEach(id => {
    const t = $(id);
    if (t) t.classList.remove('visible');
  });

  syncFsPanels();
}

function exitFullscreen() {
  if (document.exitFullscreen)       document.exitFullscreen().catch(()=>{});
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();

  document.body.classList.remove('fs-active');
  $('fs-overlay').classList.remove('active');
  fsActive = false;
}

// Sync panel content into fullscreen slots
function syncFsPanels() {
  // Helper: clear only the cloned panel content, preserve .fs-hide-btn
  function refillFsPanel(containerId, sourcePanelId, compact) {
    const container = $(containerId);
    if (!container) return;
    // Remove previous cloned content but keep .fs-hide-btn
    container.querySelectorAll(':scope > :not(.fs-hide-btn)').forEach(el => el.remove());
    const clone = clonePanel(sourcePanelId, compact);
    container.appendChild(clone);
  }

  refillFsPanel('fs-pomo',  'pomodoro-panel');
  refillFsPanel('fs-tasks', 'tasks-panel');
  refillFsPanel('fs-music', 'music-panel', true);

  $('fs-character-wrap').innerHTML = '';
  $('fs-session-info').textContent = $('session-info').textContent;
}

// Deep-clone a panel, rebinding all onclick handlers
function clonePanel(id, compactPlaylist) {
  const original = $(id);
  const clone    = original.cloneNode(true);
  clone.id       = 'fs-inner-' + id;

  // Re-wire buttons — handle `this` correctly by passing the button element
  clone.querySelectorAll('[onclick]').forEach(btn => {
    const fn = btn.getAttribute('onclick');
    btn.removeAttribute('onclick');
    btn.addEventListener('click', function() {
      // Replace bare `this` in the handler with a direct call using the element
      try {
        // For toggleAmb(this,'key') pattern — pass the button itself
        const fixedFn = fn.replace(/\bthis\b/g, '__btn__');
        const wrapped = new Function('__btn__', fixedFn);
        wrapped.call(this, this);
        syncFsState();
      } catch(e) { console.warn('clonePanel handler error:', e, fn); }
    });
  });

  // Re-wire range inputs (oninput uses this.value)
  clone.querySelectorAll('input[type=range]').forEach(inp => {
    const fn = inp.getAttribute('oninput');
    if (!fn) return;
    inp.removeAttribute('oninput');
    inp.addEventListener('input', function() {
      try {
        const wrapped = new Function('__val__', fn.replace(/\bthis\.value\b/g, '__val__'));
        wrapped(this.value);
      } catch(e) {}
    });
    // Keep value in sync with original
    const orig = original.querySelector('#' + inp.id);
    if (orig) inp.value = orig.value;
  });

  // Re-wire keydown on task input — focus the clone input so addTask() picks it up
  const taskInp = clone.querySelector('#task-input');
  if (taskInp) {
    taskInp.removeAttribute('onkeydown');
    taskInp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        taskInp.focus(); // ensure activeElement is the fs input
        addTask();
        syncFsState();
      }
    });
  }

  // Re-wire add-task button to focus fs input first
  const addBtn = clone.querySelector('#add-task-btn');
  if (addBtn) {
    const existingFn = addBtn.getAttribute('onclick');
    // Already re-wired above via querySelectorAll('[onclick]'), just ensure fs input focus
    addBtn.addEventListener('click', () => { taskInp?.focus(); }, true);
  }

  if (compactPlaylist) {
    const pl = clone.querySelector('#playlist');
    if (pl) pl.style.maxHeight = '80px';
  }

  return clone;
}

// After any action in fullscreen, re-sync dynamic content
function syncFsState() {
  if (!fsActive) return;

  const fsPomo = $('fs-pomo');
  if (fsPomo) {
    const inner = fsPomo.querySelector('[id^="fs-inner-"]');
    if (inner) {
      const t = inner.querySelector('#pomo-time');
      const l = inner.querySelector('#pomo-label');
      const p = inner.querySelector('#pomo-progress');
      const b = inner.querySelector('#pomo-play-btn');
      if (t) t.textContent = $('pomo-time').textContent;
      if (l) l.textContent = $('pomo-label').textContent;
      if (b) {
        const src = $('pomo-play-btn');
        b.textContent = src.textContent;
        b.classList.toggle('running', src.classList.contains('running'));
      }
      if (p) {
        p.style.strokeDasharray  = $('pomo-progress').style.strokeDasharray;
        p.style.strokeDashoffset = $('pomo-progress').style.strokeDashoffset;
      }
      const origDots  = document.querySelectorAll('#pomo-sessions .session-dot');
      const cloneDots = inner.querySelectorAll('.session-dot');
      cloneDots.forEach((d, i) => d.classList.toggle('done', origDots[i]?.classList.contains('done')));
      const origTabs  = document.querySelectorAll('#pomodoro-panel .pomo-mode-tab');
      const cloneTabs = inner.querySelectorAll('.pomo-mode-tab');
      cloneTabs.forEach((b, i) => b.classList.toggle('active', origTabs[i]?.classList.contains('active')));
    }
  }

  const fsTasks = $('fs-tasks');
  if (fsTasks) {
    const origList  = $('task-list');
    const cloneList = fsTasks.querySelector('#task-list');
    if (origList && cloneList) {
      // Normalize HTML for comparison — strip inline styles that differ trivially
      const normalize = h => h.replace(/\s+/g, ' ').trim();
      const newHtml = origList.innerHTML;
      if (normalize(cloneList.innerHTML) !== normalize(newHtml)) {
        // Temporarily suppress layout shift by setting fixed height during update
        cloneList.style.minHeight = cloneList.offsetHeight + 'px';
        cloneList.innerHTML = newHtml;
        // Remove animation from all newly inserted items immediately
        cloneList.querySelectorAll('.task-item').forEach(el => {
          el.style.animation = 'none';
        });
        // Re-bind click handlers — resume audio context first to enable sounds
        cloneList.querySelectorAll('[onclick]').forEach(btn => {
          const fn = btn.getAttribute('onclick');
          btn.removeAttribute('onclick');
          btn.addEventListener('click', () => {
            try { getAudioCtx(); eval(fn); syncFsState(); } catch(e){}
          });
        });
        requestAnimationFrame(() => { cloneList.style.minHeight = ''; });
      }
    }
    const clearBtn = fsTasks.querySelector('#clear-done-btn');
    if (clearBtn) clearBtn.style.display = $('clear-done-btn').style.display;
  }

  const fsMusic = $('fs-music');
  if (fsMusic) {
    const origPl  = $('playlist');
    const clonePl = fsMusic.querySelector('#playlist');
    if (origPl && clonePl) clonePl.innerHTML = origPl.innerHTML;
    const playBtn = fsMusic.querySelector('#btn-play');
    if (playBtn) playBtn.textContent = $('btn-play').textContent;
    const fill = fsMusic.querySelector('#progress-bar-fill');
    if (fill) fill.style.width = $('progress-bar-fill').style.width;
    const cur = fsMusic.querySelector('#time-current');
    if (cur) cur.textContent = $('time-current').textContent;
    const tot = fsMusic.querySelector('#time-total');
    if (tot) tot.textContent = $('time-total').textContent;
  }

  const fsSI = $('fs-session-info');
  if (fsSI) fsSI.textContent = $('session-info').textContent;

  // Sync chat button active state
  const fsChatBtn = document.querySelector('.fs-chat-btn');
  if (fsChatBtn) fsChatBtn.classList.toggle('active', chatOpen);
}

// Keep fs panels in sync every second while active
setInterval(() => {
  if (fsActive) {
    syncFsState();
    const ghost = $('pomo-ghost');
    if (ghost && ghost.classList.contains('visible')) {
      const gt = $('pomo-ghost-time');
      if (gt) gt.textContent = $('pomo-time').textContent;
      const gl = $('pomo-ghost-label');
      if (gl) gl.textContent = $('pomo-label').textContent;
    }
  }
}, 1000);

// Exit fs if browser fullscreen is closed externally (Escape key)
document.addEventListener('fullscreenchange',       () => { if (!document.fullscreenElement && fsActive)       exitFullscreen(); });
document.addEventListener('webkitfullscreenchange', () => { if (!document.webkitFullscreenElement && fsActive) exitFullscreen(); });

/* ══════════════════════════════════════════════
   FULLSCREEN PANEL COLLAPSE
   ══════════════════════════════════════════════ */
function fsPanelToggle(panelId, ghostId, tabId) {
  const panel = $(panelId);
  if (!panel) return;
  const isHidden = panel.classList.contains('fs-hidden');

  if (isHidden) {
    // Restore panel
    panel.classList.remove('fs-hidden');
    if (ghostId) $(ghostId)?.classList.remove('visible');
    if (tabId)   $(tabId)?.classList.remove('visible');
  } else {
    // Hide panel
    panel.classList.add('fs-hidden');
    // Show ghost or edge tab
    if (ghostId) {
      const ghost = $(ghostId);
      if (ghost) {
        ghost.classList.add('visible');
        const gt = $('pomo-ghost-time');
        if (gt) gt.textContent = $('pomo-time').textContent;
      }
    }
    if (tabId) $(tabId)?.classList.add('visible');
  }
}

/* ══════════════════════════════════════════════
   AI CHAT
   ══════════════════════════════════════════════ */
let chatOpen = false;
let chatHistory = [];

function toggleChat() {
  chatOpen = !chatOpen;
  const panel = $('ai-chat-panel');
  panel.classList.toggle('open', chatOpen);
  // Sync both the main pill and the fs pill
  document.querySelectorAll('#ai-chat-btn, .fs-chat-btn').forEach(btn => {
    if (btn) btn.classList.toggle('active', chatOpen);
  });
  if (chatOpen) {
    $('ai-chat-input').focus();
    if (chatHistory.length === 0) {
      addChatBubble('assistant', '✦ Hola, soy tu asistente de estudio. ¿En qué puedo ayudarte hoy?');
    }
  }
}

function addChatBubble(role, text) {
  const msgs = $('ai-chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble ' + role;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addChatTyping() {
  const msgs = $('ai-chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-bubble assistant typing';
  div.id = 'chat-typing';
  div.innerHTML = '<span></span><span></span><span></span>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function sendChatMsg() {
  if (!PROXY_URL) {
    addChatBubble('assistant',
      '⚠ Para activar el asistente:\n' +
      '1. Ve a console.groq.com → crea cuenta → genera API key\n' +
      '2. Ve a cloudflare.com → crea un Worker "arcana-proxy"\n' +
      '3. Guarda la key como Secret "GROQ_API_KEY" en el Worker\n' +
      '4. Pega la URL del Worker en app.js → PROXY_URL');
    return;
  }
  const input = $('ai-chat-input');
  const text  = input.value.trim();
  if (!text) return;
  input.value = '';
  $('ai-chat-send').disabled = true;

  addChatBubble('user', text);
  chatHistory.push({ role: 'user', content: text });

  const typing = addChatTyping();

  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        temperature: 0.7,
        messages: [
          {
            role: 'system',
            content:
              'Eres un asistente de estudio dentro de una app llamada Arcana Studies. ' +
              'Responde siempre en español, de forma clara, breve y útil. ' +
              'Explica conceptos con ejemplos sencillos cuando sea necesario. ' +
              'Mantén un tono amable, motivador y cercano. ' +
              'Si la pregunta es compleja, responde en no más de 4-5 oraciones. ' +
              'Para listas o pasos, usa formato limpio sin markdown excesivo.',
          },
          ...chatHistory.slice(-12),
        ],
      }),
    });

    if (!res.ok) {
      throw new Error('Error del servidor: ' + res.status);
    }

    const data = await res.json();
    typing.remove();

    if (data.error) {
      addChatBubble('assistant', '⚠ Error: ' + (data.error.message || 'Error desconocido'));
    } else {
      const reply = data.choices?.[0]?.message?.content?.trim() || '...';
      chatHistory.push({ role: 'assistant', content: reply });
      addChatBubble('assistant', reply);
    }
  } catch (e) {
    typing.remove();
    addChatBubble('assistant', '⚠ No se pudo conectar. Comprueba que la URL del Worker es correcta.');
  }

  $('ai-chat-send').disabled = false;
  $('ai-chat-input').focus();
}

/* ── Final: render scene (after all functions are defined) ── */
renderScene();

/* ══════════════════════════════════════════════
   STICKY NOTES (fullscreen mode)
   ══════════════════════════════════════════════ */
let noteCount = 0;

function addStickyNote() {
  noteCount++;
  const container = $('fs-notes');
  if (!container) return;

  // Spread notes around center with slight randomness
  const vw = window.innerWidth, vh = window.innerHeight;
  const x = Math.round(vw * 0.3 + (Math.random() - 0.5) * vw * 0.25);
  const y = Math.round(vh * 0.3 + (Math.random() - 0.5) * vh * 0.2);

  const note = document.createElement('div');
  note.className = 'sticky-note';
  note.style.left = x + 'px';
  note.style.top  = y + 'px';
  // Slight random rotation for authenticity
  const rot = (Math.random() - 0.5) * 4;
  note.style.transform = `rotate(${rot}deg)`;
  note.dataset.rot = rot;

  note.innerHTML = `
    <div class="sticky-scroll-top"></div>
    <div class="sticky-body-wrap">
      <div class="sticky-header">
        <span class="sticky-title">Nota ${noteCount}</span>
        <button class="sticky-close" onclick="this.closest('.sticky-note').remove()">✕</button>
      </div>
      <textarea class="sticky-body" placeholder="Escribe aquí..."></textarea>
    </div>
    <div class="sticky-scroll-bottom"></div>
  `;

  container.appendChild(note);
  makeDraggable(note);
  note.querySelector('.sticky-body').focus();
  showNotif('📜 Nueva nota creada');
}

function makeDraggable(el) {
  const header = el.querySelector('.sticky-header');
  let startX, startY, startL, startT, dragging = false;

  header.addEventListener('mousedown', e => {
    if (e.target.closest('.sticky-close')) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startL = parseInt(el.style.left) || 0;
    startT = parseInt(el.style.top)  || 0;
    el.style.zIndex = ++noteCount + 10;
    el.style.transition = 'none';
    el.style.transform = 'rotate(' + (el.dataset.rot || 0) + 'deg) scale(1.02)';
    e.preventDefault();
  });

  // Touch support
  header.addEventListener('touchstart', e => {
    if (e.target.closest('.sticky-close')) return;
    dragging = true;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    startL = parseInt(el.style.left) || 0;
    startT = parseInt(el.style.top)  || 0;
    el.style.zIndex = ++noteCount + 10;
    el.style.transition = 'none';
  }, { passive: true });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    el.style.left = Math.max(0, Math.min(window.innerWidth  - el.offsetWidth,  startL + dx)) + 'px';
    el.style.top  = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, startT + dy)) + 'px';
  });

  document.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches[0];
    const dx = t.clientX - startX, dy = t.clientY - startY;
    el.style.left = Math.max(0, Math.min(window.innerWidth  - el.offsetWidth,  startL + dx)) + 'px';
    el.style.top  = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, startT + dy)) + 'px';
  }, { passive: true });

  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    el.style.transition = '';
    el.style.transform = `rotate(${el.dataset.rot || 0}deg) scale(1)`;
  };
  document.addEventListener('mouseup',  stopDrag);
  document.addEventListener('touchend', stopDrag);
}
