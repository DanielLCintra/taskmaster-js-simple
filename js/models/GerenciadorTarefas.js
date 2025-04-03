// js/models/GerenciadorTarefas.js
import { Tarefa } from './Tarefa.js';

export class GerenciadorTarefas {
    constructor() {
        this.tarefas = [];
        this.carregarTarefas();
    }

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
        tarefa.atualizarDados(dados);
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

    ordenarPor(campo, ascendente = true) {
        const copia = [...this.tarefas];
        return copia.sort((a, b) => {
            let valorA, valorB;
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
            if (valorA < valorB) return ascendente ? -1 : 1;
            if (valorA > valorB) return ascendente ? 1 : -1;
            return 0;
        });
    }

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

    salvarTarefas() {
        localStorage.setItem('tarefas', JSON.stringify(this.tarefas));
    }

    carregarTarefas() {
        try {
            const tarefasSalvas = localStorage.getItem('tarefas');
            if (tarefasSalvas) {
                const tarefasObj = JSON.parse(tarefasSalvas);
                this.tarefas = tarefasObj.map(obj => {
                    const tarefa = new Tarefa(
                        obj.titulo,
                        obj.descricao,
                        obj.prioridade,
                        obj.prazo,
                        obj.tags
                    );
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
