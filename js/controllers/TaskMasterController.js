// js/controllers/TaskMasterController.js
import { GerenciadorTarefas } from '../models/GerenciadorTarefas.js';

export class TaskMasterController {
    constructor() {
        this.gerenciador = new GerenciadorTarefas();
        this.sortDirection = true; // direção inicial da ordenação
        this.inicializar();
    }

    inicializar() {
        this.renderizarTarefas();
        this.renderizarEstatisticas();
        this.configurarEventos();

        if (this.gerenciador.tarefas.length === 0) {
            this.carregarDadosDemonstracao();
        }
    }

    configurarEventos() {
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarTarefa();
        });

        document.getElementById('searchTask').addEventListener('input', (e) => {
            this.buscarTarefas(e.target.value);
        });

        document.getElementById('filterPriority').addEventListener('change', (e) => {
            this.filtrarTarefas('prioridade', e.target.value);
        });

        const btnLimpar = document.getElementById('btnLimparTarefas');
        if (btnLimpar) {
            btnLimpar.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja remover todas as tarefas?')) {
                    this.gerenciador.limparTarefas();
                    this.renderizarTarefas();
                    this.renderizarEstatisticas();
                }
            });
        }
    }

    adicionarTarefa() {
        const titulo = document.getElementById('taskTitle').value.trim();
        const descricao = document.getElementById('taskDescription').value.trim();
        const prioridade = document.getElementById('taskPriority').value;
        const prazo = document.getElementById('taskDueDate').value;

        if (!titulo) {
            alert('O título da tarefa é obrigatório!');
            return;
        }

        // Extração de tags (palavras iniciadas por #)
        const tagRegex = /#(\w+)/g;
        const tituloTags = [...titulo.matchAll(tagRegex)].map(match => match[1]);
        const descricaoTags = [...descricao.matchAll(tagRegex)].map(match => match[1]);
        const tags = [...new Set([...tituloTags, ...descricaoTags])];

        this.gerenciador.adicionarTarefa(titulo, descricao, prioridade, prazo, tags);
        this.renderizarTarefas();
        this.renderizarEstatisticas();
        document.getElementById('taskForm').reset();
    }

    removerTarefa(id) {
        if (confirm('Tem certeza que deseja remover esta tarefa?')) {
            this.gerenciador.removerTarefa(id);
            this.renderizarTarefas();
            this.renderizarEstatisticas();
        }
    }

    alternarStatusTarefa(id) {
        const tarefa = this.gerenciador.obterTarefa(id);
        if (tarefa.concluida) {
            this.gerenciador.desmarcarConclusao(id);
        } else {
            this.gerenciador.marcarComoConcluida(id);
        }
        this.renderizarTarefas();
        this.renderizarEstatisticas();
    }

    editarTarefa(id) {
        const tarefa = this.gerenciador.obterTarefa(id);
        if (!tarefa) return;

        const novoTitulo = prompt('Novo título:', tarefa.titulo);
        if (novoTitulo === null) return;
        const novaDescricao = prompt('Nova descrição:', tarefa.descricao);
        if (novaDescricao === null) return;
        const novaPrioridade = prompt('Nova prioridade (baixa, média, alta):', tarefa.prioridade);
        if (novaPrioridade === null) return;

        tarefa.atualizarDados({
            titulo: novoTitulo.trim(),
            descricao: novaDescricao.trim(),
            prioridade: novaPrioridade.toLowerCase()
        });

        this.gerenciador.salvarTarefas();
        this.renderizarTarefas();
    }

    buscarTarefas(termo) {
        const tarefas = this.gerenciador.buscarPorTitulo(termo);
        this.renderizarTarefasEspecificas(tarefas);
    }

    filtrarTarefas(tipo, valor) {
        let tarefas;
        switch (tipo) {
            case 'prioridade':
                tarefas = this.gerenciador.filtrarPorPrioridade(valor);
                break;
            case 'status':
                tarefas = this.gerenciador.filtrarPorStatus(valor);
                break;
            case 'tag':
                tarefas = this.gerenciador.filtrarPorTags([valor]);
                break;
            default:
                tarefas = this.gerenciador.tarefas;
        }
        this.renderizarTarefasEspecificas(tarefas);
    }

    ordenarTarefas(campo) {
        this.sortDirection = !this.sortDirection;
        const tarefasOrdenadas = this.gerenciador.ordenarPor(campo, this.sortDirection);
        this.renderizarTarefasEspecificas(tarefasOrdenadas);
    }

    renderizarTarefas() {
        this.renderizarTarefasEspecificas(this.gerenciador.tarefas);
    }

    renderizarTarefasEspecificas(tarefas) {
        const container = document.getElementById('taskContainer');
        container.innerHTML = '';

        if (tarefas.length === 0) {
            container.innerHTML = '<p class="no-tasks">Nenhuma tarefa encontrada</p>';
            return;
        }

        tarefas.forEach(tarefa => {
            const card = this.criarTaskCard(tarefa);
            container.appendChild(card);
        });
    }

    criarTaskCard(tarefa) {
        // Cria o cartão da tarefa (pode ser substituído pelo uso de um Web Component)
        const card = document.createElement('div');
        card.className = `task-card ${tarefa.concluida ? 'task-complete' : ''} ${tarefa.estaAtrasada() ? 'task-overdue' : ''}`;
        card.dataset.id = tarefa.id;

        const diasRestantes = tarefa.diasRestantes();
        const prazoFormatado = tarefa.prazo ? this.formatarData(tarefa.prazo) : 'Sem prazo';
        let prazoTexto = `Prazo: ${prazoFormatado}`;
        if (diasRestantes !== null) {
            if (diasRestantes < 0) {
                prazoTexto += ` (${Math.abs(diasRestantes)} dias atrasada)`;
            } else if (diasRestantes === 0) {
                prazoTexto += ' (Vence hoje)';
            } else {
                prazoTexto += ` (${diasRestantes} dias restantes)`;
            }
        }

        const tagsHtml = tarefa.tags.length > 0
            ? `<div class="task-tags">${tarefa.tags.map(tag =>
                `<span class="tag" onclick="window.taskMaster.filtrarTarefas('tag', '${tag}')">#${tag}</span>`
            ).join(' ')}</div>`
            : '';

        card.innerHTML = `
      <div class="task-header">
        <h3>${tarefa.titulo}</h3>
        <span class="priority ${tarefa.prioridade}">${tarefa.prioridade}</span>
      </div>
      <div class="task-body">
        <p>${tarefa.descricao || 'Sem descrição'}</p>
        ${tagsHtml}
      </div>
      <div class="task-footer">
        <span class="due-date">${prazoTexto}</span>
        <div class="task-actions">
          <button class="btn-toggle" onclick="window.taskMaster.alternarStatusTarefa(${tarefa.id})">
            ${tarefa.concluida ? 'Reabrir' : 'Concluir'}
          </button>
          <button class="btn-edit" onclick="window.taskMaster.editarTarefa(${tarefa.id})">Editar</button>
          <button class="btn-delete" onclick="window.taskMaster.removerTarefa(${tarefa.id})">Excluir</button>
        </div>
      </div>
    `;

        return card;
    }

    renderizarEstatisticas() {
        const stats = this.gerenciador.calcularEstatisticas();
        const container = document.getElementById('statsContainer');
        if (!container) return;

        container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total</h3>
          <p>${stats.total} tarefas</p>
        </div>
        <div class="stat-card">
          <h3>Concluídas</h3>
          <p>${stats.concluidas} (${stats.percentualConcluido}%)</p>
        </div>
        <div class="stat-card">
          <h3>Pendentes</h3>
          <p>${stats.pendentes}</p>
        </div>
        <div class="stat-card">
          <h3>Atrasadas</h3>
          <p>${stats.atrasadas}</p>
        </div>
      </div>
      <div class="stats-detail">
        <div class="stats-priorities">
          <h3>Por Prioridade</h3>
          <ul>
            <li>Alta: ${stats.prioridades.alta}</li>
            <li>Média: ${stats.prioridades.média}</li>
            <li>Baixa: ${stats.prioridades.baixa}</li>
          </ul>
        </div>
        <div class="stats-tags">
          <h3>Tags Populares</h3>
          <div class="tag-cloud">
            ${Object.entries(stats.tags)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tag, count]) =>
                    `<span class="tag" onclick="window.taskMaster.filtrarTarefas('tag', '${tag}')">#${tag} (${count})</span>`
                ).join(' ') || 'Nenhuma tag encontrada'
            }
          </div>
        </div>
      </div>
    `;
    }

    carregarDadosDemonstracao() {
        const hoje = new Date();
        const amanha = new Date();
        amanha.setDate(hoje.getDate() + 1);
        const proximaSemana = new Date();
        proximaSemana.setDate(hoje.getDate() + 7);
        const ontem = new Date();
        ontem.setDate(hoje.getDate() - 1);

        this.gerenciador.adicionarTarefa(
            "Aprender JavaScript",
            "Estudar variáveis, funções e arrays",
            "alta",
            proximaSemana.toISOString().split('T')[0],
            ["estudo", "javascript"]
        );

        this.gerenciador.adicionarTarefa(
            "Criar projeto TaskMaster",
            "Implementar HTML, CSS e JavaScript",
            "média",
            amanha.toISOString().split('T')[0],
            ["projeto", "desafio"]
        );

        this.gerenciador.adicionarTarefa(
            "Revisar conceitos de DOM",
            "Manipulação de elementos e eventos",
            "baixa",
            null,
            ["estudo", "dom"]
        );

        const tarefaAtrasada = this.gerenciador.adicionarTarefa(
            "Entregar relatório",
            "Relatório de progresso semanal",
            "alta",
            ontem.toISOString().split('T')[0],
            ["trabalho", "relatório"]
        );

        this.gerenciador.marcarComoConcluida(tarefaAtrasada.id);
        this.renderizarTarefas();
        this.renderizarEstatisticas();
    }

    formatarData(data) {
        if (!data) return 'Sem prazo';
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
}
