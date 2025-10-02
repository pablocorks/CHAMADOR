// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvjcnsHUOX5KYjcpvMZFe-PNLcOGrXMhI",
  authDomain: "chamada-consultorio.firebaseapp.com",
  databaseURL: "https://chamada-consultorio-default-rtdb.firebaseio.com",
  projectId: "chamada-consultorio",
  storageBucket: "chamada-consultorio.firebasestorage.app",
  messagingSenderId: "181820619759",
  appId: "1:181820619759:web:d7eea9128d413f9eeb541a"
};

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const pacientesRef = database.ref('pacientes');

const corpoTabela = document.getElementById('corpo-tabela');
const audioNotificacao = document.getElementById('audio-notificacao'); // NOVO
const timers = {};

// ... (funções formatarTempoEspera, chamarPaciente, removerPaciente permanecem as mesmas) ...
function formatarTempoEspera(dataChegada) {
    const agora = new Date();
    const chegada = new Date(dataChegada);
    const diffMs = agora - chegada;
    const diffSegs = Math.floor(diffMs / 1000);
    const minutos = Math.floor(diffSegs / 60);
    const segundos = diffSegs % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
}

function chamarPaciente(id, nome) {
    database.ref('chamada_atual').set({ id: id, nome: nome });
    database.ref('ultimo_chamado').set({ id: id, nome: nome });
    setTimeout(() => {
        database.ref('chamada_atual').remove();
    }, 10000);
}

function removerPaciente(id) {
    pacientesRef.child(id).remove();
    database.ref('ultimo_chamado').once('value', (snapshot) => {
        const ultimo = snapshot.val();
        if (ultimo && ultimo.id === id) {
            database.ref('ultimo_chamado').remove();
        }
    });
}


// Ouve por novos pacientes adicionados
pacientesRef.on('child_added', snapshot => {
    // NOVO: Toca o som de notificação
    if (audioNotificacao) {
        audioNotificacao.play().catch(error => {
            console.log("O áudio foi bloqueado pelo navegador. Interaja com a página para ativá-lo.");
        });
    }

    const paciente = snapshot.val();
    const id = snapshot.key;

    const tr = document.createElement('tr');
    tr.setAttribute('data-id', id);
    tr.innerHTML = `
        <td>${paciente.nome}</td>
        <td>${new Date(paciente.horaChegada).toLocaleTimeString('pt-BR')}</td>
        <td class="tempo-espera">00:00</td>
        <td><button class="botao chamar-btn">CHAMAR</button></td>
        <td><button class="botao botao-remover remover-btn">REMOVER</button></td>
    `;
    if (corpoTabela) {
        corpoTabela.appendChild(tr);
    }

    // Adiciona eventos aos botões
    tr.querySelector('.chamar-btn').addEventListener('click', () => chamarPaciente(id, paciente.nome));
    tr.querySelector('.remover-btn').addEventListener('click', () => removerPaciente(id));

    // Inicia o timer
    const tdTempoEspera = tr.querySelector('.tempo-espera');
    if (tdTempoEspera) {
        timers[id] = setInterval(() => {
            tdTempoEspera.textContent = formatarTempoEspera(paciente.horaChegada);
        }, 1000);
    }
});

// Ouve por pacientes removidos
pacientesRef.on('child_removed', snapshot => {
    const id = snapshot.key;
    if (corpoTabela) {
        const tr = corpoTabela.querySelector(`tr[data-id="${id}"]`);
        if (tr) tr.remove();
    }
    
    if (timers[id]) {
        clearInterval(timers[id]);
        delete timers[id];
    }
});
