// js/app.js
import { TaskMasterController } from './controllers/TaskMasterController.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("TaskMaster - Iniciando aplicação");

    // Remove a tarefa de exemplo do HTML
    const sampleTask = document.querySelector('.sample-task');
    if (sampleTask) sampleTask.remove();

    // Cria a instância global do controlador
    window.taskMaster = new TaskMasterController();

    console.log("TaskMaster - Aplicação inicializada com sucesso");
});
