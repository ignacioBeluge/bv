import client from './client';

// GET las métricas del usuario
export async function obtenerMetricas() {
  const response = await client.get('/usuarios/me/metricas');
  return response.data;
}