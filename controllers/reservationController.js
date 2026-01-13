const db = require('../config/db');

// --- 1. CRIAR RESERVA (Agora nasce como 'Pendente') ---
exports.createReservation = async (req, res) => {
    const { id_veiculo, data_inicio, data_fim, valor_total } = req.body;
    const id_utilizador = req.user.id;

    try {
        // Mudança aqui: Estado inicial é 'Pendente'
        const query = `
            INSERT INTO reservas (id_utilizador, id_veiculo, data_inicio, data_fim, valor_total, estado)
            VALUES (?, ?, ?, ?, ?, 'Pendente')
        `;

        await db.query(query, [id_utilizador, id_veiculo, data_inicio, data_fim, valor_total]);
        res.status(201).json({ message: 'Pedido de reserva enviado!' });

    } catch (error) {
        console.error("Erro ao criar reserva:", error);
        res.status(500).json({ message: 'Erro ao criar reserva.' });
    }
};

// --- 2. MINHAS RESERVAS (Para o Cliente ver as suas) ---
exports.getMyReservations = async (req, res) => {
    const id_utilizador = req.user.id;
    try {
        const query = `
            SELECT r.*, v.marca, v.modelo, v.imagem_url
            FROM reservas r
            JOIN veiculos v ON r.id_veiculo = v.id_veiculo
            WHERE r.id_utilizador = ?
            ORDER BY r.data_criacao DESC
        `;
        const [rows] = await db.query(query, [id_utilizador]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar histórico.' });
    }
};

// --- 3. TODAS AS RESERVAS (Para o Admin ver tudo) ---
exports.getAllReservations = async (req, res) => {
    try {
        // Trazemos também o NOME do cliente para saberes quem pediu
        const query = `
            SELECT r.*, u.nome AS nome_cliente, v.marca, v.modelo, v.imagem_url
            FROM reservas r
            JOIN utilizadores u ON r.id_utilizador = u.id_utilizador
            JOIN veiculos v ON r.id_veiculo = v.id_veiculo
            ORDER BY 
                CASE WHEN r.estado = 'Pendente' THEN 1 ELSE 2 END, -- Pendentes aparecem primeiro
                r.data_criacao DESC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar reservas.' });
    }
};

// --- 4. ATUALIZAR ESTADO (Para o Admin Aprovar/Rejeitar) ---
exports.updateStatus = async (req, res) => {
    const { id } = req.params; // ID da reserva
    const { estado } = req.body; // 'Confirmada' ou 'Cancelada'

    try {
        await db.query('UPDATE reservas SET estado = ? WHERE id_reserva = ?', [estado, id]);
        res.json({ message: `Reserva ${estado} com sucesso!` });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar estado.' });
    }
};