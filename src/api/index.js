import { request } from './client';

export { setToken } from './client';

/* ── Auth ── */
export async function login(username, password) {
  return request('/api/auth/login', { method: 'POST', body: { username, password } });
}

/* ── Rooms ── */
export async function getRooms() {
  return request('/api/rooms');
}

export async function createRoom(num, type) {
  return request('/api/rooms', { method: 'POST', body: { num, type } });
}

export async function updateRoom(num, type) {
  return request(`/api/rooms/${num}`, { method: 'PUT', body: { type } });
}

export async function deleteRoom(num) {
  return request(`/api/rooms/${num}`, { method: 'DELETE' });
}

export async function bookRoom(num, guestData) {
  return request(`/api/rooms/${num}/book`, { method: 'POST', body: guestData });
}

export async function checkInRoom(num, guestData) {
  return request(`/api/rooms/${num}/checkin`, { method: 'POST', body: guestData });
}

export async function checkOutRoom(num, checkOutDate) {
  return request(`/api/rooms/${num}/checkout`, { method: 'POST', body: { checkOut: checkOutDate } });
}

export async function cancelBooking(num) {
  return request(`/api/rooms/${num}/booking`, { method: 'DELETE' });
}

export async function updateRoomGuest(num, guestData) {
  return request(`/api/rooms/${num}/guest`, { method: 'PUT', body: guestData });
}

/* ── Prices ── */
export async function getPrices() {
  return request('/api/prices');
}

export async function updatePrices(prices) {
  return request('/api/prices', { method: 'PUT', body: prices });
}

/* ── Guests ── */
export async function getGuests() {
  return request('/api/guests');
}

/* ── Stays ── */
export async function getStays() {
  return request('/api/stays');
}

/* ── Users ── */
export async function getUsers() {
  return request('/api/users');
}

export async function createUser(userData) {
  return request('/api/users', { method: 'POST', body: {
    name:     userData.name,
    username: userData.username,
    password: userData.password,
    role:     userData.role,
  }});
}

export async function updateUser(id, userData) {
  return request(`/api/users/${id}`, { method: 'PUT', body: {
    name:   userData.name,
    role:   userData.role,
    active: userData.active,
    ...(userData.password ? { password: userData.password } : {}),
  }});
}

export async function deleteUser(id) {
  return request(`/api/users/${id}`, { method: 'DELETE' });
}
