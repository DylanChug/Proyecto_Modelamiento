function obtenerNombreDia(diaSugerido) {
  // Diccionario para resolver rápido si es una RUTINA (números del 1 al 7)
  const diasSemanales = {
    "1": "Lunes",
    "2": "Martes",
    "3": "Miércoles",
    "4": "Jueves",
    "5": "Viernes",
    "6": "Sábado",
    "7": "Domingo"
  };

  // CASO 1: Si es un número (Rutina), retornamos directo del diccionario
  if (diasSemanales[diaSugerido]) {
    return diasSemanales[diaSugerido];
  }

  // CASO 2: Si es una fecha completa (YYYY-MM-DD), la convertimos a objeto Date
  try {
    // Añadimos "T12:00:00" para evitar desfases de zona horaria al parsear strings
    const fecha = new Date(`${diaSugerido}T12:00:00`);
    
    // Usamos el formateador nativo de JS en español
    const opciones = { weekday: 'long' };
    const nombreDia = new Intl.DateTimeFormat('es-ES', opciones).format(fecha);
    
    // Capitalizamos la primera letra (ej: "viernes" -> "Viernes")
    return nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1);
  } catch (error) {
    return "Día no definido";
  }
}
export default obtenerNombreDia;