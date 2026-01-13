document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msgErro = document.getElementById('mensagem-erro');

    try {
        const resposta = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, password })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert('✅ Conta criada com sucesso! Podes fazer login agora.');
            window.location.href = 'login.html';
        } else {
            msgErro.textContent = dados.message || 'Erro ao criar conta.';
            msgErro.style.display = 'block';
        }

    } catch (error) {
        console.error('Erro:', error);
        msgErro.textContent = 'Erro ao ligar ao servidor.';
        msgErro.style.display = 'block';
    }
});