# Preferências e Decisões do Projeto - Dashboard de Erros n8n

## Objetivo
Dashboard web moderno para monitorar e visualizar erros do n8n, consumindo dados armazenados no Supabase.

## Tecnologias e Stack
- **Frontend:** HTML5, CSS3 puro (sem Tailwind), JavaScript puro
- **Biblioteca de gráficos:** ECharts
- **Dados:** JSON estático (mock), atualizado periodicamente via fluxo do n8n
- **Layout:**
  - Visual moderno, escuro (dark mode), inspirado em dashboards premium
  - Lista de erros em destaque na parte superior
  - Dashboards/gráficos na parte inferior
  - Página única (SPA simples)
  - Responsivo para TV de 55 polegadas (fullscreen, sem autenticação)

## Funcionalidades Iniciais
- Lista de erros (workflow, node, hora, severidade) com filtro básico
- Detalhe do erro ao clicar em cada item
- Gráficos (ECharts) para visualização de erros por workflow, severidade, etc. (abaixo da lista)
- Atualização automática dos dados a cada 5 minutos (fetch do JSON)
- Sem exportação CSV, sem autenticação, sem dados sensíveis

## Fluxo de Dados
- O dashboard buscará um arquivo JSON estático hospedado (ex: `/data/erros.json`)
- O n8n será responsável por atualizar esse arquivo periodicamente (ex: a cada 5 minutos)
- O dashboard fará fetch desse JSON e atualizará a interface automaticamente

## Design/UI
- Visual escuro, cards, tipografia clara
- Inspiração: dashboard enviado na imagem (cards, gráficos, layout limpo)
- Sem Tailwind, apenas CSS puro
- Fullscreen, sem scroll vertical sempre que possível
- Branding/título customizável

## Outras Observações
- O dashboard ficará visível em uma TV na sala de desenvolvimento
- Não há necessidade de autenticação ou controle de acesso
- Não serão exibidos dados sensíveis
- Notificações e exportação podem ser implementados futuramente

---

**Este arquivo deve ser atualizado sempre que novas decisões forem tomadas no projeto.** 