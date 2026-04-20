import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));

initializeApp({
  projectId: config.projectId
});

const db = getFirestore();
db.settings({ databaseId: config.firestoreDatabaseId });

async function run() {
  try {
    await db.collection('test').doc('admin_test').set({ adminConnected: true });
    console.log('Firebase Admin Success');
  } catch(e: any) {
    console.log('Firebase Admin Error', e.message);
  }
}
run();
