// Simulamos una base de datos en memoria para usuarios
// En producción, esto debería ser una base de datos real
let users: Array<{
  id: string;
  email: string;
  name: string;
  password: string;
  phoneNumber?: string;
  createdAt: string;
}> = [];

// Función para obtener un usuario por email (para autenticación)
export function getUserByEmail(email: string) {
  return users.find(user => user.email === email);
}

// Función para obtener un usuario por número de teléfono
export function getUserByPhoneNumber(phoneNumber: string) {
  const cleanPhoneNumber = phoneNumber.replace('whatsapp:', '').replace('+', '').replace(/\s/g, '');
  return users.find(user => user.phoneNumber === cleanPhoneNumber);
}

// Función para obtener todos los usuarios
export function getAllUsers() {
  return users.map(user => ({
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt
  }));
}

// Función para agregar un usuario
export function addUser(user: {
  id: string;
  email: string;
  name: string;
  password: string;
  phoneNumber?: string;
  createdAt: string;
}) {
  users.push(user);
}

// Función para obtener el array de usuarios completo (para debugging)
export function getUsersArray() {
  return users;
}
