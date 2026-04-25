import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

export function protegerPagina(tipoPermitido) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const refUsuario = doc(db, "usuarios", user.uid);
    const snapUsuario = await getDoc(refUsuario);

    if (!snapUsuario.exists()) {
      window.location.href = "login.html";
      return;
    }

    const usuario = snapUsuario.data();

    if (usuario.tipo !== tipoPermitido) {
      alert("Você não tem permissão para acessar esta página.");

      if (usuario.tipo === "gestor") {
        window.location.href = "gestor.html";
      } else {
        window.location.href = "motorista.html";
      }
    }
  });
}
