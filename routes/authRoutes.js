import express from 'express';
import { signin ,register ,getAllUsers ,deleteUser } from '../controllers/authcontroller.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/register', register);
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

export default router;
