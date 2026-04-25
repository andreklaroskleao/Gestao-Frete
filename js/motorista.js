import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const btnSair = document.getElementById("btnSair");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  }
});

btnSair.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
