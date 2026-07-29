// Mongoose models don't auto-mock cleanly (their internal schema/virtual
// machinery confuses jest's automocker), so we provide an explicit,
// minimal factory exposing only the static methods the controller uses.
jest.mock('../../src/models/Vehicle', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

const Vehicle = require('../../src/models/Vehicle');
const {
  createVehicle,
  getVehicles,
  purchaseVehicle,
  restockVehicle,
  deleteVehicle,
} = require('../../src/controllers/vehicleController');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('vehicleController (unit, mocked model)', () => {
  afterEach(() => jest.clearAllMocks());

  describe('createVehicle', () => {
    it('creates a vehicle and responds with 201', async () => {
      const req = { body: { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 3 } };
      const res = mockRes();
      const next = jest.fn();

      Vehicle.create.mockResolvedValue({ _id: '1', ...req.body });

      await createVehicle(req, res, next);

      expect(Vehicle.create).toHaveBeenCalledWith(expect.objectContaining({ make: 'Toyota', quantity: 3 }));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next with an error when required fields are missing', async () => {
      const req = { body: { make: 'Toyota' } };
      const res = mockRes();
      const next = jest.fn();

      await createVehicle(req, res, next);

      expect(Vehicle.create).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  describe('getVehicles', () => {
    it('returns every vehicle when no filter is supplied', async () => {
      const vehicles = [{ make: 'Toyota' }, { make: 'Honda' }];
      Vehicle.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(vehicles) });

      const req = { query: {} };
      const res = mockRes();

      await getVehicles(req, res, jest.fn());

      expect(Vehicle.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ count: 2, data: vehicles }));
    });

    it('applies the inStockOnly filter', async () => {
      Vehicle.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
      const req = { query: { inStockOnly: 'true' } };

      await getVehicles(req, mockRes(), jest.fn());

      expect(Vehicle.find).toHaveBeenCalledWith({ quantity: { $gt: 0 } });
    });
  });

  describe('purchaseVehicle', () => {
    it('decrements quantity by 1 when enough stock exists', async () => {
      const vehicle = { quantity: 5, save: jest.fn().mockResolvedValue() };
      Vehicle.findById.mockResolvedValue(vehicle);

      const req = { params: { id: 'abc' }, body: {} };
      const res = mockRes();

      await purchaseVehicle(req, res, jest.fn());

      expect(vehicle.quantity).toBe(4);
      expect(vehicle.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('rejects the purchase when quantity requested exceeds stock', async () => {
      const vehicle = { quantity: 2, save: jest.fn() };
      Vehicle.findById.mockResolvedValue(vehicle);

      const req = { params: { id: 'abc' }, body: { quantity: 3 } };
      const next = jest.fn();

      await purchaseVehicle(req, mockRes(), next);

      expect(vehicle.save).not.toHaveBeenCalled();
      expect(vehicle.quantity).toBe(2); // untouched
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
    });

    it('never lets stock go below zero', async () => {
      const vehicle = { quantity: 0, save: jest.fn() };
      Vehicle.findById.mockResolvedValue(vehicle);

      const req = { params: { id: 'abc' }, body: {} };
      const next = jest.fn();

      await purchaseVehicle(req, mockRes(), next);

      expect(vehicle.save).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
    });

    it('passes a 404 error to next when the vehicle does not exist', async () => {
      Vehicle.findById.mockResolvedValue(null);
      const next = jest.fn();

      await purchaseVehicle({ params: { id: 'missing' }, body: {} }, mockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });

  describe('restockVehicle', () => {
    it('increases quantity by the requested amount', async () => {
      const vehicle = { quantity: 2, save: jest.fn().mockResolvedValue() };
      Vehicle.findById.mockResolvedValue(vehicle);

      const req = { params: { id: 'abc' }, body: { quantity: 8 } };

      await restockVehicle(req, mockRes(), jest.fn());

      expect(vehicle.quantity).toBe(10);
      expect(vehicle.save).toHaveBeenCalled();
    });

    it('defaults to increasing by 1 when no quantity is provided', async () => {
      const vehicle = { quantity: 2, save: jest.fn().mockResolvedValue() };
      Vehicle.findById.mockResolvedValue(vehicle);

      await restockVehicle({ params: { id: 'abc' }, body: {} }, mockRes(), jest.fn());

      expect(vehicle.quantity).toBe(3);
    });

    it('rejects a zero or negative restock amount', async () => {
      const vehicle = { quantity: 2, save: jest.fn() };
      Vehicle.findById.mockResolvedValue(vehicle);
      const next = jest.fn();

      await restockVehicle({ params: { id: 'abc' }, body: { quantity: -5 } }, mockRes(), next);

      expect(vehicle.save).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });
  });

  describe('deleteVehicle', () => {
    it('deletes an existing vehicle', async () => {
      Vehicle.findByIdAndDelete.mockResolvedValue({ _id: 'abc' });
      const res = mockRes();

      await deleteVehicle({ params: { id: 'abc' } }, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('passes a 404 to next if the vehicle is not found', async () => {
      Vehicle.findByIdAndDelete.mockResolvedValue(null);
      const next = jest.fn();

      await deleteVehicle({ params: { id: 'missing' } }, mockRes(), next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });
  });
});
