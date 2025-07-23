// script.js

const ERROS_URL = 'data/erros.json';
const INTERVALO_ATUALIZACAO = 5 * 60 * 1000; // 5 minutos

let erros = [];
let errosFiltrados = [];

const listaErrosEl = document.getElementById('lista-erros');
// Removido: const modalEl, detalheErroEl, fecharModalEl

// Busca os erros do JSON
async function buscarErros() {
  try {
    const resp = await fetch(ERROS_URL + '?_=' + Date.now()); // cache bust
    erros = await resp.json();
    errosFiltrados = erros;
    desenharListaErros();
    desenharGraficos();
  } catch (e) {
    listaErrosEl.innerHTML = '<div style="color:#ef4444">Erro ao carregar dados.</div>';
  }
}

// Renderiza a lista de erros
function desenharListaErros() {
  if (!errosFiltrados.length) {
    listaErrosEl.innerHTML = '<div style="color:#fbbf24">Nenhum erro encontrado.</div>';
    return;
  }
  listaErrosEl.innerHTML = errosFiltrados.map(erro => {
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
}

// Formata data/hora para exibição
function formatarData(dataStr) {
  const d = new Date(dataStr);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// Abre modal com detalhes do erro
window.abrirModalDetalhe = function(id) {
  const erro = erros.find(e => e.id === id);
  if (!erro) return;
  // Removido: detalheErroEl.innerHTML = ...
  // Removido: modalEl.hidden = false; modalEl.focus();
}

// Removido: fecharModalEl.onclick = () => { modalEl.hidden = true; };
// Removido: window.addEventListener('keydown', e => { if (!modalEl.hidden && e.key === 'Escape') modalEl.hidden = true; });

// Atualização periódica
setInterval(buscarErros, INTERVALO_ATUALIZACAO);

// Gráficos ECharts (placeholders)
function desenharGraficos() {
  // Erros por workflow
  const porWorkflow = {};
  erros.forEach(e => {
    porWorkflow[e.workflow] = (porWorkflow[e.workflow] || 0) + 1;
  });
  const chart1 = echarts.init(document.getElementById('grafico-erros-workflow'));
  chart1.setOption({
    title: { text: 'Erros por Workflow', left: 'center', textStyle: { color: '#f3f4f6' } },
    tooltip: {},
    xAxis: { type: 'category', data: Object.keys(porWorkflow), axisLabel: { color: '#f3f4f6' } },
    yAxis: { type: 'value', axisLabel: { color: '#f3f4f6' } },
    series: [{
      data: Object.values(porWorkflow),
      type: 'bar',
      itemStyle: { color: '#38bdf8' }
    }],
    backgroundColor: '#1a1f2b'
  });

  // Erros por severidade
  const porSeveridade = { critical: 0, warning: 0, info: 0 };
  erros.forEach(e => {
    const s = (e.severity || 'info').toLowerCase();
    porSeveridade[s] = (porSeveridade[s] || 0) + 1;
  });
  const chart2 = echarts.init(document.getElementById('grafico-erros-severidade'));
  chart2.setOption({
    title: { text: 'Erros por Severidade', left: 'center', textStyle: { color: '#f3f4f6' } },
    tooltip: {},
    legend: { data: ['Erros'], textStyle: { color: '#f3f4f6' } },
    xAxis: { type: 'category', data: Object.keys(porSeveridade), axisLabel: { color: '#f3f4f6' } },
    yAxis: { type: 'value', axisLabel: { color: '#f3f4f6' } },
    series: [{
      data: Object.values(porSeveridade),
      type: 'bar',
      itemStyle: {
        color: function(params) {
          if (params.name === 'critical') return '#ef4444';
          if (params.name === 'warning') return '#fbbf24';
          return '#38bdf8';
        }
      }
    }],
    backgroundColor: '#1a1f2b'
  });
}

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

// Inicialização
buscarErros(); 