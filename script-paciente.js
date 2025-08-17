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

// Elementos da página
const telaInicial = document.getElementById('tela-inicial');
const telaNome = document.getElementById('tela-nome');
const telaChamada = document.getElementById('tela-chamada');
const overlayObrigado = document.getElementById('overlay-obrigado');
const overlaySenha = document.getElementById('overlay-senha');

const btnAvisar = document.getElementById('btn-avisar');
const btnOk = document.getElementById('btn-ok');
const inputNome = document.getElementById('input-nome');
const nomePacienteChamado = document.getElementById('nome-paciente-chamado');
const audioChamada = document.getElementById('audio-chamada');

const containerUltimoChamado = document.getElementById('container-ultimo-chamado');
const ultimoNome = document.getElementById('ultimo-nome');

const inputSenha = document.getElementById('input-senha');
const btnConfirmarSenha = document.getElementById('btn-confirmar-senha');
const btnCancelarSaida = document.getElementById('btn-cancelar-saida');

// --- Lógica de Kiosk Mode (Tela Cheia e Senha) ---
let isLocked = false;

function enterKioskMode() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) { /* Firefox */
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) { /* IE/Edge */
        element.msRequestFullscreen();
    }
    isLocked = true;
}

function exitKioskMode() {
    isLocked = false;
    if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && isLocked) {
        // Usuário tentou sair, mostrar tela de senha
        overlaySenha.style.display = 'flex';
    }
});

btnConfirmarSenha.addEventListener('click', () => {
    if (inputSenha.value === '1803') {
        exitKioskMode();
        overlaySenha.style.display = 'none';
        inputSenha.value = '';
    } else {
        alert('Senha incorreta!');
        inputSenha.value = '';
        enterKioskMode(); // Força a volta para tela cheia
        overlaySenha.style.display = 'none';
    }
});

btnCancelarSaida.addEventListener('click', () => {
    enterKioskMode(); // Força a volta para tela cheia
    overlaySenha.style.display = 'none';
    inputSenha.value = '';
});


// Funções para trocar de tela
function mostrarTelaInicial() {
    telaInicial.style.display = 'flex';
    telaNome.style.display = 'none';
}

function mostrarTelaNome() {
    // Entra em modo Kiosk na primeira interação importante
    if (!isLocked) {
        enterKioskMode();
    }
    telaInicial.style.display = 'none';
    telaNome.style.display = 'flex';
    inputNome.focus();
}

// Event Listeners dos botões
if (btnAvisar) {
    btnAvisar.addEventListener('click', mostrarTelaNome);
}

if (btnOk) {
    btnOk.addEventListener('click', () => {
        const nome = inputNome.value.trim();
        if (nome) {
            const dataChegada = new Date().toISOString();
            database.ref('pacientes').push({
                nome: nome,
                horaChegada: dataChegada,
                status: 'esperando'
            });
            
            inputNome.value = '';
            
            // Mostra mensagem de "Obrigado" por 3 segundos
            overlayObrigado.style.display = 'flex';
            setTimeout(() => {
                overlayObrigado.style.display = 'none';
                mostrarTelaInicial();
            }, 3000);

        } else {
            alert('Por favor, digite seu nome.');
        }
    });
}

// --- Lógica de Tempo Real ---

// Ouve por chamadas
const chamadaRef = database.ref('chamada_atual');
chamadaRef.on('value', (snapshot) => {
    const dadosChamada = snapshot.val();
    if (dadosChamada && dadosChamada.nome) {
        nomePacienteChamado.textContent = dadosChamada.nome;
        telaChamada.style.display = 'flex';
        if (audioChamada) audioChamada.play();

        setTimeout(() => {
            telaChamada.style.display = 'none';
            database.ref('chamada_atual').remove();
        }, 10000);
    }
});

// Ouve pelo último paciente chamado para exibir na tela inicial
const ultimoChamadoRef = database.ref('ultimo_chamado');
ultimoChamadoRef.on('value', (snapshot) => {
    const ultimo = snapshot.val();
    if (ultimo && ultimo.nome) {
        ultimoNome.textContent = ultimo.nome;
        containerUltimoChamado.style.display = 'block';
    } else {
        containerUltimoChamado.style.display = 'none';
    }
});

// Registrar o Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW Registrado')).catch(err => console.log('SW Falhou', err));
    });
}
