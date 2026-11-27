import mongoose from 'mongoose';
import Listing, { LISTING_STATUSES } from '../models/listing.js';

const total = (items) => items.reduce((sum, i) => sum + i.amount_ngn, 0);
const rentOf = (items) => items.find((i) => i.type === 'annual_rent')?.amount_ngn ?? 0;

export const createListing = async (req, res) => {
  try {
    const items = req.body.cost_items;
    if (!Array.isArray(items) || !items.some((i) => i.type === 'annual_rent')) {
      return res.status(400).json({ status: 'error', message: 'cost_items must include annual_rent' });
    }
    const listing = await Listing.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        listing_id: listing._id,
        status: listing.status,
        total_move_in_cost_ngn: total(listing.cost_items),
        created_at: listing.createdAt,
      },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getListings = async (req, res) => {
  try {
    const { neighbourhood_id, property_type, max_rent, max_total, has_prepaid_meter, has_water, has_security } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const perPage = 20;

    const filter = { status: 'active' };
    if (neighbourhood_id) filter.neighbourhood_id = neighbourhood_id;
    if (property_type) filter.property_type = property_type;
    if (max_rent) {
      filter.cost_items = { $elemMatch: { type: 'annual_rent', amount_ngn: { $lte: Number(max_rent) } } };
    }
    if (max_total) {
      filter.$expr = { $lte: [{ $sum: '$cost_items.amount_ngn' }, Number(max_total)] };
    }
    if (has_prepaid_meter === 'true') filter['amenities.prepaid_meter'] = true;
    if (has_water === 'true') filter['amenities.water'] = true;
    if (has_security === 'true') filter['amenities.security'] = true;

    const [listings, totalResults] = await Promise.all([
      Listing.find(filter).skip((page - 1) * perPage).limit(perPage),
      Listing.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      meta: { page, per_page: perPage, total_results: totalResults },
      data: listings.map((l) => ({
        listing_id: l._id,
        title: l.title,
        property_type: l.property_type,
        neighbourhood_id: l.neighbourhood_id,
        annual_rent_ngn: rentOf(l.cost_items),
        total_move_in_cost_ngn: total(l.cost_items),
        amenities: l.amenities,
      })),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({ status: 'error', message: 'Listing not found' });
    }
    if (!LISTING_STATUSES.includes(status) || status === 'pending_moderation') {
      return res.status(400).json({ status: 'error', message: 'Invalid status' });
    }
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ status: 'error', message: 'Listing not found' });
    }
    if (listing.status === 'rented') {
      return res.status(409).json({ status: 'error', message: 'Listing is already rented' });
    }
    listing.status = status;
    await listing.save();
    res.status(200).json({ status: 'success', data: { listing_id: listing._id, status: listing.status } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};