import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const form = document.getElementById("formVeiculo");
const mensagem = document.getElementById("mensagem");

let usuarioAtual = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;
  await carregarVeiculo();
});

async function carregarVeiculo() {
  const ref = doc(db, "motoristas", usuarioAtual.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const dados = snap.data();

  document.getElementById("cidadeAtual").value = dados.cidadeAtual || "";
  document.getElementById("estadoAtual").value = dados.estadoAtual || "";
  document.getElementById("disponivel").value = String(dados.disponivel);
  document.getElementById("tipoCaminhao").value = dados.tipoCaminhao || "";
  document.getElementById("carroceria").value = dados.carroceria || "";
  document.getElementById("capacidade").value = dados.capacidade || "";
  document.getElementById("placa").value = dados.placa || "";
  document.getElementById("whatsapp").value = dados.whatsapp || "";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!usuarioAtual) {
    mensagem.textContent = "Usuário não autenticado.";
    return;
  }

  mensagem.textContent = "Salvando veículo...";

  const dadosVeiculo = {
    userId: usuarioAtual.uid,
    cidadeAtual: document.getElementById("cidadeAtual").value.trim(),
    estadoAtual: document.getElementById("estadoAtual").value.trim(),
    disponivel: document.getElementById("disponivel").value === "true",
    tipoCaminhao: document.getElementById("tipoCaminhao").value,
    carroceria: document.getElementById("carroceria").value,
    capacidade: document.getElementById("capacidade").value.trim(),
    placa: document.getElementById("placa").value.trim(),
    whatsapp: document.getElementById("whatsapp").value.trim(),
    atualizadoEm: serverTimestamp()
  };

  try {
    await setDoc(doc(db, "motoristas", usuarioAtual.uid), dadosVeiculo, {
      merge: true
    });

    mensagem.textContent = "Veículo salvo com sucesso!";
  } catch (erro) {
    mensagem.textContent = "Erro ao salvar veículo: " + erro.message;
  }
});
