import { spawn } from 'child_process';
import path from 'path';

export function predictDelay(dayOfWeekId, airportId, logger = console) {
  logger.info({ dayOfWeekId, airportId }, 'Spawning Python process for prediction');
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve('./server/logic/predict_delay.py');
    const args = [pythonScript, dayOfWeekId, airportId];
    const python = spawn('python3', args);

    let data = '';
    let error = '';

    python.stdout.on('data', (chunk) => {
      data += chunk.toString();
      logger.debug({ chunk: chunk.toString() }, 'Python stdout');
    });

    python.stderr.on('data', (chunk) => {
      error += chunk.toString();
      logger.error({ chunk: chunk.toString() }, 'Python stderr');
    });

    python.on('close', (code) => {
      logger.info({ code, data, error }, 'Python process closed');
      if (code !== 0 || error) {
        logger.error({ code, error }, 'Python process error');
        reject(new Error(error || `Python process exited with code ${code}`));
      } else {
        try {
          const result = JSON.parse(data);
          logger.info({ result }, 'Parsed prediction result');
          resolve(result);
        } catch (e) {
          logger.error({ data, err: e }, 'Failed to parse prediction result');
          reject(new Error('Failed to parse prediction result: ' + e.message));
        }
      }
    });
  });
}
