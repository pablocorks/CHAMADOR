// ... (todo o código inicial permanece o mesmo) ...
const firebaseConfig = {
  apiKey: "AIzaSyBvjcnsHUOX5KYjcpvMZFe-PNLcOGrXMhI",
  authDomain: "chamada-consultorio.firebaseapp.com",
  databaseURL: "https://chamada-consultorio-default-rtdb.firebaseio.com",
  projectId: "chamada-consultorio",
  storageBucket: "chamada-consultorio.firebasestorage.app",
  messagingSenderId: "181820619759",
  appId: "1:181820619759:web:d7eea9128d413f9eeb541a"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const telaInicial = document.getElementById('tela-inicial');
const telaNome = document.getElementById('tela-nome');
// ... (e todos os outros getElementById) ...
const btnAvisar = document.getElementById('btn-avisar');
// ...

function mostrarTelaNome() {
    if (!isLocked) {
        enterKioskMode();
    }
    telaInicial.style.display = 'none';
    telaNome.style.display = 'flex';
    inputNome.focus();
    
    // NOVO: Adiciona um evento para remover o 'readonly' no foco
    inputNome.onfocus = function() {
        this.removeAttribute('readonly');
        // Garante que o evento não rode de novo desnecessariamente
        this.onfocus = null; 
    };
}

// ... (o resto do seu código, como a função 'btnOk.addEventListener', etc, permanece exatamente o mesmo) ...

// O código abaixo é o restante do seu arquivo, sem alterações.
// Apenas a função mostrarTelaNome() acima foi modificada.
const telaChamada = document.getElementById('tela-chamada');
const overlayObrigado = document.getElementById('overlay-obrigado');
const overlaySenha = document.getElementById('overlay-senha');
const btnOk = document.getElementById('btn-ok');
const inputNome = document.getElementById('input-nome');
const nomePacienteChamado = document.getElementById('nome-paciente-chamado');
const audioChamada = document.getElementById('audio-chamada');
const containerUltimoChamado = document.getElementById('container-ultimo-chamado');
const ultimoNome = document.getElementById('ultimo-nome');
const inputSenha = document.getElementById('input-senha');
const btnConfirmarSenha = document.getElementById('btn-confirmar-senha');
const btnCancelarSaida = document.getElementById('btn-cancelar-saida');
let isLocked = false;
function enterKioskMode() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
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
if(btnConfirmarSenha && btnCancelarSaida) {
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && isLocked) {
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
            enterKioskMode();
            overlaySenha.style.display = 'none';
        }
    });
    btnCancelarSaida.addEventListener('click', () => {
        enterKioskMode();
        overlaySenha.style.display = 'none';
        inputSenha.value = '';
    });
}
function mostrarTelaInicial() {
    telaInicial.style.display = 'flex';
    telaNome.style.display = 'none';
    // Adicionado para garantir que o campo esteja 'readonly' da próxima vez
    if(inputNome) inputNome.setAttribute('readonly', true);
}
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
            overlayObrigado.style.display = 'flex';
            setTimeout(() => {
                overlayObrigado.style.display = 'none';
                mostrarTelaInicial();
            }, 12000);
        } else {
            alert('Por favor, digite seu nome.');
        }
    });
}
const chamadaRef = database.ref('chamada_atual');
chamadaRef.on('value', (snapshot) => {
    const dadosChamada = snapshot.val();
    if (dadosChamada && dadosChamada.nome) {
        nomePacienteChamado.textContent = dadosChamada.nome;
        telaChamada.style.display = 'flex';
        if (audioChamada) {
            audioChamada.play();
            audioChamada.onended = function() {
                audioChamada.play();
                audioChamada.onended = null;
            };
        }
    } else {
        telaChamada.style.display = 'none';
        if (audioChamada) {
            audioChamada.pause();
            audioChamada.currentTime = 0;
            audioChamada.onended = null;
        }
    }
});
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
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('SW registrado com sucesso: ', registration);
        }).catch(registrationError => {
            console.log('SW Falhou', registrationError);
        });
    });
}
