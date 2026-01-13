const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas Normais (Cliente)
router.post('/', authMiddleware, reservationController.createReservation);
router.get('/me', authMiddleware, reservationController.getMyReservations);

// Rotas de Admin (Para gerir pedidos)
// Nota: Num projeto real, devíamos ter um middleware extra para garantir que é Admin
router.get('/all', authMiddleware, reservationController.getAllReservations);
router.put('/:id/status', authMiddleware, reservationController.updateStatus);

module.exports = router;