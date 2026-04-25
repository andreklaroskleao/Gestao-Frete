import { auth, db } from "./firebase.js";
import { protegerPagina } from "./proteger.js";
import { configurarLogout } from "./logout.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

protegerPagina("gestor");
configurarLogout();

const listaFretes = document.getElementById("listaFretes");
const filtroStatusGestor = document.getElementById("filtroStatusGestor");

const totalFretes = document.getElementById("totalFretes");
const fretesAbertos = document.getElementById("fretesAbertos");
const fretesAndamento = document.getElementById("fretesAndamento");
const fretesConcluidos = document.getElementById("fretesConcluidos");

let usuarioAtual = null;
let fretesGestor = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login-gestor.html";
    return;
  }

  usuarioAtual = user;
  await carregarFretes();
});

if (filtroStatusGestor) {
  filtroStatusGestor.addEventListener("change", () => {
    renderizarFretes();
  });
}

async function carregarFretes() {
  if (!listaFretes) return;

  listaFretes.innerHTML = "<p>Carregando fretes...</p>";

  try {
    const q = query(
      collection(db, "fretes"),
      where("gestorId", "==", usuarioAtual.uid),
      orderBy("criadoEm", "desc")
    );

    const snap = await getDocs(q);

    fretesGestor = [];

    snap.forEach((docItem) => {
      fretesGestor.push({
        id: docItem.id,
        ...docItem.data()
      });
    });

    atualizarIndicadores();
    renderizarFretes();
  } catch (erro) {
    listaFretes.innerHTML = "<p>Erro ao carregar fretes: " + erro.message + "</p>";
  }
}

function atualizarIndicadores() {
  const abertos = fretesGestor.filter((frete) => frete.status === "aberto").length;

  const andamento = fretesGestor.filter((frete) => {
    return [
      "em_negociacao",
      "motorista_aprovado",
      "em_coleta",
      "em_viagem"
    ].includes(frete.status);
  }).length;

  const concluidos = fretesGestor.filter((frete) => frete.status === "concluido").length;

  if (totalFretes) totalFretes.textContent = fretesGestor.length;
  if (fretesAbertos) fretesAbertos.textContent = abertos;
  if (fretesAndamento) fretesAndamento.textContent = andamento;
  if (fretesConcluidos) fretesConcluidos.textContent = concluidos;
}

function renderizarFretes() {
  if (!listaFretes) return;

  const statusFiltro = filtroStatusGestor?.value || "";

  const listaFiltrada = fretesGestor.filter((frete) => {
    return !statusFiltro || frete.status === statusFiltro;
  });

  if (listaFiltrada.length === 0) {
    listaFretes.innerHTML = "<p>Nenhum frete encontrado para este filtro.</p>";
    return;
  }

  listaFretes.innerHTML = "";

  listaFiltrada.forEach((frete) => {
    const card = document.createElement("div");
    card.className = "frete-card";

    card.innerHTML = `
      <div class="card-top">
        <h3>${frete.origemCidade}/${frete.origemEstado} → ${frete.destinoCidade}/${frete.destinoEstado}</h3>
        <span class="badge ${classeStatus(frete.status)}">${formatarStatus(frete.status)}</span>
      </div>

      <p><strong>Carga:</strong> ${frete.carga}</p>
      <p><strong>Peso:</strong> ${frete.peso}</p>
      <p><strong>Valor:</strong> R$ ${Number(frete.valor).toFixed(2)}</p>
      <p><strong>Caminhão:</strong> ${frete.tipoCaminhao}</p>
      <p><strong>Carroceria:</strong> ${frete.carroceria}</p>

      <div class="actions">
        <a class="btn primary" href="frete.html?id=${frete.id}">Gerenciar frete</a>
      </div>
    `;

    listaFretes.appendChild(card);
  });
}

function formatarStatus(status) {
  const nomes = {
    aberto: "Aberto",
    em_negociacao: "Em negociação",
    motorista_aprovado: "Motorista aprovado",
    em_coleta: "Em coleta",
    em_viagem: "Em viagem",
    concluido: "Concluído",
    cancelado: "Cancelado"
  };

  return nomes[status] || status;
}

function classeStatus(status) {
  if (status === "aberto") return "info";
  if (status === "concluido") return "success";
  if (status === "cancelado") return "danger-badge";
  return "warning";
}
