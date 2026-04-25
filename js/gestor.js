import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const btnSair = document.getElementById("btnSair");
const listaFretes = document.getElementById("listaFretes");

let usuarioAtual = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  usuarioAtual = user;
  carregarFretes();
});

btnSair.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

async function carregarFretes() {
  listaFretes.innerHTML = "<p>Carregando fretes...</p>";

  try {
    const q = query(
      collection(db, "fretes"),
      where("gestorId", "==", usuarioAtual.uid),
      orderBy("criadoEm", "desc")
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      listaFretes.innerHTML = "<p>Nenhum frete cadastrado ainda.</p>";
      return;
    }

    listaFretes.innerHTML = "";

    snap.forEach((docItem) => {
      const frete = docItem.data();
      const id = docItem.id;

      const card = document.createElement("div");
      card.className = "frete-card";

      card.innerHTML = `
        <h3>${frete.origemCidade}/${frete.origemEstado} → ${frete.destinoCidade}/${frete.destinoEstado}</h3>
        <p><strong>Carga:</strong> ${frete.carga}</p>
        <p><strong>Peso:</strong> ${frete.peso}</p>
        <p><strong>Valor:</strong> R$ ${Number(frete.valor).toFixed(2)}</p>
        <p><strong>Status:</strong> ${frete.status}</p>
        <a class="btn primary" href="frete.html?id=${id}">Ver detalhes</a>
      `;

      listaFretes.appendChild(card);
    });
  } catch (erro) {
    listaFretes.innerHTML = "<p>Erro ao carregar fretes: " + erro.message + "</p>";
  }
}
