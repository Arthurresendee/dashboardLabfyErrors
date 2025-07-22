// script.js

const ERROS_URL = 'data/erros.json';
const INTERVALO_ATUALIZACAO = 5 * 60 * 1000; // 5 minutos

let erros = [];
let errosFiltrados = [];
let quantidadeItens = 10;

const listaErrosEl = document.getElementById('lista-erros');
const filtroWorkflowEl = document.getElementById('filtro-workflow');
const filtroNodeEl = document.getElementById('filtro-node');
const filtroSeveridadeEl = document.getElementById('filtro-severidade');
const filtroQuantidadeEl = document.getElementById('filtro-quantidade');
const modalEl = document.getElementById('modal-detalhe');
const detalheErroEl = document.getElementById('detalhe-erro');
const fecharModalEl = document.getElementById('fechar-modal');

// Busca os erros do JSON
async function buscarErros() {
  try {
    const resp = await fetch(ERROS_URL + '?_=' + Date.now()); // cache bust
    erros = await resp.json();
    aplicarFiltros();
    popularFiltros();
    desenharGraficos();
  } catch (e) {
    listaErrosEl.innerHTML = '<div style="color:#ef4444">Erro ao carregar dados.</div>';
  }
}

// Popula os filtros com valores únicos
function popularFiltros() {
  const workflows = [...new Set(erros.map(e => e.workflow))];
  const nodes = [...new Set(erros.map(e => e.node))];

  filtroWorkflowEl.innerHTML = '<option value="">Todos Workflows</option>' +
    workflows.map(w => `<option value="${w}">${w}</option>`).join('');
  filtroNodeEl.innerHTML = '<option value="">Todos Nodes</option>' +
    nodes.map(n => `<option value="${n}">${n}</option>`).join('');
}

// Aplica os filtros selecionados
function aplicarFiltros() {
  const workflow = filtroWorkflowEl.value;
  const node = filtroNodeEl.value;
  const severidade = filtroSeveridadeEl.value;
  errosFiltrados = erros.filter(e =>
    (!workflow || e.workflow === workflow) &&
    (!node || e.node === node) &&
    (!severidade || e.severity === severidade)
  );
  desenharListaErros();
}

// Renderiza a lista de erros
function desenharListaErros() {
  if (!errosFiltrados.length) {
    listaErrosEl.innerHTML = '<div style="color:#fbbf24">Nenhum erro encontrado.</div>';
    return;
  }
  const errosParaExibir = errosFiltrados.slice(0, quantidadeItens);
  listaErrosEl.innerHTML = errosParaExibir.map(erro => `
    <div class="card-erro" data-severity="${erro.severity || 'info'}" tabindex="0" aria-label="Ver detalhes do erro" role="button"
      onclick="abrirModalDetalhe('${erro.id}')" onkeydown="if(event.key==='Enter'){abrirModalDetalhe('${erro.id}')}" >
      <div class="icone-severidade"></div>
      <div class="card-erro-conteudo">
        <div class="card-erro-linha1">
          <span class="workflow-nome">${erro.workflow}</span>
          <span class="node-nome">${erro.node}</span>
          <span class="erro-data">${formatarData(erro.error_timestamp)}</span>
        </div>
        <div class="card-erro-linha2">
          <span class="erro-message">${erro.error_message}</span>
          <span class="badge-severidade">${erro.severity ? erro.severity.toUpperCase() : 'INFO'}</span>
          <span class="badge-tempo">${tempoAtras(erro.error_timestamp)}</span>
        </div>
      </div>
    </div>
  `).join('');
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
  detalheErroEl.innerHTML = `
    <h3 style="margin-bottom:1rem;">${erro.workflow} &rarr; <span style='color:#38bdf8'>${erro.node}</span></h3>
    <div><b>Mensagem:</b> ${erro.error_message}</div>
    <div><b>Severidade:</b> ${erro.severity ? erro.severity.toUpperCase() : 'INFO'}</div>
    <div><b>Data/Hora:</b> ${formatarData(erro.error_timestamp)}</div>
    <div><b>Tipo:</b> ${erro.error_type || '-'}</div>
    <div><b>Stack Trace:</b><br><pre style='white-space:pre-wrap;background:#181c24;color:#fbbf24;padding:0.7rem;border-radius:0.5rem;'>${erro.stack_trace || '-'}</pre></div>
    <div><b>Sugestão de Correção:</b> ${erro.suggested_fix || '-'}</div>
    <div style='margin-top:1rem;'><b>Dados completos:</b><br><pre style='white-space:pre-wrap;background:#232837;color:#a0aec0;padding:0.7rem;border-radius:0.5rem;'>${JSON.stringify(erro.full_error_data, null, 2)}</pre></div>
  `;
  modalEl.hidden = false;
  modalEl.focus();
}

// Fecha o modal
fecharModalEl.onclick = () => { modalEl.hidden = true; };
window.addEventListener('keydown', e => {
  if (!modalEl.hidden && e.key === 'Escape') modalEl.hidden = true;
});

// Eventos dos filtros
filtroWorkflowEl.onchange = aplicarFiltros;
filtroNodeEl.onchange = aplicarFiltros;
filtroSeveridadeEl.onchange = aplicarFiltros;
filtroQuantidadeEl.onchange = () => {
  quantidadeItens = parseInt(filtroQuantidadeEl.value, 10);
  aplicarFiltros();
};

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