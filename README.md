# Cancionero de guitarra (app instalable)

App web que se instala en el teléfono y la tablet (iPhone, iPad y Android). Acordes con letra que tú pegas, buscador, avance automático, transposición, compartir por WhatsApp y conexión opcional con Spotify. No necesita programar ni instalar nada en el computador: solo un navegador.

## Qué trae

- 36 canciones de grunge, rock clásico, rock progresivo y rock chileno. 14 traen la progresión de acordes de referencia (sin letra). Las otras quedan vacías hasta que pegues tu hoja.
- Buscador por canción, artista o acorde, y filtros por género.
- Avance automático con velocidad ajustable; se pausa al tocar la hoja.
- Transposición por semitono, tamaño de letra, pantalla encendida mientras tocas.
- Compartir por WhatsApp (texto con acordes) o copiar.
- Funciona sin conexión una vez abierta.
- Spotify (necesita Premium): suena la canción y la hoja avanza al ritmo real, o solo sigue lo que ya está sonando, o avance manual sin música.

## Importante sobre las letras

La app no trae letras: tienen derechos de autor. Tú pegas las hojas (con "Pegar hoja" o "Editar") o importas archivos de texto desde Ajustes. Esas hojas se guardan solo en tu dispositivo, nunca en el repositorio de GitHub.

## 1. Publicarla en GitHub Pages (unos 10 minutos, desde un computador)

1. Descomprime el .zip. Queda una carpeta con `index.html`, `app.js`, etc. y una subcarpeta `icons`.
2. Entra a https://github.com y crea una cuenta gratis (o inicia sesión).
3. Arriba a la derecha: **+ → New repository**. Nombre: `cancionero`. Déjalo **Public**. Toca **Create repository**.
4. En la página del repositorio nuevo toca **uploading an existing file** (o **Add file → Upload files**).
5. Arrastra desde la carpeta descomprimida **todos los archivos y la carpeta `icons`** (no la carpeta contenedora). Espera a que termine de subir y toca **Commit changes**.
6. Ve a **Settings → Pages**. En "Build and deployment", Source: **Deploy from a branch**. Branch: **main** y carpeta **/ (root)**. Toca **Save**.
7. Espera 1 o 2 minutos y refresca. Arriba aparece la dirección de tu app, con esta forma:
   `https://TU-USUARIO.github.io/cancionero/`

## 2. Instalarla en el teléfono y la tablet

- **iPhone/iPad:** abre la dirección en **Safari** → botón Compartir → **Agregar a inicio**.
- **Android:** abre la dirección en **Chrome** → menú ⋮ → **Instalar app** (o "Agregar a pantalla de inicio").

## 3. Conectar Spotify (3 minutos)

Necesitas Spotify Premium (ya lo tienes).

1. Entra a https://developer.spotify.com/dashboard con tu cuenta de Spotify y acepta los términos.
2. **Create app**. Nombre y descripción: lo que quieras (ej. "Cancionero").
3. En **Redirect URI** pega la dirección exacta de tu app, con la barra final: `https://TU-USUARIO.github.io/cancionero/` (la app también la muestra en ⚙ Ajustes con un botón para copiarla).
4. En "Which API/SDKs are you planning to use?" marca **Web API**. Acepta y guarda.
5. En la página de la app, **Settings**: copia el **Client ID**. En **User Management** agrega tu propio nombre y el correo de tu cuenta de Spotify (por si acaso).
6. En la app: ⚙ **Ajustes** → pega el Client ID → **Conectar Spotify** → acepta los permisos.
7. **iPhone/iPad:** el ícono instalado y Safari no comparten datos, así que haz el paso 6 abriendo la dirección en Safari (sin tocar el ícono). Luego toca "Copiar código de enlace", abre la app instalada, ve a ⚙ → "iPhone/iPad: conectar con la app instalada", pega el código y toca "Usar código".

El Client ID no es un secreto, pero igual se guarda solo en tu dispositivo, no en el código.

## 4. Cómo usarla con Spotify

- Elige el modo dentro de la canción:
  - **Spotify: suena y avanza.** Al tocar ▶ busca el tema, lo reproduce en tu app de Spotify y la hoja avanza siguiendo el segundo exacto.
  - **Spotify: solo seguir lo que suena.** Tú pones el tema en Spotify y la hoja lo sigue.
  - **Sin música: avance manual.** Para tocar sin que suene nada; usa la velocidad.
- Antes de tocar ▶ abre la app de Spotify en el mismo dispositivo y reproduce algo un segundo, para que haya un dispositivo activo.
- **Marcar aquí:** mientras suena, si la hoja no va al ritmo de la canción, toca la hoja para pausar el avance, llévala a donde corresponde y toca "Marcar aquí". La app aprende los tiempos de esa canción y los guarda. "Retomar" reanuda sin marcar.
- **Cambiar versión:** si el tema que encontró es en vivo o remasterizado, elige otra versión.
- **♪ Suena:** abre en el cancionero la canción que está sonando en Spotify.

## 5. Pasar tus hojas entre el teléfono y la tablet

Tus hojas se guardan solo en cada dispositivo. En ⚙ Ajustes: **Compartir respaldo** genera un archivo que puedes enviarte por WhatsApp; en el otro dispositivo, **Importar respaldo**. También puedes importar varios archivos de texto (.txt, .pro, .cho) de una vez con **Importar hojas**; si el nombre es "Artista - Título", los reconoce.

## 6. Actualizar la app

Sube los archivos nuevos al repositorio (Add file → Upload files, reemplazando). Si cambiaste algo, abre `sw.js` y sube el número de `VERSION` (por ejemplo `cancionero-v2`) para que los dispositivos se actualicen.

## Límites que conviene conocer

- La música suena en la app de Spotify, no dentro del cancionero.
- Spotify exige Premium para controlar la reproducción. Las apps en modo desarrollo solo funcionan mientras el dueño tenga Premium activo, y aceptan pocos usuarios (para uso personal sobra).
- Spotify no entrega acordes ni tonalidad de los temas, solo el tema y el segundo en que va.
- El repositorio es público (GitHub Pages gratis lo exige): no subas hojas con letras.
