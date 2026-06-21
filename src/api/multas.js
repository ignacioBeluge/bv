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

// GET las compras del usuario (productos ganados)
export async function obtenerMisCompras() {
  const response = await client.get('/usuarios/me/compras');
  return response.data;
}

// POST pagar una compra
export async function pagarCompra(id) {
  const response = await client.post(`/usuarios/me/compras/${id}/pagar`);
  return response.data;
}
