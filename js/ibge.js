const API_ESTADOS = "https://servicodados.ibge.gov.br/api/v1/localidades/estados";

const ESTADOS_FALLBACK = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" }
];

export async function carregarEstados(selectEstadoId) {
  const selectEstado = document.getElementById(selectEstadoId);

  if (!selectEstado) return;

  selectEstado.innerHTML = '<option value="">Carregando estados...</option>';

  try {
    const resposta = await fetch(`${API_ESTADOS}?orderBy=nome`);

    if (!resposta.ok) {
      throw new Error("Erro ao acessar API do IBGE");
    }

    const estados = await resposta.json();
    preencherEstados(selectEstado, estados);
  } catch (erro) {
    console.error("Erro IBGE estados:", erro);
    preencherEstados(selectEstado, ESTADOS_FALLBACK);
  }
}

function preencherEstados(selectEstado, estados) {
  selectEstado.innerHTML = '<option value="">Selecione o estado</option>';

  estados.forEach((estado) => {
    const option = document.createElement("option");
    option.value = estado.sigla;
    option.textContent = estado.nome;
    selectEstado.appendChild(option);
  });
}

export async function carregarCidades(estadoSigla, selectCidadeId, cidadeSelecionada = "") {
  const selectCidade = document.getElementById(selectCidadeId);

  if (!selectCidade) return;

  if (!estadoSigla) {
    selectCidade.innerHTML = '<option value="">Selecione primeiro o estado</option>';
    selectCidade.disabled = true;
    return;
  }

  selectCidade.disabled = true;
  selectCidade.innerHTML = '<option value="">Carregando cidades...</option>';

  try {
    const resposta = await fetch(`${API_ESTADOS}/${estadoSigla}/municipios?orderBy=nome`);

    if (!resposta.ok) {
      throw new Error("Erro ao carregar cidades");
    }

    const cidades = await resposta.json();

    selectCidade.innerHTML = '<option value="">Selecione a cidade</option>';

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
    console.error("Erro IBGE cidades:", erro);
    selectCidade.innerHTML = '<option value="">Erro ao carregar cidades</option>';
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
