import { auth, db } from "./firebase.js";
import { protegerPagina } from "./proteger.js";
import { carregarEstados, carregarCidades } from "./ibge.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

protegerPagina("motorista");

const form = document.getElementById("formVeiculo");
const mensagem = document.getElementById("mensagem");
const listaVeiculos = document.getElementById("listaVeiculos");
const btnLimpar = document.getElementById("btnLimpar");
const estadoAtualSelect = document.getElementById("estadoAtual");

let usuarioAtual = null;

if (estadoAtualSelect) {
  estadoAtualSelect.addEventListener("change", () => {
    carregarCidades(estadoAtualSelect.value, "cidadeAtual");
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;

  await carregarEstados("estadoAtual");
  await carregarPerfilMotorista();
  await carregarVeiculos();
});

async function carregarPerfilMotorista() {
  try {
    const ref = doc(db, "motoristas", usuarioAtual.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const dados = snap.data();

    document.getElementById("estadoAtual").value = dados.estadoAtual || "";

    if (dados.estadoAtual) {
      await carregarCidades(dados.estadoAtual, "cidadeAtual", dados.cidadeAtual || "");
    }

    document.getElementById("whatsapp").value = dados.whatsapp || "";
  } catch (erro) {
    mensagem.textContent = "Erro ao carregar perfil: " + erro.message;
  }
}

async function carregarVeiculos() {
  if (!listaVeiculos) return;

  listaVeiculos.innerHTML = "<p>Carregando veículos...</p>";

  try {
    const q = query(
      collection(db, "veiculos"),
      where("motoristaId", "==", usuarioAtual.uid)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      listaVeiculos.innerHTML = "<p>Nenhum veículo cadastrado ainda.</p>";
      return;
    }

    listaVeiculos.innerHTML = "";

    snap.forEach((docItem) => {
      const veiculo = {
        id: docItem.id,
        ...docItem.data()
      };

      const card = document.createElement("div");
      card.className = "frete-card";

      card.innerHTML = `
        <div class="card-top">
          <h3>${veiculo.tipoCaminhao || "Veículo"} - ${veiculo.placa || "Sem placa"}</h3>
          ${veiculo.principal ? '<span class="badge success">Principal</span>' : ""}
        </div>

        <p><strong>Carroceria:</strong> ${veiculo.carroceria || "-"}</p>
        <p><strong>Capacidade:</strong> ${veiculo.capacidade || "-"}</p>
        <p><strong>Local:</strong> ${veiculo.cidadeAtual || "-"} / ${veiculo.estadoAtual || "-"}</p>
        <p><strong>Status:</strong> ${veiculo.ativo ? "Disponível" : "Indisponível"}</p>

        <div class="actions">
          <button class="btn primary btnEditar">Editar</button>
          <button class="btn secondary btnPrincipal">Tornar principal</button>
          <button class="btn danger btnStatus">${veiculo.ativo ? "Desativar" : "Ativar"}</button>
        </div>
      `;

      card.querySelector(".btnEditar").addEventListener("click", () => preencherFormulario(veiculo));
      card.querySelector(".btnPrincipal").addEventListener("click", () => tornarPrincipal(veiculo.id));
      card.querySelector(".btnStatus").addEventListener("click", () => alterarStatusVeiculo(veiculo.id, !veiculo.ativo));

      listaVeiculos.appendChild(card);
    });
  } catch (erro) {
    listaVeiculos.innerHTML = "<p>Erro ao carregar veículos: " + erro.message + "</p>";
  }
}

async function preencherFormulario(veiculo) {
  document.getElementById("veiculoId").value = veiculo.id;
  document.getElementById("estadoAtual").value = veiculo.estadoAtual || "";

  if (veiculo.estadoAtual) {
    await carregarCidades(veiculo.estadoAtual, "cidadeAtual", veiculo.cidadeAtual || "");
  }

  document.getElementById("tipoCaminhao").value = veiculo.tipoCaminhao || "";
  document.getElementById("carroceria").value = veiculo.carroceria || "";
  document.getElementById("capacidade").value = veiculo.capacidade || "";
  document.getElementById("placa").value = veiculo.placa || "";
  document.getElementById("whatsapp").value = veiculo.whatsapp || "";
  document.getElementById("principal").checked = !!veiculo.principal;
  document.getElementById("ativo").checked = !!veiculo.ativo;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

if (btnLimpar) {
  btnLimpar.addEventListener("click", () => {
    form.reset();
    document.getElementById("veiculoId").value = "";
    document.getElementById("cidadeAtual").innerHTML = '<option value="">Selecione primeiro o estado</option>';
    document.getElementById("cidadeAtual").disabled = true;
    document.getElementById("ativo").checked = true;
    mensagem.textContent = "";
  });
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!usuarioAtual) {
      mensagem.textContent = "Usuário não autenticado.";
      return;
    }

    const veiculoId = document.getElementById("veiculoId").value;
    const principal = document.getElementById("principal").checked;

    const dadosVeiculo = {
      motoristaId: usuarioAtual.uid,
      cidadeAtual: document.getElementById("cidadeAtual").value,
      estadoAtual: document.getElementById("estadoAtual").value,
      tipoCaminhao: document.getElementById("tipoCaminhao").value,
      carroceria: document.getElementById("carroceria").value,
      capacidade: document.getElementById("capacidade").value.trim(),
      placa: document.getElementById("placa").value.trim().toUpperCase(),
      whatsapp: document.getElementById("whatsapp").value.trim(),
      principal,
      ativo: document.getElementById("ativo").checked,
      atualizadoEm: serverTimestamp()
    };

    if (!dadosVeiculo.estadoAtual || !dadosVeiculo.cidadeAtual) {
      mensagem.textContent = "Selecione estado e cidade.";
      return;
    }

    mensagem.textContent = "Salvando veículo...";

    try {
      if (principal) {
        await removerPrincipalDosOutros();
      }

      if (veiculoId) {
        await updateDoc(doc(db, "veiculos", veiculoId), dadosVeiculo);
      } else {
        await addDoc(collection(db, "veiculos"), {
          ...dadosVeiculo,
          criadoEm: serverTimestamp()
        });
      }

      await setDoc(doc(db, "motoristas", usuarioAtual.uid), {
        userId: usuarioAtual.uid,
        cidadeAtual: dadosVeiculo.cidadeAtual,
        estadoAtual: dadosVeiculo.estadoAtual,
        disponivel: dadosVeiculo.ativo,
        tipoCaminhao: dadosVeiculo.tipoCaminhao,
        carroceria: dadosVeiculo.carroceria,
        capacidade: dadosVeiculo.capacidade,
        placa: dadosVeiculo.placa,
        whatsapp: dadosVeiculo.whatsapp,
        atualizadoEm: serverTimestamp()
      }, {
        merge: true
      });

      mensagem.textContent = "Veículo salvo com sucesso!";
      form.reset();
      document.getElementById("veiculoId").value = "";
      document.getElementById("ativo").checked = true;

      await carregarVeiculos();
    } catch (erro) {
      mensagem.textContent = "Erro ao salvar veículo: " + erro.message;
    }
  });
}

async function removerPrincipalDosOutros() {
  const q = query(
    collection(db, "veiculos"),
    where("motoristaId", "==", usuarioAtual.uid)
  );

  const snap = await getDocs(q);

  for (const docItem of snap.docs) {
    await updateDoc(doc(db, "veiculos", docItem.id), {
      principal: false
    });
  }
}

async function tornarPrincipal(veiculoId) {
  try {
    await removerPrincipalDosOutros();

    await updateDoc(doc(db, "veiculos", veiculoId), {
      principal: true,
      ativo: true,
      atualizadoEm: serverTimestamp()
    });

    mensagem.textContent = "Veículo principal atualizado.";
    await carregarVeiculos();
  } catch (erro) {
    mensagem.textContent = "Erro ao definir principal: " + erro.message;
  }
}

async function alterarStatusVeiculo(veiculoId, novoStatus) {
  try {
    await updateDoc(doc(db, "veiculos", veiculoId), {
      ativo: novoStatus,
      atualizadoEm: serverTimestamp()
    });

    mensagem.textContent = "Status do veículo atualizado.";
    await carregarVeiculos();
  } catch (erro) {
    mensagem.textContent = "Erro ao alterar status: " + erro.message;
  }
}
