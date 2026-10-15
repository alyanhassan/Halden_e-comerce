import { ContactMessage } from '../types';

const CONTACT_MESSAGES_KEY = 'halden_contact_messages';

const SEED_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-01',
    name: 'Eleanor Vance',
    email: 'eleanor@example.com',
    subject: 'Sizing inquiry for Merino Wool Trousers',
    message: 'Hello, I usually wear a 32-inch waist. Would size Medium or Large be more appropriate for a relaxed silhouette?',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'read',
  },
  {
    id: 'msg-02',
    name: 'Marcus Brody',
    email: 'marcus.b@example.com',
    subject: 'Restock notification for Washed Black Hoodie',
    message: 'Will the 480gsm fleece pullover in Washed Black size XL be restocked before winter?',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: 'unread',
  },
];

function readMessages(): ContactMessage[] {
  try {
    const raw = localStorage.getItem(CONTACT_MESSAGES_KEY);
    if (!raw) {
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(SEED_MESSAGES));
      return SEED_MESSAGES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_MESSAGES;
  }
}

function writeMessages(messages: ContactMessage[]): void {
  try {
    localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(messages));
  } catch {
    // ignore
  }
}

export async function sendContactMessage(
  data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>
): Promise<ContactMessage> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const messages = readMessages();

  const newMessage: ContactMessage = {
    ...data,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'unread',
  };

  messages.unshift(newMessage);
  writeMessages(messages);
  return newMessage;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return readMessages();
}

export async function markMessageAsRead(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  const messages = readMessages();
  const target = messages.find((m) => m.id === id);
  if (target) {
    target.status = 'read';
    writeMessages(messages);
  }
}
