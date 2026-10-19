import { validationResult } from 'express-validator';
import Sale from '../models/Sale.js';

const validationFailure = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ error: 'Validation failed', details: errors.array().map(({ path, msg }) => ({ field: path, message: msg })) });
  return true;
};

export const createSale = async (req, res, next) => {
  try {
    if (validationFailure(req, res)) return;
    const sale = await Sale.create(req.body);
    res.status(201).json(sale);
  } catch (error) { next(error); }
};

export const getSales = async (req, res, next) => {
  try {
    const filter = req.query.phone_model ? { phone_model: req.query.phone_model } : {};
    const sales = await Sale.find(filter).sort({ sale_date: -1, created_at: -1 });
    res.status(200).json(sales);
  } catch (error) { next(error); }
};

export const getSaleById = async (req, res, next) => {
  try {
    if (validationFailure(req, res)) return;
    const sale = await Sale.findById(req.params.sale_id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.status(200).json(sale);
  } catch (error) { next(error); }
};

export const updateSale = async (req, res, next) => {
  try {
    if (validationFailure(req, res)) return;
    const sale = await Sale.findByIdAndUpdate(req.params.sale_id, req.body, { new: true, runValidators: true });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.status(200).json(sale);
  } catch (error) { next(error); }
};

export const deleteSale = async (req, res, next) => {
  try {
    if (validationFailure(req, res)) return;
    const sale = await Sale.findByIdAndDelete(req.params.sale_id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.status(200).json({ message: 'Sale deleted successfully' });
  } catch (error) { next(error); }
};

export const getStats = async (req, res, next) => {
  try {
    const [result] = await Sale.aggregate([
      { $facet: {
        summary: [{ $group: { _id: null, total_sales_count: { $sum: 1 }, total_revenue: { $sum: '$price' }, average_sale_price: { $avg: '$price' } } }],
        popular: [{ $group: { _id: '$phone_model', count: { $sum: 1 } } }, { $sort: { count: -1, _id: 1 } }, { $limit: 1 }]
      } }
    ]);
    const summary = result.summary[0];
    const popular = result.popular[0];
    res.status(200).json({
      total_sales_count: summary?.total_sales_count ?? 0,
      total_revenue: summary?.total_revenue ?? 0,
      most_popular_iphone_model: popular?._id ?? null,
      average_sale_price: summary?.average_sale_price ?? 0
    });
  } catch (error) { next(error); }
};
