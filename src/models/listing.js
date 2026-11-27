import mongoose from 'mongoose';

export const COST_TYPES = ['annual_rent', 'service_charge', 'caution_fee', 'legal_fee'];
export const PROPERTY_TYPES = ['self_contain', 'mini_flat', '2_bed', '3_bed', 'duplex', 'terrace', 'shared'];
export const LISTING_STATUSES = ['pending_moderation', 'active', 'booked', 'rented', 'suspended'];

const costItemSchema = new mongoose.Schema({
  type: { type: String, enum: COST_TYPES, required: true },
  amount_ngn: {
    type: Number,
    required: true,
    min: 0,
    validate: { validator: Number.isInteger, message: 'amount_ngn must be a whole number' },
  },
  frequency: { type: String },
}, { _id: false });

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 10, maxlength: 120 },
  property_type: { type: String, enum: PROPERTY_TYPES, required: true },
  neighbourhood_id: { type: String, required: true },
  address_text: { type: String, required: true },
  cost_items: { type: [costItemSchema], required: true },
  amenities: {
    prepaid_meter: { type: Boolean, default: false },
    water: { type: Boolean, default: false },
    parking: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
  },
  status: { type: String, enum: LISTING_STATUSES, default: 'pending_moderation' },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Listing', listingSchema);