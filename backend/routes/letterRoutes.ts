const express = require('express');
import * as letterController from '../controllers/letterController';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();

// Public route to fetch a letter by its shareable link
router.get('/letters/share/:shareable_link', letterController.getLetterByShareableLink);

// Protect all routes with authentication middleware except the public route
router.use(authMiddleware);

// Letter management routes
router.post('/letters', letterController.createLetter);
router.put('/letters/:letter_id', letterController.updateLetter);
router.get('/letters/:letter_id', letterController.getLetter);
router.get('/letters', letterController.getAllLetters);
router.delete('/letters/:letter_id', letterController.deleteLetter);
router.get('/letters/:letter_id/download/pdf', letterController.generatePDF);

export default router;