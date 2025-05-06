import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
    getDesigns,
    getDesign,
    createDesign,
    updateDesign,
    deleteDesign
} from '../controllers/designController';

const router = express.Router();

// Apply authentication middleware to all design routes
router.use(authenticateToken);

// GET /api/designs - Get all designs for user (with pagination)
router.get('/', getDesigns);

// GET /api/designs/:id - Get a single design
router.get('/:id', getDesign);

// POST /api/designs - Create a new design
router.post('/', createDesign);

// PUT /api/designs/:id - Update a design
router.put('/:id', updateDesign);

// DELETE /api/designs/:id - Delete a design
router.delete('/:id', deleteDesign);

export default router; 