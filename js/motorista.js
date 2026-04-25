import { auth } from "./firebase.js";
import { protegerPagina } from "./proteger.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

protegerPagina("motorista");

const btnSair = document.getElementById("btnSair");

if (btnSair) {
  btnSair.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
}
