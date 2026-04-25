import { auth, db } from "./firebase.js";

import {
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const form = document.getElementById("formLoginMotorista");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  mensagem.textContent = "Entrando...";

  try {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    const refUsuario = doc(db, "usuarios", user.uid);
    const snapUsuario = await getDoc(refUsuario);

    if (!snapUsuario.exists()) {
      await signOut(auth);
      mensagem.textContent = "Cadastro não encontrado.";
      return;
    }

    const usuario = snapUsuario.data();

    if (usuario.tipo !== "motorista") {
      await signOut(auth);
      mensagem.textContent = "Este login é exclusivo para caminhoneiros.";
      return;
    }

    window.location.href = "motorista.html";
  } catch (erro) {
    mensagem.textContent = "Erro ao entrar: " + erro.message;
  }
});
