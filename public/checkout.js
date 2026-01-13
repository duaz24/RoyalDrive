// 1. CAPTURAR DADOS DA URL (Que vieram da página de reserva)
const params = new URLSearchParams(window.location.search);
const idVeiculo = params.get('id_veiculo');
const dataInicio = params.get('data_inicio');
const dataFim = params.get('data_fim');
const valorTotal = params.get('valor');

// Verifica se os dados chegaram bem
if (!idVeiculo || !valorTotal) {
    alert("Erro nos dados da reserva. A voltar à frota...");
    window.location.href = 'index.html';
}

// 2. AO CARREGAR A PÁGINA: Preencher o Resumo
document.addEventListener('DOMContentLoaded', async () => {
    
    // Mostrar o total formatado
    document.getElementById('display-total').textContent = `${parseFloat(valorTotal).toFixed(2)}€`;

    // Ir buscar os detalhes do carro ao servidor para mostrar a marca/modelo
    try {
        const res = await fetch(`/api/veiculos/${idVeiculo}`);
        if (!res.ok) throw new Error('Erro ao carregar carro');
        
        const carro = await res.json();
        
        // Preencher o HTML do resumo
        document.getElementById('resumo-conteudo').innerHTML = `
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <img src="${carro.imagem_url}" style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px;">
                <div>
                    <h4 style="margin:0; color:white;">${carro.marca} ${carro.modelo}</h4>
                    <small style="color:#aaa;">${carro.tipo_nome} | ${carro.agencia_nome}</small>
                </div>
            </div>
            <p><strong>📅 Levantamento:</strong> ${new Date(dataInicio).toLocaleDateString()}</p>
            <p><strong>📅 Devolução:</strong> ${new Date(dataFim).toLocaleDateString()}</p>
        `;

    } catch (err) {
        console.error(err);
        document.getElementById('resumo-conteudo').innerHTML = '<p>Erro ao carregar detalhes do carro.</p>';
    }
});

// 3. INTERFACE: Alternar entre Cartão e MB WAY
window.mudarMetodo = (metodo) => {
    const btns = document.querySelectorAll('.method-btn');
    const formCC = document.getElementById('form-cc');
    const formMB = document.getElementById('form-mbway');

    if (metodo === 'cc') {
        // Ativar Cartão
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
        formCC.style.display = 'block';
        formMB.style.display = 'none';
    } else {
        // Ativar MB WAY
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
        formCC.style.display = 'none';
        formMB.style.display = 'block';
    }
};

// 4. FINALIZAR PAGAMENTO (Cria a Reserva Pendente)
document.getElementById('btn-finalizar').addEventListener('click', async () => {
    const btn = document.getElementById('btn-finalizar');
    const token = localStorage.getItem('token');

    if (!token) {
        alert("Sessão expirada. Faz login novamente.");
        window.location.href = 'login.html';
        return;
    }
    
    // --- PASSO A: Simulação Visual de Processamento ---
    btn.disabled = true;
    btn.textContent = 'A contactar banco...';
    btn.style.backgroundColor = '#444'; // Fica cinzento

    // Esperar 2 segundos para dar suspense (Simulação Easypay)
    await new Promise(r => setTimeout(r, 2000));

    // --- PASSO B: Enviar para o Servidor ---
    const dadosReserva = {
        id_veiculo: idVeiculo,
        data_inicio: dataInicio,
        data_fim: dataFim,
        valor_total: valorTotal
    };

    try {
        const resposta = await fetch('/api/reservas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(dadosReserva)
        });

        if (resposta.ok) {
            // SUCESSO! Mas fica PENDENTE (Laranja)
            btn.style.backgroundColor = '#f0ad4e'; // Cor Laranja Royal
            btn.style.color = 'black';
            btn.style.border = '1px solid #d4af37';
            
            // Mensagem atualizada para fluxo de aprovação
            btn.innerHTML = '<strong>Pedido Enviado!</strong> Aguarda aprovação do Admin ⏳';
            
            // Redirecionar após 2.5 segundos
            setTimeout(() => {
                window.location.href = 'minhas-reservas.html';
            }, 2500);

        } else {
            // ERRO
            const erro = await resposta.json();
            alert('Erro: ' + erro.message);
            
            // Restaurar botão para tentar de novo
            btn.disabled = false;
            btn.textContent = 'Tentar Novamente';
            btn.style.backgroundColor = '#d4af37';
        }

    } catch (err) {
        console.error(err);
        alert('Erro de conexão ao servidor.');
        btn.disabled = false;
        btn.textContent = 'Erro de Ligação';
    }
});