import client from './client';

// POST publicar un artículo
export async function publicarArticulo(datos) {
  const response = await client.post('/articulos', datos);
  return response.data;
}

// GET listar mis artículos
export async function misArticulos() {
  const response = await client.get('/articulos');
  return response.data;
}

// GET detalle de un artículo
export async function obtenerArticulo(id) {
  const response = await client.get(`/articulos/${id}`);
  return response.data;
}

// POST aceptar o rechazar el precio propuesto
export async function responderCondiciones(id, acepta) {
  const response = await client.post(`/articulos/${id}/responder`, { acepta });
  return response.data;
}