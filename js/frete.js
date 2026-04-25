import { auth, db } from "./firebase.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const detalhesFrete = document.getElementById("detalhesFrete");
const listaInteressados = document.getElementById("listaInteressados");
const areaInteressados = document.getElementById("areaInteressados");
const btnVoltar = document.getElementById("btnVoltar");

const params = new URLSearchParams(window.location.search);
const freteId = params.get("id");

let usuarioAtual = null;
let dadosUsuario = null;
let freteAtual = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;

  if (!freteId) {
    detalhesFrete.innerHTML = "<p>Frete não encontrado.</p>";
    return;
  }

  await carregarUsuario();
  await carregarFrete();
});

async function carregarUsuario() {
  const ref = doc(db, "usuarios", usuarioAtual.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    alert("Usuário não encontrado.");
    window.location.href = "login.html";
    return;
  }

  dadosUsuario = snap.data();

  if (dadosUsuario.tipo === "motorista") {
    btnVoltar.href = "fretes.html";
    areaInteressados.style.display = "none";
  } else {
    btnVoltar.href = "gestor.html";
  }
}

async function carregarFrete() {
  detalhesFrete.innerHTML = "<p>Carregando frete...</p>";

  const ref = doc(db, "fretes", freteId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    detalhesFrete.innerHTML = "<p>Frete não encontrado.</p>";
    return;
  }

  freteAtual = {
    id: snap.id,
    ...snap.data()
  };

  renderizarFrete();

  if (dadosUsuario.tipo === "gestor" && freteAtual.gestorId === usuarioAtual.uid) {
    await carregarInteressados();
  }
}

function renderizarFrete() {
  const gestorDono = dadosUsuario.tipo === "gestor" && freteAtual.gestorId === usuarioAtual.uid;
  const motoristaAprovado = freteAtual.motoristaAprovadoId === usuarioAtual.uid;
  const podeVerEndereco = gestorDono || motoristaAprovado;

  const origem = `${freteAtual.origemCidade}/${freteAtual.origemEstado}`;
  const destino = `${freteAtual.destinoCidade}/${freteAtual.destinoEstado}`;

  let html = `
    <div class="frete-card">
      <h3>${origem} → ${destino}</h3>

      <p><strong>Carga:</strong> ${freteAtual.carga}</p>
      <p><strong>Peso:</strong> ${freteAtual.peso}</p>
      <p><strong>Valor:</strong> R$ ${Number(freteAtual.valor).toFixed(2)}</p>
      <p><strong>Caminhão:</strong> ${freteAtual.tipoCaminhao}</p>
      <p><strong>Carroceria:</strong> ${freteAtual.carroceria}</p>
      <p><strong>Status:</strong> ${freteAtual.status}</p>
  `;

  if (freteAtual.observacoes) {
    html += `<p><strong>Observações:</strong> ${freteAtual.observacoes}</p>`;
  }

  if (podeVerEndereco) {
    const coleta = encodeURIComponent(freteAtual.enderecoColeta);
    const entrega = encodeURIComponent(freteAtual.enderecoEntrega);

    html += `
      <hr>
      <h3>Endereços liberados</h3>

      <p><strong>Coleta:</strong> ${freteAtual.enderecoColeta}</p>
      <p><strong>Entrega:</strong> ${freteAtual.enderecoEntrega}</p>

      <div class="actions">
        <a class="btn primary" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${coleta}">
          Google Maps Coleta
        </a>

        <a class="btn secondary" target="_blank" href="https://waze.com/ul?q=${coleta}&navigate=yes">
          Waze Coleta
        </a>

        <a class="btn primary" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${entrega}">
          Google Maps Entrega
        </a>

        <a class="btn secondary" target="_blank" href="https://waze.com/ul?q=${entrega}&navigate=yes">
          Waze Entrega
        </a>
      </div>
    `;
  } else {
    html += `
      <hr>
      <p><strong>Endereço completo:</strong> liberado após aprovação do gestor.</p>
    `;
  }

  if (gestorDono) {
    html += `
      <hr>
      <div class="actions">
        <button class="btn primary" onclick="alterarStatusFrete('em_coleta')">Em coleta</button>
        <button class="btn primary" onclick="alterarStatusFrete('em_viagem')">Em viagem</button>
        <button class="btn primary" onclick="alterarStatusFrete('concluido')">Concluído</button>
        <button class="btn danger" onclick="alterarStatusFrete('cancelado')">Cancelar</button>
      </div>
    `;
  }

  html += `</div>`;

  detalhesFrete.innerHTML = html;
}

async function carregarInteressados() {
  listaInteressados.innerHTML = "<p>Carregando interessados...</p>";

  const q = query(
    collection(db, "interesses"),
    where("freteId", "==", freteId),
    where("status", "==", "interessado")
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    listaInteressados.innerHTML = "<p>Nenhum interessado ainda.</p>";
    return;
  }

  listaInteressados.innerHTML = "";

  for (const docItem of snap.docs) {
    await renderizarInteressado(docItem.id, docItem.data());
  }
}

async function renderizarInteressado(interesseId, interesse) {
  const usuarioSnap = await getDoc(doc(db, "usuarios", interesse.motoristaId));
  const motoristaSnap = await getDoc(doc(db, "motoristas", interesse.motoristaId));

  const usuario = usuarioSnap.exists() ? usuarioSnap.data() : {};
  const motorista = motoristaSnap.exists() ? motoristaSnap.data() : {};

  const whatsapp = motorista.whatsapp || usuario.telefone || "";
  const numero = whatsapp.replace(/\D/g, "");

  const card = document.createElement("div");
  card.className = "frete-card";

  card.innerHTML = `
    <h3>${usuario.nome || "Motorista"}</h3>
    <p><strong>WhatsApp:</strong> ${whatsapp}</p>
    <p><strong>Cidade:</strong> ${motorista.cidadeAtual || "-"} / ${motorista.estadoAtual || "-"}</p>
    <p><strong>Caminhão:</strong> ${motorista.tipoCaminhao || "-"}</p>
    <p><strong>Carroceria:</strong> ${motorista.carroceria || "-"}</p>

    <div class="actions">
      <button class="btn primary">Aprovar</button>
      ${
        numero
          ? `<a class="btn secondary" target="_blank" href="https://wa.me/55${numero}?text=Olá, vi seu interesse no frete ${encodeURIComponent(freteAtual.origemCidade + " para " + freteAtual.destinoCidade)}">WhatsApp</a>`
          : ""
      }
    </div>
  `;

  card.querySelector("button").addEventListener("click", () => aprovarMotorista(interesseId, interesse.motoristaId));

  listaInteressados.appendChild(card);
}

async function aprovarMotorista(interesseId, motoristaId) {
  if (!confirm("Aprovar este motorista?")) return;

  try {
    await updateDoc(doc(db, "fretes", freteId), {
      motoristaAprovadoId: motoristaId,
      status: "motorista_aprovado"
    });

    await updateDoc(doc(db, "interesses", interesseId), {
      status: "aprovado"
    });

    alert("Motorista aprovado!");
    window.location.reload();
  } catch (erro) {
    alert("Erro: " + erro.message);
  }
}

window.alterarStatusFrete = async function (status) {
  try {
    await updateDoc(doc(db, "fretes", freteId), {
      status
    });

    alert("Status atualizado!");
    window.location.reload();
  } catch (erro) {
    alert("Erro: " + erro.message);
  }
};
