import { auth, db } from "./firebase.js";
import { protegerPagina } from "./proteger.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

protegerPagina("gestor");

const form = document.getElementById("formFrete");
const mensagem = document.getElementById("mensagem");

let usuarioAtual = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;
});

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!usuarioAtual) {
      mensagem.textContent = "Usuário não autenticado.";
      return;
    }

    mensagem.textContent = "Publicando frete...";

    const frete = {
      gestorId: usuarioAtual.uid,

      origemCidade: document.getElementById("origemCidade").value.trim(),
      origemEstado: document.getElementById("origemEstado").value.trim(),
      enderecoColeta: document.getElementById("enderecoColeta").value.trim(),

      destinoCidade: document.getElementById("destinoCidade").value.trim(),
      destinoEstado: document.getElementById("destinoEstado").value.trim(),
      enderecoEntrega: document.getElementById("enderecoEntrega").value.trim(),

      carga: document.getElementById("carga").value.trim(),
      peso: document.getElementById("peso").value.trim(),
      valor: Number(document.getElementById("valor").value),

      tipoCaminhao: document.getElementById("tipoCaminhao").value,
      carroceria: document.getElementById("carroceria").value,
      observacoes: document.getElementById("observacoes").value.trim(),

      status: "aberto",
      motoristaAprovadoId: null,
      criadoEm: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "fretes"), frete);

      mensagem.textContent = "Frete publicado com sucesso!";

      form.reset();

      setTimeout(() => {
        window.location.href = "gestor.html";
      }, 1000);
    } catch (erro) {
      mensagem.textContent = "Erro ao publicar frete: " + erro.message;
    }
  });
}
