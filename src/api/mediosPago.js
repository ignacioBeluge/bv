import client from './client';

// GET medios de pago del usuario logueado
export async function misMediosDePago() {
  const response = await client.get('/usuarios/me/medios-pago');
  return response.data; // [{ id, tipo, verificado, esPrincipal }]
}

// POST crear un nuevo medio de pago
export async function crearMedioPago(datos) {
  const response = await client.post('/usuarios/me/medios-pago', datos);
  return response.data;
}