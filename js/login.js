import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

const form = document.getElementById("formLogin");
const mensagem = document.getElementById("mensagem");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value;

  mensagem.textContent = "Entrando...";

  try {
    const credencial = await signInWithEmailAndPassword(auth, email, senha);
    const user = credencial.user;

    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      mensagem.textContent = "Usuário não encontrado no banco.";
      return;
    }

    const dados = snap.data();

    if (dados.tipo === "gestor") {
      window.location.href = "gestor.html";
    } else {
      window.location.href = "motorista.html";
    }
  } catch (erro) {
    mensagem.textContent = "Erro ao entrar: " + erro.message;
  }
});
