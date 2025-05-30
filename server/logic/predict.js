import { spawn } from 'child_process';
import { resolve as pathResolve } from 'node:path';

export function predictDelay(dayOfWeekId, airportId, logger = console) {
  logger.info({ dayOfWeekId, airportId }, 'Spawning Python process for prediction');
  return new Promise((resolve, reject) => {
    const pythonScript = pathResolve(process.cwd(), 'server/logic/predict_delay.py');
    const args = [pythonScript, dayOfWeekId, airportId];
    const python = spawn('python3', args);

    let data = '';
    let error = '';

    python.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });

    python.stderr.on('data', (chunk) => {
      error += chunk.toString();
    });

    python.on('close', (code) => {
      if (code !== 0 || error) {
        reject(new Error(error || `Python process exited with code ${code}`));
      } else {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (e) {
          reject(new Error('Failed to parse prediction result: ' + e.message));
        }
      }
    });
  });
}
