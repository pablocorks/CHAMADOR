// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvjcnsHUOX5KYjcpvMZFe-PNLcOGrXMhI",
  authDomain: "chamada-consultorio.firebaseapp.com",
  databaseURL: "https://chamada-consultorio-default-rtdb.firebaseio.com",
  projectId: "chamada-consultorio",
  storageBucket: "chamada-consultorio.firebasestorage.app",
  messagingSenderId: "181820619759",
  appId: "1:181820619759:web:d7eea9128d413f9eeb541a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const pacientesRef = database.ref('pacientes');

const corpoTabela = document.getElementById('corpo-tabela');
const timers = {}; // Objeto para guardar os IDs dos timers de cada paciente

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
    // 1. Define o paciente que está sendo chamado no banco
    database.ref('chamada_atual').set({ id: id, nome: nome });

    // 2. Após 10 segundos, remove a chamada e o paciente da lista de espera
    setTimeout(() => {
        database.ref('chamada_atual').remove();
        pacientesRef.child(id).remove();
    }, 10000); // 10 segundos
}

// Ouve por novos pacientes adicionados
pacientesRef.on('child_added', snapshot => {
    const paciente = snapshot.val();
    const id = snapshot.key;

    // Cria a linha na tabela
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', id);
    tr.innerHTML = `
        <td>${paciente.nome}</td>
        <td>${new Date(paciente.horaChegada).toLocaleTimeString('pt-BR')}</td>
        <td class="tempo-espera">00:00</td>
        <td><button class="botao">CHAMAR</button></td>
    `;
    corpoTabela.appendChild(tr);

    // Adiciona o evento de clique ao botão chamar
    tr.querySelector('button').addEventListener('click', () => chamarPaciente(id, paciente.nome));

    // Inicia o timer para atualizar o tempo de espera
    const tdTempoEspera = tr.querySelector('.tempo-espera');
    timers[id] = setInterval(() => {
        tdTempoEspera.textContent = formatarTempoEspera(paciente.horaChegada);
    }, 1000);
});

// Ouve por pacientes removidos
pacientesRef.on('child_removed', snapshot => {
    const id = snapshot.key;
    const tr = corpoTabela.querySelector(`tr[data-id="${id}"]`);
    if (tr) {
        tr.remove();
    }
    // Para o timer associado
    clearInterval(timers[id]);
    delete timers[id];
});