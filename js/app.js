/**
 * TaskMaster - Aplicação de Gerenciamento de Tarefas
 * Versão 1.0 - Final do Primeiro Semestre
 * 
 * Este arquivo contém a implementação do TaskMaster com todas as funcionalidades
 * aprendidas durante o primeiro semestre.
 * 
 * "Com grandes poderes vem grandes responsabilidades." - Tio Ben (Stan Lee/Marvel Comics)
 */

// ========================================
// MODELO DE DADOS
// ========================================

// Classe para representar uma tarefa
class Tarefa {
    constructor(titulo, descricao = "", prioridade = "média", prazo = null, tags = []) {
        this.id = Date.now() + Math.floor(Math.random() * 1000); // ID único
        this.titulo = titulo;
        this.descricao = descricao;
        this.prioridade = prioridade;
        this.prazo = prazo ? new Date(prazo) : null;
        this.concluida = false;
        this.tags = tags;
        this.criada = new Date();
        this.modificada = new Date();
    }

    // Métodos da tarefa
    marcarComoConcluida() {
        this.concluida = true;
        this.modificada = new Date();
    }

    desmarcarConclusao() {
        this.concluida = false;
        this.modificada = new Date();
    }

    atualizarDados(dados) {
        // Atualiza as propriedades da tarefa com os novos dados
        if (dados.titulo !== undefined) this.titulo = dados.titulo;
        if (dados.descricao !== undefined) this.descricao = dados.descricao;
        if (dados.prioridade !== undefined) this.prioridade = dados.prioridade;
        if (dados.prazo !== undefined) this.prazo = dados.prazo ? new Date(dados.prazo) : null;
        if (dados.tags !== undefined) this.tags = dados.tags;

        this.modificada = new Date();
    }

    estaAtrasada() {
        if (!this.prazo || this.concluida) return false;
        return new Date() > this.prazo;
    }

    diasRestantes() {
        if (!this.prazo) return null;
        if (this.concluida) return 0;

        const hoje = new Date();
        const diffTempo = this.prazo - hoje;
        const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        return diffDias;
    }
}

// Gerenciador de Tarefas
class GerenciadorTarefas {
    constructor() {
        this.tarefas = [];
        this.carregarTarefas();
    }

    // Métodos CRUD
    adicionarTarefa(titulo, descricao = "", prioridade = "média", prazo = null, tags = []) {
        const novaTarefa = new Tarefa(titulo, descricao, prioridade, prazo, tags);
        this.tarefas.push(novaTarefa);
        this.salvarTarefas();
        return novaTarefa;
    }

    obterTarefa(id) {
        return this.tarefas.find(tarefa => tarefa.id === id);
    }

    atualizarTarefa(id, dados) {
        const tarefa = this.obterTarefa(id);
        if (!tarefa) return false;

        tarefa.atualizarTarefa(dados);
        this.salvarTarefas();
        return tarefa;
    }

    removerTarefa(id) {
        const indice = this.tarefas.findIndex(tarefa => tarefa.id === id);
        if (indice === -1) return false;

        const tarefaRemovida = this.tarefas.splice(indice, 1)[0];
        this.salvarTarefas();
        return tarefaRemovida;
    }

    // Métodos para estado das tarefas
    marcarComoConcluida(id) {
        const tarefa = this.obterTarefa(id);
        if (!tarefa) return false;

        tarefa.marcarComoConcluida();
        this.salvarTarefas();
        return tarefa;
    }

    desmarcarConclusao(id) {
        const tarefa = this.obterTarefa(id);
        if (!tarefa) return false;

        tarefa.desmarcarConclusao();
        this.salvarTarefas();
        return tarefa;
    }

    // Métodos para busca e filtragem
    buscarPorTitulo(termo) {
        if (!termo) return this.tarefas;

        termo = termo.toLowerCase();
        return this.tarefas.filter(tarefa =>
            tarefa.titulo.toLowerCase().includes(termo)
        );
    }

    filtrarPorPrioridade(prioridade) {
        if (!prioridade || prioridade === "todas") return this.tarefas;
        return this.tarefas.filter(tarefa => tarefa.prioridade === prioridade);
    }

