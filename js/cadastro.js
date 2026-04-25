import { auth, db } from "./firebase.js";
import { configurarEstadoCidade } from "./ibge.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

configurarEstadoCidade("estadoAtual", "cidadeAtual");

const form = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagem");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;
    const estadoAtual = document.getElementById("estadoAtual").value;
    const cidadeAtual = document.getElementById("cidadeAtual").value;

    if (!estadoAtual || !cidadeAtual) {
      mensagem.textContent = "Selecione estado e cidade.";
      return;
    }

    mensagem.textContent = "Criando conta...";

    try {
      const credencial = await createUserWithEmailAndPassword(auth, email, senha);
      const user = credencial.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        telefone,
        email,
        tipo: "motorista",
        criadoEm: serverTimestamp()
      });

      await setDoc(doc(db, "motoristas", user.uid), {
        userId: user.uid,
        cidadeAtual,
        estadoAtual,
        disponivel: false,
        tipoCaminhao: "",
        carroceria: "",
        capacidade: "",
        placa: "",
        whatsapp: telefone,
        atualizadoEm: serverTimestamp()
      });

      mensagem.textContent = "Conta criada com sucesso!";

      setTimeout(() => {
        window.location.href = "veiculo.html";
      }, 800);
    } catch (erro) {
      mensagem.textContent = "Erro ao cadastrar: " + erro.message;
    }
  });
}
