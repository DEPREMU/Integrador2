// Test script para verificar la lógica de scheduling
const getNextScheduledTime = (startTime, intervalMs) => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const now = new Date();
  const baseTime = new Date();

  baseTime.setHours(hours, minutes, 0, 0);

  console.log(
    `⏰ getNextScheduledTime - startTime: ${startTime}, intervalMs: ${intervalMs}ms (${intervalMs / 3600000}h)`,
  );
  console.log(
    `⏰ Current time: ${now.toLocaleTimeString()}, Target time: ${baseTime.toLocaleTimeString()}`,
  );

  // Si es hoy y aún no ha llegado la hora (futuro cercano)
  if (baseTime > now) {
    const timeUntil = baseTime.getTime() - now.getTime();
    console.log(
      `⏰ Time until target (future): ${timeUntil}ms (${Math.round(timeUntil / 60000)} minutes)`,
    );
    return timeUntil;
  }

  // Si la hora ya pasó hoy, calcular la próxima ocurrencia
  const timeSinceBase = now.getTime() - baseTime.getTime();
  console.log(
    `⏰ Time since base (past): ${timeSinceBase}ms (${Math.round(timeSinceBase / 60000)} minutes)`,
  );

  // Para casos donde la hora ya pasó, calcular cuándo será la próxima ocurrencia basada en el intervalo
  if (timeSinceBase > 0) {
    // Calcular cuántos intervalos completos han pasado desde la hora base
    const intervalsPassed = Math.floor(timeSinceBase / intervalMs);
    console.log(
      `⏰ Complete intervals passed since base time: ${intervalsPassed}`,
    );

    // Calcular el tiempo de la próxima ocurrencia
    const nextOccurrence =
      baseTime.getTime() + (intervalsPassed + 1) * intervalMs;
    const timeUntilNext = nextOccurrence - now.getTime();

    console.log(
      `⏰ Next occurrence scheduled in: ${timeUntilNext}ms (${Math.round(timeUntilNext / 60000)} minutes)`,
    );

    // Si la próxima ocurrencia es muy pronto (menos de 1 minuto), usar el siguiente intervalo
    if (timeUntilNext < 60000) {
      const nextAfterThat = nextOccurrence + intervalMs;
      const timeUntilNextAfterThat = nextAfterThat - now.getTime();
      console.log(
        `⏰ Next occurrence too soon, using subsequent one: ${timeUntilNextAfterThat}ms (${Math.round(timeUntilNextAfterThat / 60000)} minutes)`,
      );
      return timeUntilNextAfterThat;
    }

    return timeUntilNext;
  }

  // Fallback: si algo sale mal, usar el intervalo completo
  console.log(`⏰ Fallback: using full interval ${intervalMs}ms`);
  return intervalMs;
};

// Test casos
console.log("=== Test 1: Hora futura (13:35 cuando son las 13:33) ===");
// Simular que son las 13:33
const mockNow1 = new Date();
mockNow1.setHours(13, 33, 0, 0);
const originalNow = Date.now;
Date.now = () => mockNow1.getTime();

const result1 = getNextScheduledTime("13:41", 4 * 3600000); // 4 horas
console.log(
  `Resultado: ${result1}ms = ${Math.round(result1 / 60000)} minutos\n`,
);

console.log("=== Test 2: Hora pasada con intervalo grande ===");
// Simular que son las 14:00 y la hora programada era 13:30
const mockNow2 = new Date();
mockNow2.setHours(14, 0, 0, 0);
Date.now = () => mockNow2.getTime();

const result2 = getNextScheduledTime("13:30", 4 * 3600000); // 4 horas
console.log(
  `Resultado: ${result2}ms = ${Math.round(result2 / 60000)} minutos\n`,
);

console.log("=== Test 3: Intervalo corto (1 hora) ===");
const result3 = getNextScheduledTime("13:35", 1 * 3600000); // 1 hora
console.log(
  `Resultado: ${result3}ms = ${Math.round(result3 / 60000)} minutos\n`,
);

// Restaurar Date.now
Date.now = originalNow;
