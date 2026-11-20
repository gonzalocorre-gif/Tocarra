/* Catálogo inicial. Solo progresiones de acordes, sin letras (las letras tienen derechos de autor).
   Las progresiones son de referencia: contrástalas con la grabación y corrígelas con "Editar".
   Las canciones sin "c" quedan sin acordes hasta que pegues tu hoja. */
const GEN={grunge:'Grunge',clasico:'Rock clásico',prog:'Rock progresivo',chileno:'Rock chileno',otro:'Otros'};
const REF='Progresión de referencia, sin letra. Contrástala con la grabación; si no calza el tono, usa Transponer.';
const SEED=[
{id:'teen-spirit',t:'Smells Like Teen Spirit',a:'Nirvana',g:'grunge',k:'Fm',c:'[Intro / Verso / Coro]\nF5    Bb5    Ab5    Db5\n(La misma vuelta toda la canción; en el verso, apagado y suave)'},
{id:'polly',t:'Polly',a:'Nirvana',g:'grunge'},
{id:'last-kiss',t:'Last Kiss',a:'Pearl Jam',g:'grunge'},
{id:'come-as-you-are',t:'Come As You Are',a:'Nirvana',g:'grunge'},
{id:'black',t:'Black',a:'Pearl Jam',g:'grunge'},
{id:'alive',t:'Alive',a:'Pearl Jam',g:'grunge'},
{id:'nutshell',t:'Nutshell',a:'Alice in Chains',g:'grunge'},
{id:'black-hole-sun',t:'Black Hole Sun',a:'Soundgarden',g:'grunge'},
{id:'plush',t:'Plush',a:'Stone Temple Pilots',g:'grunge'},
{id:'heart-shaped-box',t:'Heart-Shaped Box',a:'Nirvana',g:'grunge'},
{id:'knockin',t:"Knockin' on Heaven's Door",a:'Bob Dylan',g:'clasico',k:'G',c:'[Verso]\nG    D    Am\nG    D    C\n\n[Coro]\nG    D    Am\nG    D    C   (×4)'},
{id:'hotel-california',t:'Hotel California',a:'Eagles',g:'clasico',k:'Bm',c:'[Intro / Verso]\nBm    F#    A    E\nG     D     Em   F#\n\n[Coro]\nG    D    F#    Bm\nG    D    Em    F#'},
{id:'sweet-home',t:'Sweet Home Alabama',a:'Lynyrd Skynyrd',g:'clasico',k:'D',c:'[Toda la canción]\nD    Cadd9    G\n(Riff con arpegio sobre la misma vuelta)'},
{id:'free-bird',t:'Free Bird',a:'Lynyrd Skynyrd',g:'clasico',k:'G',c:'[Verso]\nG    D/F#    Em    F    C    D'},
{id:'wonderful-tonight',t:'Wonderful Tonight',a:'Eric Clapton',g:'clasico',k:'G',c:'[Intro / Verso]\nG    D    C    D'},
{id:'hey-joe',t:'Hey Joe',a:'The Jimi Hendrix Experience',g:'clasico',k:'E',c:'[Toda la canción]\nC    G    D    A    E   (×)'},
{id:'let-it-be',t:'Let It Be',a:'The Beatles',g:'clasico',k:'C',c:'[Verso]\nC    G    Am    F\nC    G    F     C\n\n[Coro]\nAm   G    F     C\nC    G    F     C'},
{id:'brown-eyed-girl',t:'Brown Eyed Girl',a:'Van Morrison',g:'clasico',k:'G',c:'[Intro / Verso]\nG    C    G    D'},
{id:'rising-sun',t:'The House of the Rising Sun',a:'The Animals',g:'clasico',k:'Am',c:'[Arpegio 6/8, toda la canción]\nAm   C    D    F\nAm   C    E    E\nAm   C    D    F\nAm   E    Am   E'},
{id:'stairway',t:'Stairway to Heaven',a:'Led Zeppelin',g:'clasico',k:'Am',c:'[Intro / Verso 1]\nAm    Am/G#    C/G    D/F#\nFmaj7    G    Am\nC    D    Fmaj7    Am\nC    G    D\n(Las secciones siguientes cambian: completa con tu hoja)'},
{id:'wish-you-were-here',t:'Wish You Were Here',a:'Pink Floyd',g:'prog',k:'G',c:'[Intro]\nEm   G   Em   G   Em   A   Em   A   G\n\n[Verso]\nC    D/F#    Am    G\nD/F#    C    Am    G'},
{id:'comfortably-numb',t:'Comfortably Numb',a:'Pink Floyd',g:'prog',k:'Bm',c:'[Verso]\nBm    A    G    Em    Bm\n\n[Coro]\nD    A    D    A\nC    G    C    G'},
{id:'dust-in-the-wind',t:'Dust in the Wind',a:'Kansas',g:'prog',k:'C',c:'[Intro (arpegio)]\nC    Cmaj7    Cadd9    C    Asus2    Asus4    Am\n\n[Verso]\nC    G/B    Am    G    Dm    Am\n\n[Coro]\nD/F#    G    Am\nG    Dm    Am'},
{id:'hey-you',t:'Hey You',a:'Pink Floyd',g:'prog'},
{id:'time',t:'Time',a:'Pink Floyd',g:'prog'},
{id:'roundabout',t:'Roundabout',a:'Yes',g:'prog'},
{id:'firth-of-fifth',t:'Firth of Fifth',a:'Genesis',g:'prog'},
{id:'closer-to-the-heart',t:'Closer to the Heart',a:'Rush',g:'prog'},
{id:'tren-al-sur',t:'Tren al sur',a:'Los Prisioneros',g:'chileno'},
{id:'baile-sobran',t:'El baile de los que sobran',a:'Los Prisioneros',g:'chileno'},
{id:'por-que-no-se-van',t:'¿Por qué no se van?',a:'Los Prisioneros',g:'chileno'},
{id:'todos-juntos',t:'Todos juntos',a:'Los Jaivas',g:'chileno'},
{id:'mentira',t:'Mentira',a:'La Ley',g:'chileno'},
{id:'dejate-caer',t:'Déjate caer',a:'Los Tres',g:'chileno'},
{id:'llueve-ciudad',t:'Llueve sobre la ciudad',a:'Los Bunkers',g:'chileno'},
{id:'respiro-boca',t:'Cuando respiro en tu boca',a:'Lucybell',g:'chileno'}];
SEED.forEach(s=>s.seed=true);
