const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');

// Rota: GET http://localhost:3001/api/veiculos (Ler todos)
router.get('/', vehicleController.getAllVehicles);

// Rota: GET http://localhost:3001/api/veiculos/1 (Ler um específico)
router.get('/:id', vehicleController.getVehicleById);

// Rota: POST http://localhost:3001/api/veiculos (Criar novo)
router.post('/', vehicleController.createVehicle);

module.exports = router;