    filtrarPorStatus(status) {
        if (status === "todas") return this.tarefas;
        if (status === "concluidas") return this.tarefas.filter(tarefa => tarefa.concluida);
        if (status === "pendentes") return this.tarefas.filter(tarefa => !tarefa.concluida);
        if (status === "atrasadas") return this.tarefas.filter(tarefa => tarefa.estaAtrasada());
        return this.tarefas;
    }

    filtrarPorTags(tags) {
        if (!tags || tags.length === 0) return this.tarefas;
        return this.tarefas.filter(tarefa =>
            tags.some(tag => tarefa.tags.includes(tag))
        );
    }

    // Métodos de ordenação
    ordenarPor(campo, ascendente = true) {
        const copia = [...this.tarefas];

        return copia.sort((a, b) => {
            let valorA, valorB;

            // Tratamento especial para diferentes campos
            switch (campo) {
                case "prazo":
                    valorA = a.prazo ? a.prazo.getTime() : Infinity;
                    valorB = b.prazo ? b.prazo.getTime() : Infinity;
                    break;
                case "prioridade":
                    const prioridadeValor = { "baixa": 1, "média": 2, "alta": 3 };
                    valorA = prioridadeValor[a.prioridade] || 0;
                    valorB = prioridadeValor[b.prioridade] || 0;
                    break;
                default:
                    valorA = a[campo];
                    valorB = b[campo];
            }

            // Comparação de valores
            if (valorA < valorB) return ascendente ? -1 : 1;
            if (valorA > valorB) return ascendente ? 1 : -1;
            return 0;
        });
    }

    // Métodos para estatísticas
    calcularEstatisticas() {
        const total = this.tarefas.length;
        const concluidas = this.tarefas.filter(tarefa => tarefa.concluida).length;
        const pendentes = total - concluidas;
        const atrasadas = this.tarefas.filter(tarefa => tarefa.estaAtrasada()).length;

        const prioridades = {
            baixa: this.tarefas.filter(tarefa => tarefa.prioridade === "baixa").length,
            média: this.tarefas.filter(tarefa => tarefa.prioridade === "média").length,
            alta: this.tarefas.filter(tarefa => tarefa.prioridade === "alta").length
        };

        // Contagem de tags
        const tags = {};
        this.tarefas.forEach(tarefa => {
            tarefa.tags.forEach(tag => {
                tags[tag] = (tags[tag] || 0) + 1;
            });
        });

        return {
            total,
            concluidas,
            pendentes,
            atrasadas,
            percentualConcluido: total ? Math.round((concluidas / total) * 100) : 0,
            prioridades,
            tags
        };
    }

    // Persistência com localStorage
    salvarTarefas() {
        localStorage.setItem('tarefas', JSON.stringify(this.tarefas));
    }

    carregarTarefas() {
        try {
            const tarefasSalvas = localStorage.getItem('tarefas');
            if (tarefasSalvas) {
                // Convertendo objetos simples para instâncias de Tarefa
                const tarefasObj = JSON.parse(tarefasSalvas);
                this.tarefas = tarefasObj.map(obj => {
                    const tarefa = new Tarefa(
                        obj.titulo,
                        obj.descricao,
                        obj.prioridade,
                        obj.prazo,
                        obj.tags
                    );

                    // Restaurando propriedades
                    tarefa.id = obj.id;
                    tarefa.concluida = obj.concluida;
                    tarefa.criada = new Date(obj.criada);
                    tarefa.modificada = new Date(obj.modificada);

                    return tarefa;
                });
            }
        } catch (erro) {
            console.error("Erro ao carregar tarefas:", erro);
            this.tarefas = [];
        }
    }

    limparTarefas() {
        this.tarefas = [];
        localStorage.removeItem('tarefas');
    }
}

// ========================================
// CONTROLADORES
// ========================================

// Controlador principal que conecta a lógica de negócios à interface
class TaskMasterController {
    constructor() {
        this.gerenciador = new GerenciadorTarefas();
        this.inicializar();
    }

    inicializar() {
        // Inicializa a interface
        this.renderizarTarefas();
        this.renderizarEstatisticas();
        this.configurarEventos();

        // Verifica se há dados de demonstração
        if (this.gerenciador.tarefas.length === 0) {
            this.carregarDadosDemonstracao();
        }
    }

