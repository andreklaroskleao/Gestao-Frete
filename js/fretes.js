import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const listaFretes = document.getElementById("listaFretes");
const btnFiltrar = document.getElementById("btnFiltrar");

let usuarioAtual = null;
let todosFretes = [];

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;
  await carregarFretes();
});

btnFiltrar.addEventListener("click", () => {
  aplicarFiltros();
});

async function carregarFretes() {
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
  const origem = document.getElementById("filtroOrigem").value.toLowerCase().trim();
  const destino = document.getElementById("filtroDestino").value.toLowerCase().trim();

  const filtrados = todosFretes.filter((frete) => {
    const origemTexto = `${frete.origemCidade} ${frete.origemEstado}`.toLowerCase();
    const destinoTexto = `${frete.destinoCidade} ${frete.destinoEstado}`.toLowerCase();

    return origemTexto.includes(origem) && destinoTexto.includes(destino);
  });

  renderizarFretes(filtrados);
}

function renderizarFretes(fretes) {
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
      <button class="btn primary" data-id="${frete.id}">Tenho interesse</button>
    `;

    const botao = card.querySelector("button");
    botao.addEventListener("click", () => demonstrarInteresse(frete.id));

    listaFretes.appendChild(card);
  });
}

async function demonstrarInteresse(freteId) {
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
