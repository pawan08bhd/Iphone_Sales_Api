import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    customer_name: { type: String, required: true, trim: true, maxlength: 100 },
    phone_model: { type: String, required: true, trim: true, maxlength: 50 },
    color: { type: String, required: true, trim: true, maxlength: 30 },
    storage_gb: { type: Number, required: true, min: 1, validate: { validator: Number.isInteger, message: 'storage_gb must be a positive integer' } },
    price: { type: Number, required: true, min: 0.01 },
    sale_date: { type: Date, required: true },
    store_location: { type: String, required: true, trim: true, maxlength: 100 }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: false },
    versionKey: false,
    toJSON: { virtuals: false },
    toObject: { virtuals: false }
  }
);

export default mongoose.model('Sale', saleSchema);