    configurarEventos() {
        // Formulário de adição de tarefa
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarTarefa();
        });

        // Busca e filtros
        document.getElementById('searchTask').addEventListener('input', (e) => {
            this.buscarTarefas(e.target.value);
        });

        document.getElementById('filterPriority').addEventListener('change', (e) => {
            this.filtrarTarefas('prioridade', e.target.value);
        });

        // Botão para limpar todas as tarefas (para testes)
        if (document.getElementById('btnLimparTarefas')) {
            document.getElementById('btnLimparTarefas').addEventListener('click', () => {
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

        // Validação básica
        if (!titulo) {
            alert('O título da tarefa é obrigatório!');
            return;
        }

        // Extrai tags do título ou descrição (palavras precedidas por #)
        const tagRegex = /#(\w+)/g;
        const tituloTags = [...titulo.matchAll(tagRegex)].map(match => match[1]);
        const descricaoTags = [...descricao.matchAll(tagRegex)].map(match => match[1]);
        const tags = [...new Set([...tituloTags, ...descricaoTags])]; // Remove duplicados

        // Adiciona a tarefa
        this.gerenciador.adicionarTarefa(titulo, descricao, prioridade, prazo, tags);

        // Atualiza a interface
        this.renderizarTarefas();
        this.renderizarEstatisticas();

        // Limpa o formulário
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

        // Aqui podemos abrir um modal de edição ou implementar a edição inline
        // Para simplicidade, usaremos prompts
        const novoTitulo = prompt('Novo título:', tarefa.titulo);
        if (novoTitulo === null) return; // Usuário cancelou

        const novaDescricao = prompt('Nova descrição:', tarefa.descricao);
        if (novaDescricao === null) return;

        const novaPrioridade = prompt('Nova prioridade (baixa, média, alta):', tarefa.prioridade);
        if (novaPrioridade === null) return;

        // Atualiza a tarefa
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
        // Toggling sortDirection
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

            // Transformando tags em links clicáveis
            const tagsHtml = tarefa.tags.length > 0
                ? `<div class="task-tags">${tarefa.tags.map(tag =>
                    `<span class="tag" onclick="taskMaster.filtrarTarefas('tag', '${tag}')">#${tag}</span>`
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
                        <button class="btn-toggle" onclick="taskMaster.alternarStatusTarefa(${tarefa.id})">
                            ${tarefa.concluida ? 'Reabrir' : 'Concluir'}
                        </button>
                        <button class="btn-edit" onclick="taskMaster.editarTarefa(${tarefa.id})">Editar</button>
                        <button class="btn-delete" onclick="taskMaster.removerTarefa(${tarefa.id})">Excluir</button>
                    </div>
                </div>
            `;

            container.appendChild(card);
        });
    }

    renderizarEstatisticas() {
        const stats = this.gerenciador.calcularEstatisticas();
        const container = document.getElementById('statsContainer');

        if (!container) return;

        // Formatação em HTML
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
                    `<span class="tag" onclick="taskMaster.filtrarTarefas('tag', '${tag}')">
                                    #${tag} (${count})
                                </span>`
                )
                .join(' ') || 'Nenhuma tag encontrada'
            }
                    </div>
                </div>
            </div>
        `;
    }

    carregarDadosDemonstracao() {
        // Dados de exemplo para demonstração
        const hoje = new Date();
        const amanha = new Date();
        amanha.setDate(hoje.getDate() + 1);

        const proximaSemana = new Date();
        proximaSemana.setDate(hoje.getDate() + 7);

        const ontem = new Date();
        ontem.setDate(hoje.getDate() - 1);

        // Adiciona tarefas de demonstração
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

        // Marca uma tarefa como concluída
        this.gerenciador.marcarComoConcluida(tarefaAtrasada.id);

        // Atualiza a interface
        this.renderizarTarefas();
        this.renderizarEstatisticas();
    }

    // Métodos utilitários
    formatarData(data) {
        if (!data) return 'Sem prazo';

        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

// ========================================
// INICIALIZAÇÃO
// ========================================

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    console.log("TaskMaster - Iniciando aplicação");

    // Remove a tarefa de exemplo do HTML
    const sampleTask = document.querySelector('.sample-task');
    if (sampleTask) {
        sampleTask.remove();
    }

    // Cria instância global do controlador
    window.taskMaster = new TaskMasterController();

    console.log("TaskMaster - Aplicação inicializada com sucesso");
    console.log('Com grandes poderes vem grandes responsabilidades.');
});