document.addEventListener('DOMContentLoaded', async () => {
    // 1. Obter o ID do veículo da URL (ex: reservar.html?id=1)
    const params = new URLSearchParams(window.location.search);
    const idVeiculo = params.get('id');

    if (!idVeiculo) {
        alert('Erro: Veículo não especificado.');
        window.location.href = 'index.html';
        return;
    }

    // 2. Carregar dados do carro do Servidor
    try {
        const res = await fetch(`/api/veiculos/${idVeiculo}`);
        if (!res.ok) throw new Error('Veículo não encontrado');
        
        const carro = await res.json();

        // Preencher o HTML da esquerda com a foto e dados
        document.getElementById('info-carro').innerHTML = `
            <img src="${carro.imagem_url}" class="car-image" style="border-radius:5px; margin-bottom:15px; height: 300px;">
            <h2 style="color:#d4af37">${carro.marca} ${carro.modelo}</h2>
            <p>📍 Localização: <strong>${carro.agencia_nome}</strong></p>
            <p>⚙️ Categoria: <strong>${carro.tipo_nome}</strong></p>
            <p style="margin-top: 10px; font-size: 1.2rem;">
                Preço por dia: <strong style="color:#d4af37">${carro.preco_base_diario}€</strong>
            </p>
        `;

        // Guardar o preço diário numa variável global para usar na conta
        window.precoDiario = parseFloat(carro.preco_base_diario);

    } catch (err) {
        console.error(err);
        document.getElementById('info-carro').innerHTML = '<p>Erro ao carregar veículo.</p>';
    }
});

// 3. Atualizar o Total quando as datas mudam
const inputInicio = document.getElementById('data-inicio');
const inputFim = document.getElementById('data-fim');
const displayTotal = document.getElementById('valor-total');

function calcularTotal() {
    if (inputInicio.value && inputFim.value && window.precoDiario) {
        const inicio = new Date(inputInicio.value);
        const fim = new Date(inputFim.value);

        // Calcular diferença em milissegundos e converter para dias
        const diffTempo = fim - inicio;
        const dias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

        if (dias > 0) {
            const total = dias * window.precoDiario;
            displayTotal.innerHTML = `Total: <span style="color:#fff">${total.toFixed(2)}€</span> (${dias} dias)`;
            displayTotal.dataset.valor = total; // Guardar valor numérico escondido para enviar depois
        } else {
            displayTotal.textContent = 'Datas inválidas (A devolução tem de ser depois do levantamento)';
        }
    }
}

// Ouvir mudanças nas datas
inputInicio.addEventListener('change', calcularTotal);
inputFim.addEventListener('change', calcularTotal);

// 4. BOTÃO AVANÇAR (Redireciona para o Checkout)
document.getElementById('btn-pagar').addEventListener('click', () => {
    const token = localStorage.getItem('token');
    
    // Validar Login
    if (!token) {
        alert('Tens de fazer login para reservar.');
        window.location.href = 'login.html';
        return;
    }

    // Validar Datas
    if (!inputInicio.value || !inputFim.value) {
        alert('Por favor seleciona as datas de levantamento e devolução.');
        return;
    }

    // Validar se o total existe
    const total = document.getElementById('valor-total').dataset.valor;
    if (!total || total <= 0) {
        alert('Datas inválidas.');
        return;
    }

    // --- O REDIRECIONAMENTO MÁGICO ---
    // Cria um pacote com os dados para levar para a página de pagamento
    const params = new URLSearchParams({
        id_veiculo: new URLSearchParams(window.location.search).get('id'),
        data_inicio: inputInicio.value,
        data_fim: inputFim.value,
        valor: total
    });

    // Vai para a página de Checkout levando os dados na URL
    window.location.href = `checkout.html?${params.toString()}`;
});