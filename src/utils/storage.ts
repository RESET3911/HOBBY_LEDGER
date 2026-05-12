import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Hobby, HobbyLog } from '../types';

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

const HOBBIES = 'hobby_ledger_hobbies';
const LOGS = 'hobby_ledger_logs';

export function subscribeHobbies(
  cb: (items: Hobby[]) => void,
  onErr?: () => void
): () => void {
  return onSnapshot(
    collection(db, HOBBIES),
    snap => cb(snap.docs.map(d => d.data() as Hobby).sort((a, b) => a.createdAt.localeCompare(b.createdAt))),
    () => onErr?.()
  );
}

export function subscribeLogs(
  cb: (items: HobbyLog[]) => void,
  onErr?: () => void
): () => void {
  return onSnapshot(
    collection(db, LOGS),
    snap => cb(snap.docs.map(d => d.data() as HobbyLog).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))),
    () => onErr?.()
  );
}

export async function saveHobby(hobby: Hobby): Promise<void> {
  await setDoc(doc(db, HOBBIES, hobby.id), stripUndefined(hobby));
}

export async function deleteHobby(id: string): Promise<void> {
  await deleteDoc(doc(db, HOBBIES, id));
}

export async function saveLog(log: HobbyLog): Promise<void> {
  await setDoc(doc(db, LOGS, log.id), stripUndefined(log));
}

export async function deleteLog(id: string): Promise<void> {
  await deleteDoc(doc(db, LOGS, id));
}
