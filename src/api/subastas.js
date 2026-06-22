import client from './client';

// GET /auctions — trae las subastas que el usuario puede ver
export async function listarSubastas() {
  const response = await client.get('/auctions');
  return response.data;
}

// GET /auctions/{id} — detalle de una subasta
export async function obtenerSubasta(id) {
  const response = await client.get(`/auctions/${id}`);
  return response.data;
}

// GET límites del slider (calculados por el servidor)
export async function obtenerLimites(subastaId, itemId) {
  const response = await client.get(
    `/auctions/${subastaId}/items/${itemId}/constraints`
  );
  return response.data;
}

// POST realizar una puja
export async function realizarPuja(subastaId, itemId, monto, medioPagoId) {
  const response = await client.post(
    `/auctions/${subastaId}/items/${itemId}/bids`,
    { monto, medioPagoId }
  );
  return response.data;
}

// GET si el usuario puede pujar en la subasta
export async function puedePujar(subastaId) {
  const response = await client.get(`/auctions/${subastaId}/can-bid`);
  return response.data; // { puedePujar, motivo }
}

// GET detalle de un ítem con fotos y descripción completa
export async function obtenerDetalleItem(subastaId, itemId) {
  const response = await client.get(`/auctions/${subastaId}/items/${itemId}`);
  return response.data;
}

export async function obtenerHistorialPujas(subastaId, itemId) {
  const response = await client.get(`/auctions/${subastaId}/items/${itemId}/bids`);
  return response.data; // [{ pujaId, monto, numeroPostor, esMia }]
}

// GET estado del remate (polling)
export async function obtenerEstadoRemate(subastaId, itemId) {
  const response = await client.get(
    `/auctions/${subastaId}/items/${itemId}/estado-remate`
  );
  return response.data;
}

// GET qué ítem está en remate activo en la subasta
export async function obtenerItemEnRemate(subastaId) {
  const response = await client.get(`/auctions/${subastaId}/item-en-remate`);
  return response.data; // { hayRemateActivo, itemId, descripcion }
}