import { auth, db } from "./firebase.js";
import { protegerPagina } from "./proteger.js";
import { configurarEstadoCidade } from "./ibge.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

protegerPagina("gestor");

configurarEstadoCidade("origemEstado", "origemCidade");
configurarEstadoCidade("destinoEstado", "destinoCidade");

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

    const origemEstado = document.getElementById("origemEstado").value;
    const origemCidade = document.getElementById("origemCidade").value;
    const destinoEstado = document.getElementById("destinoEstado").value;
    const destinoCidade = document.getElementById("destinoCidade").value;

    if (!origemEstado || !origemCidade || !destinoEstado || !destinoCidade) {
      mensagem.textContent = "Selecione origem e destino corretamente.";
      return;
    }

    mensagem.textContent = "Publicando frete...";

    const frete = {
      gestorId: usuarioAtual.uid,

      origemCidade,
      origemEstado,
      enderecoColeta: document.getElementById("enderecoColeta").value.trim(),

      destinoCidade,
      destinoEstado,
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

      document.getElementById("origemCidade").disabled = true;
      document.getElementById("origemCidade").innerHTML = `<option value="">Selecione primeiro o estado</option>`;

      document.getElementById("destinoCidade").disabled = true;
      document.getElementById("destinoCidade").innerHTML = `<option value="">Selecione primeiro o estado</option>`;

      setTimeout(() => {
        window.location.href = "gestor.html";
      }, 1000);
    } catch (erro) {
      mensagem.textContent = "Erro ao publicar frete: " + erro.message;
    }
  });
}
