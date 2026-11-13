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

// Enlace "añadir evento" de Google Calendar (sin API): de la llegada (16:30) al bus de vuelta (06:00 del día siguiente)
export function googleCalendarUrl({ title, details }) {
  const d = new Date(WEDDING.date + 'T12:00:00Z');
  const next = new Date(d.getTime() + 86400000);
  const ymd = (x) => x.toISOString().slice(0, 10).replace(/-/g, '');
  const hm = (s) => s.replace(':', '') + '00';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${ymd(d)}T${hm(WEDDING.arrival)}/${ymd(next)}T${hm(WEDDING.busBack)}`,
    ctz: 'Europe/Madrid',
    details,
    location: 'Iglesia de Nuestra Señora de los Remedios, Estepona',
  });
  return 'https://calendar.google.com/calendar/render?' + params.toString();
}
