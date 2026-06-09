import client from './client';

// Llama a POST /auth/login del backend Spring Boot.
export async function login(email, password) {
  const response = await client.post('/auth/login', {
    email,
    password,
  });
  return response.data; // { token, usuarioId, nombre, categoria, etapaRegistro }
}

// POST /auth/registro/paso1 — crea cuenta pendiente
export async function registroPaso1(datos) {
  const response = await client.post('/auth/registro/paso1', datos);
  return response.data; // { usuarioId, mensaje, etapaRegistro }
}

// POST /auth/registro/paso2 — activa cuenta con contraseña
export async function registroPaso2(usuarioId, password, passwordConfirm) {
  const response = await client.post('/auth/registro/paso2', {
    usuarioId,
    password,
    passwordConfirm,
  });
  return response.data;
}

// GET estado del registro
export async function consultarEstadoRegistro(usuarioId) {
  const response = await client.get(`/auth/registro/estado/${usuarioId}`);
  return response.data; // { usuarioId, etapaRegistro, aprobado, categoria }
}
