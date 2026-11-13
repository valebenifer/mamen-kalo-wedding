// Datos de la boda. Cambia aquí la fecha y los horarios (los textos están en src/i18n).
export const WEDDING = {
  // Fecha de la boda (formato ISO, hora local de España)
  date: '2027-10-09',
  arrival: '16:30',
  ceremony: '17:00',
  busOut: '18:30',
  busBack: '06:00',
};

const q = (s) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s)}`;
export const MAPS = {
  church: q('Iglesia de Nuestra Señora de los Remedios, Estepona'),
  cortijo: q('Cortijo Pedro Jiménez, Casares'),
  busStop: q('Parque del Calvario, Estepona'),
};

// Línea de tiempo (los textos están en i18n → timeline.items[key])
export const TIMELINE = [
  { time: WEDDING.arrival, key: 'arrival' },
  { time: WEDDING.ceremony, key: 'ceremony', highlight: true },
  { time: '18:00', key: 'exit' },
  { time: WEDDING.busOut, key: 'bus' },
  { time: '19:30', key: 'cocktail' },
  { time: '21:30', key: 'dinner' },
  { time: '23:30', key: 'cake' },
  { time: '00:30', key: 'party' },
  { time: '03:00', key: 'snack' },
  { time: WEDDING.busBack, key: 'busBack' },
];

export const ceremonyDate = () => new Date(`${WEDDING.date}T${WEDDING.ceremony}:00+02:00`);
