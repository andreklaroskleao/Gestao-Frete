import { auth } from "./firebase.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

export function configurarLogout(idBotao = "btnSair") {
  const botao = document.getElementById(idBotao);

  if (!botao) return;

  botao.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (erro) {
      alert("Erro ao sair: " + erro.message);
    }
  });
}
