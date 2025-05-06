import express from 'express';
import { getCart, updateCart, removeFromCart, clearCart } from '../controllers/cartController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

router.get('/', getCart);
router.post('/update', updateCart);
router.delete('/item/:furnitureId', removeFromCart);
router.delete('/clear', clearCart);

export default router; 