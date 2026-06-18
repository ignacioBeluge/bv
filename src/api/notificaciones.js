import client from './client';

// GET todas las notificaciones
export async function obtenerNotificaciones() {
  const response = await client.get('/usuarios/me/notificaciones');
  return response.data;
}

// GET cantidad de no leídas (para el badge)
export async function contarNoLeidas() {
  const response = await client.get('/usuarios/me/notificaciones/no-leidas');
  return response.data.cantidad;
}

// PATCH marcar una como leída
export async function marcarLeida(id) {
  await client.patch(`/usuarios/me/notificaciones/${id}/leida`);
}

// PATCH marcar todas como leídas
export async function marcarTodasLeidas() {
  await client.patch('/usuarios/me/notificaciones/leer-todas');
}