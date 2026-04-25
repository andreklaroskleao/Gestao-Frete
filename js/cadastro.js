import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const form = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const tipo = document.getElementById("tipo").value;

  if (!tipo) {
    mensagem.textContent = "Selecione o tipo de conta.";
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
      tipo,
      criadoEm: serverTimestamp()
    });

    if (tipo === "motorista") {
      await setDoc(doc(db, "motoristas", user.uid), {
        userId: user.uid,
        cidadeAtual: "",
        estadoAtual: "",
        disponivel: false,
        tipoCaminhao: "",
        carroceria: "",
        capacidade: "",
        placa: "",
        whatsapp: telefone,
        atualizadoEm: serverTimestamp()
      });
    }

    mensagem.textContent = "Conta criada com sucesso!";

    setTimeout(() => {
      if (tipo === "gestor") {
        window.location.href = "gestor.html";
      } else {
        window.location.href = "veiculo.html";
      }
    }, 800);
  } catch (erro) {
    mensagem.textContent = "Erro ao cadastrar: " + erro.message;
  }
});
