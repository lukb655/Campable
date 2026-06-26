import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export let HAS_FB = false;
export let db = null;
export let auth = null;
let _fbInitDone = false;

export const _configReady = fetch('/api/config')
  .then(r => { if (!r.ok) throw new Error('config ' + r.status); return r.json(); })
  .then(cfg => { window.FIREBASE_CONFIG = cfg; })
  .catch(e => {
    console.warn('Config fetch failed — local mode only.', e.message);
    window.FIREBASE_CONFIG = {};
  });

export function _initFirebase() {
  if (_fbInitDone) return;
  _fbInitDone = true;
  try {
    const cfg = window.FIREBASE_CONFIG || {};
    if (cfg.projectId && !window._FB_LOAD_ERR) {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      db   = firebase.firestore();
      auth = firebase.auth();
      auth.setPersistence("local").catch(() => {});
      HAS_FB = true;
    }
  } catch(e) {
    console.warn("Firebase init failed — local mode.", e.message);
    db = null; auth = null; HAS_FB = false;
  }
}
