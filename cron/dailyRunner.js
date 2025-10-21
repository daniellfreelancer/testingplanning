const { logger } = require('../libs/logger');
const steps = [
  require('./procesos/arrendatarios.js'),
  //require('./procesos/02'),
  //require('./procesos/03'),
];

async function runDailyProcess(deps) {
  const startedAt = new Date();
  logger.info('[DAILY] Proceso diario DESACTIVADO', { startedAt });
  // await runSteps(deps); // DESACTIVADO - proceso con timeout issues
  logger.info('[DAILY] Proceso diario desactivado - no se ejecutaron pasos', { durationMs: Date.now() - startedAt.getTime() });
}

async function runSteps(deps) {
  for (const step of steps) {
    const name = step.name || 'anonymous-step';
    const t0 = Date.now();
    try {
      logger.info(`[DAILY] -> ${name} iniciado`);
      await step.run(deps);                 // cada step recibe las dependencias
      logger.info(`[DAILY] <- ${name} ok`, { ms: Date.now() - t0 });
    } catch (err) {
      logger.error(`[DAILY] !! ${name} falló`, { error: err?.message, ms: Date.now() - t0 });
      throw err; // "throw continue" para seguir con el siguiente paso "throw err" para cortar todo el pipeline
    }
  }
}

module.exports = { runDailyProcess };
