import { auth, db } from "./firebase.js";
import { protegerPagina } from "./proteger.js";
import { carregarEstados, carregarCidades } from "./ibge.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

protegerPagina("motorista");

const listaFretes = document.getElementById("listaFretes");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnLimparFiltros = document.getElementById("btnLimparFiltros");

const filtroOrigemEstado = document.getElementById("filtroOrigemEstado");
const filtroOrigemCidade = document.getElementById("filtroOrigemCidade");
const filtroDestinoEstado = document.getElementById("filtroDestinoEstado");
const filtroDestinoCidade = document.getElementById("filtroDestinoCidade");

let usuarioAtual = null;
let todosFretes = [];

carregarEstados("filtroOrigemEstado");
carregarEstados("filtroDestinoEstado");

if (filtroOrigemEstado) {
  filtroOrigemEstado.addEventListener("change", () => {
    carregarCidades(filtroOrigemEstado.value, "filtroOrigemCidade");
  });
}

if (filtroDestinoEstado) {
  filtroDestinoEstado.addEventListener("change", () => {
    carregarCidades(filtroDestinoEstado.value, "filtroDestinoCidade");
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;
  await carregarFretes();
});

if (btnFiltrar) {
  btnFiltrar.addEventListener("click", () => {
    aplicarFiltros();
  });
}

if (btnLimparFiltros) {
  btnLimparFiltros.addEventListener("click", () => {
    filtroOrigemEstado.value = "";
    filtroOrigemCidade.innerHTML = `<option value="">Origem: selecione o estado</option>`;
    filtroOrigemCidade.disabled = true;

    filtroDestinoEstado.value = "";
    filtroDestinoCidade.innerHTML = `<option value="">Destino: selecione o estado</option>`;
    filtroDestinoCidade.disabled = true;

    aplicarFiltros();
  });
}

async function carregarFretes() {
  if (!listaFretes) return;

  listaFretes.innerHTML = "<p>Carregando fretes...</p>";

  try {
    const q = query(
      collection(db, "fretes"),
      where("status", "==", "aberto"),
      orderBy("criadoEm", "desc")
    );

    const snap = await getDocs(q);

    todosFretes = [];

    snap.forEach((docItem) => {
      todosFretes.push({
        id: docItem.id,
        ...docItem.data()
      });
    });

    aplicarFiltros();
  } catch (erro) {
    listaFretes.innerHTML = "<p>Erro ao carregar fretes: " + erro.message + "</p>";
  }
}

function aplicarFiltros() {
  const origemEstado = filtroOrigemEstado?.value || "";
  const origemCidade = filtroOrigemCidade?.value || "";
  const destinoEstado = filtroDestinoEstado?.value || "";
  const destinoCidade = filtroDestinoCidade?.value || "";

  const filtrados = todosFretes.filter((frete) => {
    const origemEstadoOk = !origemEstado || frete.origemEstado === origemEstado;
    const origemCidadeOk = !origemCidade || frete.origemCidade === origemCidade;
    const destinoEstadoOk = !destinoEstado || frete.destinoEstado === destinoEstado;
    const destinoCidadeOk = !destinoCidade || frete.destinoCidade === destinoCidade;

    return origemEstadoOk && origemCidadeOk && destinoEstadoOk && destinoCidadeOk;
  });

  renderizarFretes(filtrados);
}

function renderizarFretes(fretes) {
  if (!listaFretes) return;

  if (fretes.length === 0) {
    listaFretes.innerHTML = "<p>Nenhum frete encontrado.</p>";
    return;
  }

  listaFretes.innerHTML = "";

  fretes.forEach((frete) => {
    const card = document.createElement("div");
    card.className = "frete-card";

    card.innerHTML = `
      <h3>${frete.origemCidade}/${frete.origemEstado} → ${frete.destinoCidade}/${frete.destinoEstado}</h3>
      <p><strong>Carga:</strong> ${frete.carga}</p>
      <p><strong>Peso:</strong> ${frete.peso}</p>
      <p><strong>Valor:</strong> R$ ${Number(frete.valor).toFixed(2)}</p>
      <p><strong>Caminhão:</strong> ${frete.tipoCaminhao}</p>
      <p><strong>Carroceria:</strong> ${frete.carroceria}</p>

      <div class="actions">
        <button class="btn primary" data-id="${frete.id}">Tenho interesse</button>
        <a class="btn secondary" href="frete.html?id=${frete.id}">Ver detalhes</a>
      </div>
    `;

    const botao = card.querySelector("button");
    botao.addEventListener("click", () => demonstrarInteresse(frete.id));

    listaFretes.appendChild(card);
  });
}

async function demonstrarInteresse(freteId) {
  if (!usuarioAtual) {
    alert("Você precisa estar logado.");
    return;
  }

  try {
    await addDoc(collection(db, "interesses"), {
      freteId,
      motoristaId: usuarioAtual.uid,
      status: "interessado",
      criadoEm: serverTimestamp()
    });

    alert("Interesse enviado ao gestor!");
  } catch (erro) {
    alert("Erro ao enviar interesse: " + erro.message);
  }
}
