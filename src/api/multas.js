import client from './client';

// GET /usuarios/me/multas — devuelve { bloqueado, multas: [...] }
export async function obtenerMisMultas() {
  const response = await client.get('/usuarios/me/multas');
  return response.data;
}

// GET /usuarios/me/pujas — devuelve array de MiPujaDTO
export async function obtenerMisPujas() {
  const response = await client.get('/usuarios/me/pujas');
  return response.data;
}
