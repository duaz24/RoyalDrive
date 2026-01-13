document.addEventListener('DOMContentLoaded', () => {
    verificarLogin();
    carregarVeiculos();
});

// --- 1. GESTÃO DE LOGIN E MENU ---

function verificarLogin() {
    const nome = localStorage.getItem('usuario_nome');
    const role = localStorage.getItem('usuario_role'); // <--- ESTA LINHA É CRUCIAL

    const userArea = document.getElementById('user-area');

    if (nome) {
        // Começa por criar o HTML base
        let html = `<span style="margin-right: 15px; color: #d4af37; font-weight: bold;">Olá, ${nome}</span>`;

        // SE FOR ADMIN: Adiciona o botão
        if (role === 'Admin') {
            html += `
                <button class="btn" style="background-color: #800000; color: white; margin-right: 10px; padding: 5px 15px;" onclick="window.location.href='admin.html'">
                    ⚙️ Admin
                </button>
            `;
        }

        // Botão Minhas Reservas
        html += `
            <button class="btn" style="margin-right: 10px; padding: 5px 15px;" onclick="window.location.href='minhas-reservas.html'">
                Reservas
            </button>
        `;

        // Botão Sair
        html += `
            <button class="btn" style="background-color: #444; color: white; padding: 5px 15px;" onclick="logout()">
                Sair
            </button>
        `;

        userArea.innerHTML = html;

    } else {
        userArea.innerHTML = `<button class="btn" onclick="window.location.href='login.html'">Login</button>`;
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario_nome');
    window.location.reload();
}

// --- 2. CARREGAR A FROTA DE CARROS ---

async function carregarVeiculos() {
    try {
        const container = document.getElementById('lista-veiculos');
        
        // Pedir dados à API
        const resposta = await fetch('/api/veiculos');
        const veiculos = await resposta.json();

        container.innerHTML = ''; // Limpar o texto "A carregar..."

        veiculos.forEach(carro => {
            const card = document.createElement('div');
            card.className = 'car-card';

            // Construir o HTML do cartão do carro
            card.innerHTML = `
                <img src="${carro.imagem_url || 'https://via.placeholder.com/300'}" alt="${carro.modelo}" class="car-image">

                <div class="car-title">${carro.marca} ${carro.modelo}</div>
                <div class="car-info">
                    <p>📍 ${carro.agencia_nome}</p>
                    <p>⚙️ ${carro.tipo_nome} (${carro.ano_fabrico})</p>
                    <p style="font-size: 0.9em; color: #aaa;">${carro.caracteristicas || 'Gasolina'}</p>
                </div>
                <div class="car-price">${carro.preco_base_diario}€ / dia</div>
                
                <button class="btn" onclick="tentarReservar(${carro.id_veiculo})">Reservar Agora</button>
            `;

            container.appendChild(card);
        });

    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('lista-veiculos').innerHTML = '<p style="color: red">Erro ao carregar a frota.</p>';
    }
}

// --- 3. LÓGICA DO BOTÃO RESERVAR ---

function tentarReservar(idVeiculo) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert('⚠️ Para reservar, inicie sessão primeiro.');
        window.location.href = 'login.html';
    } else {
        window.location.href = `reservar.html?id=${idVeiculo}`;
    }
}