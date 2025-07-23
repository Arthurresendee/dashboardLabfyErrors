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
    // desenharGraficos(); // Comentado para desabilitar os gráficos
  } catch (e) {
    listaErrosEl.innerHTML = '<div style="color:#ef4444">Erro ao carregar dados.</div>';
  }
}

function atualizarIndicadores() {
  // Total de erros
  const totalErros = errosFiltrados.length;
  document.getElementById('valor-total-erros').textContent = totalErros;

  // Total de workflows
  const workflowsUnicos = [...new Set(errosFiltrados.map(e => e.workflow))];
  document.getElementById('valor-total-workflows').textContent = workflowsUnicos.length;

  // Top 3 workflows
  const contagem = {};
  errosFiltrados.forEach(e => {
    contagem[e.workflow] = (contagem[e.workflow] || 0) + 1;
  });
  const top3 = Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const topList = document.getElementById('valor-top-workflows');
  topList.innerHTML = top3.map(([workflow, count]) => `<li>${workflow} <span style='color:#a0aec0;font-weight:400'>(${count})</span></li>`).join('');
}

// Renderiza a lista de erros
function desenharListaErros() {
  if (!errosFiltrados.length) {
    listaErrosEl.innerHTML = '<div style="color:#fbbf24">Nenhum erro encontrado.</div>';
    atualizarIndicadores();
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
  atualizarIndicadores();
  // desenharGraficos();
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

// Atualização periódica
setInterval(buscarErros, INTERVALO_ATUALIZACAO);

// Gráficos ECharts (placeholders)
// function desenharGraficos() {
//   // Erros por workflow
//   const porWorkflow = {};
//   erros.forEach(e => {
//     porWorkflow[e.workflow] = (porWorkflow[e.workflow] || 0) + 1;
//   });
//   const chart1 = echarts.init(document.getElementById('grafico-erros-workflow'));
//   chart1.setOption({
//     title: { text: 'Erros por Workflow', left: 'center', top: 18, textStyle: { color: '#f3f4f6', fontSize: 22, fontWeight: 700, fontFamily: 'Segoe UI, Roboto, Arial' } },
//     tooltip: {
//       trigger: 'axis',
//       backgroundColor: '#232837ee',
//       borderRadius: 12,
//       borderWidth: 0,
//       textStyle: { color: '#f3f4f6', fontSize: 16 },
//       padding: 14
//     },
//     grid: { left: 40, right: 20, top: 60, bottom: 40 },
//     xAxis: { type: 'category', data: Object.keys(porWorkflow), axisLabel: { color: '#f3f4f6', fontWeight: 600, fontSize: 15 } },
//     yAxis: { type: 'value', axisLabel: { color: '#f3f4f6', fontWeight: 600, fontSize: 15 } },
//     series: [{
//       data: Object.values(porWorkflow),
//       type: 'bar',
//       showBackground: true,
//       backgroundStyle: { color: 'rgba(36,40,50,0.7)' },
//       itemStyle: {
//         borderRadius: [8, 8, 0, 0],
//         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//           { offset: 0, color: '#38bdf8' },
//           { offset: 1, color: '#232837' }
//         ])
//       },
//       emphasis: { itemStyle: { shadowBlur: 18, shadowColor: '#38bdf8' } },
//       animationDuration: 1200
//     }],
//     backgroundColor: 'rgba(24,28,36,0.95)'
//   });
//
//   // Erros por severidade
//   const porSeveridade = { critical: 0 };
//   erros.forEach(e => {
//     const s = (e.severity || 'critical').toLowerCase();
//     porSeveridade[s] = (porSeveridade[s] || 0) + 1;
//   });
//   const chart2 = echarts.init(document.getElementById('grafico-erros-severidade'));
//   chart2.setOption({
//     title: { text: 'Erros Críticos', left: 'center', top: 18, textStyle: { color: '#f3f4f6', fontSize: 22, fontWeight: 700, fontFamily: 'Segoe UI, Roboto, Arial' } },
//     tooltip: {
//       trigger: 'axis',
//       backgroundColor: '#232837ee',
//       borderRadius: 12,
//       borderWidth: 0,
//       textStyle: { color: '#f3f4f6', fontSize: 16 },
//       padding: 14
//     },
//     grid: { left: 40, right: 20, top: 60, bottom: 40 },
//     xAxis: { type: 'category', data: Object.keys(porSeveridade), axisLabel: { color: '#f3f4f6', fontWeight: 600, fontSize: 15 } },
//     yAxis: { type: 'value', axisLabel: { color: '#f3f4f6', fontWeight: 600, fontSize: 15 } },
//     series: [{
//       data: Object.values(porSeveridade),
//       type: 'bar',
//       showBackground: true,
//       backgroundStyle: { color: 'rgba(36,40,50,0.7)' },
//       itemStyle: {
//         borderRadius: [8, 8, 0, 0],
//         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//           { offset: 0, color: '#ef4444' },
//           { offset: 1, color: '#232837' }
//         ])
//       },
//       emphasis: { itemStyle: { shadowBlur: 18, shadowColor: '#ef4444' } },
//       animationDuration: 1200
//     }],
//     backgroundColor: 'rgba(24,28,36,0.95)'
//   });
// }

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

// Função de fullscreen
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