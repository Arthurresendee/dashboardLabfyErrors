// script.js

// Caminho do arquivo de erros (mock ou real)
const ERROS_URL = 'data/erros.json';
// Intervalo para atualizar os dados automaticamente (5 minutos)
const INTERVALO_ATUALIZACAO = 5 * 60 * 1000;

// Aqui ficam todos os erros carregados do JSON
let erros = [];
// Aqui ficam os erros filtrados (no futuro pode filtrar por workflow, etc)
let errosFiltrados = [];

// Pega o elemento da lista de erros na tela
const listaErrosEl = document.getElementById('lista-erros');

// Função principal: busca os erros do JSON e atualiza a tela
// Chama isso ao carregar a página e a cada 5 minutos
async function buscarErros() {
  try {
    // Faz o fetch do arquivo JSON (com cache bust pra não pegar cache antigo)
    const resp = await fetch(ERROS_URL + '?_=' + Date.now());
    erros = await resp.json();
    errosFiltrados = erros; // Aqui pode filtrar se quiser no futuro
    desenharListaErros(); // Atualiza a lista na tela
  } catch (e) {
    // Se der erro no fetch, mostra mensagem de erro
    listaErrosEl.innerHTML = '<div style="color:#ef4444">Erro ao carregar dados.</div>';
  }
}

// Atualiza os cards de indicadores premium (total de erros, workflows, top 3)
function atualizarIndicadores() {
  // Conta o total de erros (simples: só o tamanho do array)
  const totalErros = errosFiltrados.length;
  document.getElementById('valor-total-erros').textContent = totalErros;

  // Conta o total de workflows únicos (Set elimina duplicados)
  const workflowsUnicos = [...new Set(errosFiltrados.map(e => e.workflow))];
  document.getElementById('valor-total-workflows').textContent = workflowsUnicos.length;

  // Top 3 workflows com mais erros (conta quantos erros tem cada workflow)
  const contagem = {};
  errosFiltrados.forEach(e => {
    contagem[e.workflow] = (contagem[e.workflow] || 0) + 1;
  });
  // Ordena do maior pro menor e pega só os 3 primeiros
  const top3 = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  // Atualiza a lista no card
  const topList = document.getElementById('valor-top-workflows');
  topList.innerHTML = top3.map(([workflow, count]) => `<li>${workflow} <span style='color:#a0aec0;font-weight:400'>(${count})</span></li>`).join('');
}

// Renderiza a lista de erros na tela (um card para cada erro)
// Aqui é onde monta o HTML de cada card
function desenharListaErros() {
  if (!errosFiltrados.length) {
    listaErrosEl.innerHTML = '<div style="color:#fbbf24">Nenhum erro encontrado.</div>';
    atualizarIndicadores();
    return;
  }
  // Para cada erro, monta um card bonitão
  listaErrosEl.innerHTML = errosFiltrados.map(erro => {
    // Se não vier severidade, assume critical (padrão do projeto)
    const severidade = erro.severity ? erro.severity : 'critical';
    return `
    <div class="card-erro" data-severity="${severidade}">
      <div class="icone-severidade"></div>
      <div class="card-erro-conteudo">
        <div class="card-erro-linha1">
          <span class="workflow-nome">${erro.workflow}</span>
          <span class="node-nome">${erro.node}</span>
          ${erro.last_execution_node ? `<span class='last-execution-node'>(Last node: ${erro.last_execution_node})</span>` : ''}
          <span class="erro-data">${formatarData(erro.error_timestamp)}</span>
        </div>
        <div class="card-erro-linha2">
          <span class="erro-message">${erro.error_message}</span>
          <span class="badge-severidade">${severidade.toUpperCase()}</span>
          <span class="badge-tempo">${tempoAtras(erro.error_timestamp)}</span>
        </div>
        <div class="card-erro-detalhes">
          <span><b>Tipo:</b> ${erro.error_type || '-'}</span> |
          <span><b>Execution ID:</b> ${erro.execution_id || '-'}</span> |
          <span><b>Execution Mode:</b> ${erro.execution_mode || '-'}</span>
        </div>
        <div class="card-erro-stack">
          <b>Stack trace:</b> <span>${erro.stack_trace ? erro.stack_trace.split('\n')[0] + ' ...' : '-'}</span>
        </div>
        ${erro.suggested_fix ? `<div class="card-erro-fix"><b>Sugestão:</b> ${erro.suggested_fix}</div>` : ''}
      </div>
    </div>
    `;
  }).join('');
  atualizarIndicadores();
}

// Formata a data/hora para exibir no padrão brasileiro
// Exemplo: 22/07/2025, 14:19
function formatarData(dataStr) {
  const d = new Date(dataStr);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// Calcula quanto tempo faz desde o erro (ex: "10 min atrás", "2h atrás")
function tempoAtras(dataStr) {
  const agora = new Date();
  const data = new Date(dataStr);
  const diffMs = agora - data;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `${diffMin} min atrás`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h atrás`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d atrás`;
}

// Botão de fullscreen para TV
// Quando clica, entra ou sai do modo tela cheia
const btnFullscreen = document.getElementById('btn-fullscreen');
if (btnFullscreen) {
  btnFullscreen.onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      btnFullscreen.setAttribute('aria-label', 'Sair do modo tela cheia');
      btnFullscreen.title = 'Sair do modo tela cheia';
      btnFullscreen.textContent = '⨉';
    } else {
      document.exitFullscreen();
      btnFullscreen.setAttribute('aria-label', 'Entrar em tela cheia');
      btnFullscreen.title = 'Tela cheia';
      btnFullscreen.textContent = '⛶';
    }
  };
  // Atualiza o ícone/texto do botão quando muda o estado do fullscreen
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      btnFullscreen.setAttribute('aria-label', 'Entrar em tela cheia');
      btnFullscreen.title = 'Tela cheia';
      btnFullscreen.textContent = '⛶';
    } else {
      btnFullscreen.setAttribute('aria-label', 'Sair do modo tela cheia');
      btnFullscreen.title = 'Sair do modo tela cheia';
      btnFullscreen.textContent = '⨉';
    }
  });
}

// Inicialização: busca os erros ao carregar a página e atualiza periodicamente
// Se quiser mudar o tempo, altere INTERVALO_ATUALIZACAO lá em cima
buscarErros();
setInterval(buscarErros, INTERVALO_ATUALIZACAO); 