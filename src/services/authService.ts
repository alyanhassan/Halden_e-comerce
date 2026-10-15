/**
 * Mock Authentication Service
 * NOTE: This is a client-side mock implementation using localStorage persistence.
 * When integrating Supabase or Firebase Auth, replace these methods with the corresponding SDK calls.
 */

import { Address, User } from '../types';

const AUTH_USER_KEY = 'halden_current_user';
const USERS_DB_KEY = 'halden_users_database';

interface StoredUserAccount extends User {
  passwordHash: string;
}

const SEED_USERS: StoredUserAccount[] = [
  {
    id: 'usr-seed-01',
    name: 'Julian Vance',
    email: 'julian@halden.com',
    createdAt: '2026-01-15T10:00:00Z',
    passwordHash: 'password123',
    addresses: [
      {
        id: 'addr-seed-01',
        fullName: 'Julian Vance',
        address: '148 Mercer Street',
        apartment: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10012',
        country: 'United States',
        phone: '+1 (555) 234-5678',
        isDefault: true,
      },
    ],
  },
];

function getUsersDB(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(SEED_USERS));
      return SEED_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_USERS;
  }
}

function saveUsersDB(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

export async function getCurrentUser(): Promise<User | null> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const user: User = JSON.parse(raw);
    // Refresh with DB to get up-to-date addresses
    const db = getUsersDB();
    const updated = db.find((u) => u.id === user.id);
    if (updated) {
      const { passwordHash: _, ...cleanUser } = updated;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cleanUser));
      return cleanUser;
    }
    return user;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const db = getUsersDB();
  const normalizedEmail = email.trim().toLowerCase();
  const found = db.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!found || found.passwordHash !== password) {
    throw new Error('Invalid email or password. Please verify your credentials.');
  }

  const { passwordHash: _, ...cleanUser } = found;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cleanUser));
  return cleanUser;
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 35));
  const db = getUsersDB();
  const normalizedEmail = email.trim().toLowerCase();

  if (db.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email address already exists.');
  }

  const newUser: StoredUserAccount = {
    id: `usr-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    createdAt: new Date().toISOString(),
    passwordHash: password,
    addresses: [],
  };

  db.push(newUser);
  saveUsersDB(db);

  const { passwordHash: _, ...cleanUser } = newUser;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cleanUser));
  return cleanUser;
}

export async function logout(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  localStorage.removeItem(AUTH_USER_KEY);
}

export async function updateProfile(name: string, email: string): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const current = await getCurrentUser();
  if (!current) throw new Error('You must be signed in to update your profile.');

  const db = getUsersDB();
  const user = db.find((u) => u.id === current.id);
  if (!user) throw new Error('User not found.');

  user.name = name.trim();
  user.email = email.trim().toLowerCase();
  saveUsersDB(db);

  const { passwordHash: _, ...cleanUser } = user;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cleanUser));
  return cleanUser;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const current = await getCurrentUser();
  if (!current) throw new Error('You must be signed in to change password.');

  const db = getUsersDB();
  const user = db.find((u) => u.id === current.id);
  if (!user) throw new Error('User not found.');

  if (user.passwordHash !== currentPassword) {
    throw new Error('Current password is incorrect.');
  }

  user.passwordHash = newPassword;
  saveUsersDB(db);
}

export async function addAddress(addressData: Omit<Address, 'id'>): Promise<Address> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const current = await getCurrentUser();
  if (!current) throw new Error('Must be signed in to add address.');

  const db = getUsersDB();
  const user = db.find((u) => u.id === current.id);
  if (!user) throw new Error('User not found.');

  const newAddress: Address = {
    ...addressData,
    id: `addr-${Date.now()}`,
    isDefault: addressData.isDefault || user.addresses.length === 0,
  };

  if (newAddress.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses.push(newAddress);
  saveUsersDB(db);

  const { passwordHash: _, ...cleanUser } = user;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cleanUser));
  return newAddress;
}

export async function updateAddress(address: Address): Promise<Address> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const current = await getCurrentUser();
  if (!current) throw new Error('Must be signed in.');

  const db = getUsersDB();
  const user = db.find((u) => u.id === current.id);
  if (!user) throw new Error('User not found.');

  const index = user.addresses.findIndex((a) => a.id === address.id);
  if (index === -1) throw new Error('Address not found.');

  if (address.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }

  user.addresses[index] = address;
  saveUsersDB(db);

  const { passwordHash: _, ...cleanUser } = user;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cleanUser));
  return address;
}

export async function deleteAddress(addressId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  const current = await getCurrentUser();
  if (!current) throw new Error('Must be signed in.');

  const db = getUsersDB();
  const user = db.find((u) => u.id === current.id);
  if (!user) throw new Error('User not found.');

  const wasDefault = user.addresses.find((a) => a.id === addressId)?.isDefault;
  user.addresses = user.addresses.filter((a) => a.id !== addressId);

  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  saveUsersDB(db);

  const { passwordHash: _, ...cleanUser } = user;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cleanUser));
}

export async function setDefaultAddress(addressId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const current = await getCurrentUser();
  if (!current) throw new Error('Must be signed in.');

  const db = getUsersDB();
  const user = db.find((u) => u.id === current.id);
  if (!user) throw new Error('User not found.');

  user.addresses.forEach((a) => {
    a.isDefault = a.id === addressId;
  });

  saveUsersDB(db);

  const { passwordHash: _, ...cleanUser } = user;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(cleanUser));
}
