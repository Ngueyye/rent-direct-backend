import { Router } from 'express';
import { createListing, getListings, updateListingStatus } from '../controllers/listingcontroller.js';

const router = Router();
router.get('/', getListings);
router.post('/', createListing);
router.patch('/:id/status', updateListingStatus);
export default router;