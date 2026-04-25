const API_ESTADOS = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";
const API_MUNICIPIOS = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";

export async function carregarEstados(selectEstadoId) {
  const selectEstado = document.getElementById(selectEstadoId);

  if (!selectEstado) return;

  selectEstado.innerHTML = `<option value="">Carregando estados...</option>`;

  try {
    const resposta = await fetch(`${API_ESTADOS}?orderBy=nome`);
    const estados = await resposta.json();

    selectEstado.innerHTML = `<option value="">Selecione o estado</option>`;

    estados.forEach((estado) => {
      const option = document.createElement("option");
      option.value = estado.sigla;
      option.textContent = estado.nome;
      selectEstado.appendChild(option);
    });
  } catch (erro) {
    selectEstado.innerHTML = `<option value="">Erro ao carregar estados</option>`;
  }
}

export async function carregarCidades(estadoSigla, selectCidadeId, cidadeSelecionada = "") {
  const selectCidade = document.getElementById(selectCidadeId);

  if (!selectCidade) return;

  if (!estadoSigla) {
    selectCidade.innerHTML = `<option value="">Selecione primeiro o estado</option>`;
    selectCidade.disabled = true;
    return;
  }

  selectCidade.disabled = true;
  selectCidade.innerHTML = `<option value="">Carregando cidades...</option>`;

  try {
    const resposta = await fetch(`${API_MUNICIPIOS}/${estadoSigla}/municipios?orderBy=nome`);
    const cidades = await resposta.json();

    selectCidade.innerHTML = `<option value="">Selecione a cidade</option>`;

    cidades.forEach((cidade) => {
      const option = document.createElement("option");
      option.value = cidade.nome;
      option.textContent = cidade.nome;

      if (cidadeSelecionada && cidadeSelecionada === cidade.nome) {
        option.selected = true;
      }

      selectCidade.appendChild(option);
    });

    selectCidade.disabled = false;
  } catch (erro) {
    selectCidade.innerHTML = `<option value="">Erro ao carregar cidades</option>`;
    selectCidade.disabled = true;
  }
}

export function configurarEstadoCidade(selectEstadoId, selectCidadeId) {
  const selectEstado = document.getElementById(selectEstadoId);

  if (!selectEstado) return;

  carregarEstados(selectEstadoId);

  selectEstado.addEventListener("change", () => {
    carregarCidades(selectEstado.value, selectCidadeId);
  });
}
