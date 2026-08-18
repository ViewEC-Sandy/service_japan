import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const gate = document.getElementById('authGate');
const site = document.getElementById('siteApp');
const form = document.getElementById('loginForm');
const emailInput = document.getElementById('loginUser');
const passwordInput = document.getElementById('loginPass');
const errorEl = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

let siteInitialized = false;

function showSignedOut(){
  if(gate) gate.hidden = false;
  if(site) site.hidden = true;
}

function showSignedIn(){
  if(gate) gate.hidden = true;
  if(site) site.hidden = false;
  if(!siteInitialized && typeof window.initViewECSite === 'function') {
    siteInitialized = true;
    window.initViewECSite();
  }
}

function friendlyError(code){
  const map = {
    'auth/invalid-credential': 'Email 或密碼不正確。',
    'auth/invalid-email': 'Email 格式不正確。',
    'auth/user-disabled': '此帳號目前已停用。',
    'auth/too-many-requests': '登入嘗試次數過多，請稍後再試。',
    'auth/network-request-failed': '網路連線異常，請確認連線後再試。'
  };
  return map[code] || '登入失敗，請確認 Email 與密碼後再試。';
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if(errorEl) errorEl.textContent = '';
  const email = emailInput?.value.trim() || '';
  const password = passwordInput?.value || '';
  const submit = form.querySelector('button[type="submit"]');
  if(submit){ submit.disabled = true; submit.textContent = '登入中…'; }
  try {
    await signInWithEmailAndPassword(auth, email, password);
    if(passwordInput) passwordInput.value = '';
  } catch (error) {
    if(errorEl) errorEl.textContent = friendlyError(error?.code);
  } finally {
    if(submit){ submit.disabled = false; submit.textContent = '登入'; }
  }
});

logoutBtn?.addEventListener('click', async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase sign out failed:', error);
  }
});

onAuthStateChanged(auth, (user) => {
  if(user) showSignedIn();
  else showSignedOut();
});
