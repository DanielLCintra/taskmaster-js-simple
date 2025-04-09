// js/models/Tarefa.js
export class Tarefa {
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

    marcarComoConcluida() {
        this.concluida = true;
        this.modificada = new Date();
    }

    desmarcarConclusao() {
        this.concluida = false;
        this.modificada = new Date();
    }

    atualizarDados(dados) {
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
