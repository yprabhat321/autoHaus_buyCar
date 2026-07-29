const Vehicle = require('../models/Vehicle');
const ApiError = require('../utils/ApiError');

/**
 * @route   POST /api/vehicles
 * @access  Protected
 */
const createVehicle = async (req, res, next) => {
  try {
    const { make, model, category, price, quantity } = req.body;

    if (!make || !model || !category || price === undefined) {
      throw new ApiError(400, 'make, model, category and price are required.');
    }

    const vehicle = await Vehicle.create({
      ...req.body,
      quantity: quantity ?? 0,
    });

    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/vehicles
 * @access  Protected
 * Lists all vehicles. Supports optional ?inStockOnly=true to only
 * return vehicles with quantity > 0, plus basic pagination.
 */
const getVehicles = async (req, res, next) => {
  try {
    const { inStockOnly } = req.query;
    const filter = inStockOnly === 'true' ? { quantity: { $gt: 0 } } : {};

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/vehicles/search
 * @access  Protected
 * Query params: make, model, category, minPrice, maxPrice
 * All parameters are optional and combine with AND semantics.
 */
const searchVehicles = async (req, res, next) => {
  try {
    const { make, model, category, minPrice, maxPrice } = req.query;
    const filter = {};

    if (make) filter.make = { $regex: make, $options: 'i' };
    if (model) filter.model = { $regex: model, $options: 'i' };
    if (category) filter.category = { $regex: `^${category}$`, $options: 'i' };

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(filter).sort({ price: 1 });

    res.status(200).json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/vehicles/:id
 * @access  Protected
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found.');

    res.status(200).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PUT /api/vehicles/:id
 * @access  Protected
 */
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!vehicle) throw new ApiError(404, 'Vehicle not found.');

    res.status(200).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/vehicles/:id
 * @access  Protected (Admin only)
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found.');

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/vehicles/:id/purchase
 * @access  Protected
 * Decreases quantity by 1 (or req.body.quantity if provided).
 * Rejects the purchase if there isn't enough stock, which prevents
 * the quantity from ever going negative.
 */
const purchaseVehicle = async (req, res, next) => {
  try {
    const amount = Number(req.body.quantity) || 1;
    if (amount <= 0) throw new ApiError(400, 'Purchase quantity must be greater than zero.');

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found.');

    if (vehicle.quantity < amount) {
      throw new ApiError(409, `Insufficient stock. Only ${vehicle.quantity} unit(s) available.`);
    }

    vehicle.quantity -= amount;
    await vehicle.save();

    res.status(200).json({ success: true, message: 'Purchase successful.', data: vehicle });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/vehicles/:id/restock
 * @access  Protected (Admin only)
 * Increases quantity by req.body.quantity (defaults to 1).
 */
const restockVehicle = async (req, res, next) => {
  try {
    const amount = Number(req.body.quantity) || 1;
    if (amount <= 0) throw new ApiError(400, 'Restock quantity must be greater than zero.');

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) throw new ApiError(404, 'Vehicle not found.');

    vehicle.quantity += amount;
    await vehicle.save();

    res.status(200).json({ success: true, message: 'Restock successful.', data: vehicle });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  searchVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  purchaseVehicle,
  restockVehicle,
};
