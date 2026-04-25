import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const form = document.getElementById("formCadastro");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;
  const tipo = document.getElementById("tipo").value;

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

    if (tipo === "gestor") {
      window.location.href = "gestor.html";
    } else {
      window.location.href = "motorista.html";
    }
  } catch (erro) {
    mensagem.textContent = "Erro ao cadastrar: " + erro.message;
  }
});
