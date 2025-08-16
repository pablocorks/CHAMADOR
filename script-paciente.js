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

// Elementos da página
const telaInicial = document.getElementById('tela-inicial');
const telaNome = document.getElementById('tela-nome');
const telaChamada = document.getElementById('tela-chamada');

const btnAvisar = document.getElementById('btn-avisar');
const btnOk = document.getElementById('btn-ok');
const inputNome = document.getElementById('input-nome');
const nomePacienteChamado = document.getElementById('nome-paciente-chamado');
const audioChamada = document.getElementById('audio-chamada');

// Funções para trocar de tela
function mostrarTelaInicial() {
    telaInicial.style.display = 'flex';
    telaNome.style.display = 'none';
}

function mostrarTelaNome() {
    telaInicial.style.display = 'none';
    telaNome.style.display = 'flex';
    inputNome.focus(); // Foca no campo de texto para o teclado abrir
}

// Event Listeners dos botões
btnAvisar.addEventListener('click', mostrarTelaNome);

btnOk.addEventListener('click', () => {
    const nome = inputNome.value.trim();
    if (nome) {
        // Envia o nome para o Firebase
        const dataChegada = new Date().toISOString();
        database.ref('pacientes').push({
            nome: nome,
            horaChegada: dataChegada,
            status: 'esperando' // status inicial
        });
        
        inputNome.value = ''; // Limpa o campo
        mostrarTelaInicial(); // Volta para a tela inicial
    } else {
        alert('Por favor, digite seu nome.');
    }
});

// --- Lógica de Tempo Real para Chamadas ---

const chamadaRef = database.ref('chamada_atual');

chamadaRef.on('value', (snapshot) => {
    const dadosChamada = snapshot.val();

    if (dadosChamada && dadosChamada.nome) {
        // Alguém está sendo chamado
        nomePacienteChamado.textContent = dadosChamada.nome;
        telaChamada.style.display = 'flex';
        audioChamada.play();

        // O médico irá remover a chamada após 10 segundos
    } else {
        // Ninguém está sendo chamado
        telaChamada.style.display = 'none';
        audioChamada.pause();
        audioChamada.currentTime = 0; // Reinicia o áudio
    }
});

// Registrar o Service Worker (para o PWA)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('SW registrado: ', registration);
        }).catch(registrationError => {
            console.log('SW falhou: ', registrationError);
        });
    });
}