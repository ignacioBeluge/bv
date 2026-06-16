import client from './client';

// GET /usuarios/me/multas — devuelve { bloqueado, multas: [...] }
export async function obtenerMisMultas() {
  const response = await client.get('/usuarios/me/multas');
  return response.data;
}
