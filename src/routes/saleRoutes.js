import { Router } from 'express';
import { body, param } from 'express-validator';
import { createSale, deleteSale, getSaleById, getSales, getStats, updateSale } from '../controllers/saleController.js';

const router = Router();
const idValidation = [param('sale_id').isMongoId().withMessage('sale_id must be a valid MongoDB ObjectId')];
const fieldValidation = () => [
  body('customer_name').trim().notEmpty().withMessage('customer_name is required').isLength({ max: 100 }).withMessage('customer_name must be at most 100 characters'),
  body('phone_model').trim().notEmpty().withMessage('phone_model is required').isLength({ max: 50 }).withMessage('phone_model must be at most 50 characters'),
  body('color').trim().notEmpty().withMessage('color is required').isLength({ max: 30 }).withMessage('color must be at most 30 characters'),
  body('storage_gb').isInt({ min: 1 }).withMessage('storage_gb must be a positive integer').toInt(),
  body('price').isFloat({ gt: 0 }).withMessage('price must be greater than zero').toFloat(),
  body('sale_date').isISO8601({ strict: true }).withMessage('sale_date must be a valid ISO 8601 date').toDate(),
  body('store_location').trim().notEmpty().withMessage('store_location is required').isLength({ max: 100 }).withMessage('store_location must be at most 100 characters')
];
const createValidation = fieldValidation();
const updateValidation = [
  body().custom((value) => Object.keys(value).length > 0).withMessage('At least one field is required'),
  ...fieldValidation().map((rule) => rule.optional())
];

router.get('/stats', getStats);
router.post('/', createValidation, createSale);
router.get('/', getSales);
router.get('/:sale_id', idValidation, getSaleById);
router.put('/:sale_id', [...idValidation, ...updateValidation], updateSale);
router.delete('/:sale_id', idValidation, deleteSale);

export default router;
