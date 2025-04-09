// js/components/TaskCard.js
export class TaskCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    set task(value) {
        this._task = value;
        this.render();
    }

    render() {
        if (!this._task) return;

        const diasRestantes = this._task.diasRestantes();
        const prazoFormatado = this._task.prazo ? new Date(this._task.prazo).toLocaleDateString('pt-BR') : 'Sem prazo';
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

        this.shadowRoot.innerHTML = `
      <style>
        .task-card { 
          border: 1px solid #eee; 
          border-radius: 5px; 
          margin-bottom: 1rem;
          padding: 1rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .task-header { display: flex; justify-content: space-between; }
        .priority { text-transform: capitalize; }
      </style>
      <div class="task-card">
        <div class="task-header">
          <h3>${this._task.titulo}</h3>
          <span class="priority">${this._task.prioridade}</span>
        </div>
        <div class="task-body">
          <p>${this._task.descricao || 'Sem descrição'}</p>
        </div>
        <div class="task-footer">
          <span class="due-date">${prazoTexto}</span>
        </div>
      </div>
    `;
    }
}

customElements.define('task-card', TaskCard);
