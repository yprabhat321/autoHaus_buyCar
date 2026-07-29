import React, { useCallback, useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import VehicleCard from '../components/VehicleCard.jsx';
import VehicleFormModal from '../components/VehicleFormModal.jsx';
import RestockModal from '../components/RestockModal.jsx';

const emptyFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' };

const Dashboard = () => {
  const { isAdmin } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [filters, setFilters] = useState(emptyFilters);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const [formVehicle, setFormVehicle] = useState(undefined); // undefined = closed, null = "add", object = "edit"
  const [restockVehicle, setRestockVehicle] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosClient.get('/vehicles');
      setVehicles(res.data.data);
      setIsSearchMode(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load vehicles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const runSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '') params[key] = value;
      });
      const res = await axiosClient.get('/vehicles/search', { params });
      setVehicles(res.data.data);
      setIsSearchMode(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setFilters(emptyFilters);
    fetchAll();
  };

  const flashNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 3000);
  };

  const refresh = () => (isSearchMode ? runSearch() : fetchAll());

  const handlePurchase = async (vehicle) => {
    try {
      await axiosClient.post(`/vehicles/${vehicle._id}/purchase`, { quantity: 1 });
      flashNotice(`Purchased 1 × ${vehicle.make} ${vehicle.model}.`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Purchase failed.');
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model} from inventory?`)) return;
    try {
      await axiosClient.delete(`/vehicles/${vehicle._id}`);
      flashNotice('Vehicle deleted.');
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleFormSubmit = async (payload) => {
    if (formVehicle && formVehicle._id) {
      await axiosClient.put(`/vehicles/${formVehicle._id}`, payload);
      flashNotice('Vehicle updated.');
    } else {
      await axiosClient.post('/vehicles', payload);
      flashNotice('Vehicle added to inventory.');
    }
    setFormVehicle(undefined);
    refresh();
  };

  const handleRestockSubmit = async (amount) => {
    await axiosClient.post(`/vehicles/${restockVehicle._id}/restock`, { quantity: amount });
    flashNotice(`Restocked ${restockVehicle.make} ${restockVehicle.model}.`);
    setRestockVehicle(null);
    refresh();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
        <div>
          <p className="eyebrow">Showroom floor</p>
          <h1 className="font-display text-4xl mt-1">Available Inventory</h1>
        </div>

        {isAdmin && (
          <button type="button" className="btn-primary" onClick={() => setFormVehicle(null)}>
            + Add vehicle
          </button>
        )}
      </div>

      <SearchFilterBar filters={filters} onChange={setFilters} onSubmit={runSearch} onReset={resetSearch} />

      {notice && (
        <p className="mt-6 text-sm text-white bg-ink px-4 py-3 inline-block">{notice}</p>
      )}
      {error && (
        <p className="mt-6 text-ember-600 text-sm border-l-2 border-ember pl-3">{error}</p>
      )}

      <div className="mt-10">
        {loading ? (
          <p className="text-steel-600">Loading inventory…</p>
        ) : vehicles.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="font-display text-xl">No vehicles match your search.</p>
            <p className="text-steel-600 text-sm mt-2">Try adjusting or resetting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onPurchase={handlePurchase}
                onEdit={(v) => setFormVehicle(v)}
                onDelete={handleDelete}
                onRestock={(v) => setRestockVehicle(v)}
              />
            ))}
          </div>
        )}
      </div>

      {formVehicle !== undefined && (
        <VehicleFormModal
          vehicle={formVehicle}
          onClose={() => setFormVehicle(undefined)}
          onSubmit={handleFormSubmit}
        />
      )}

      {restockVehicle && (
        <RestockModal
          vehicle={restockVehicle}
          onClose={() => setRestockVehicle(null)}
          onSubmit={handleRestockSubmit}
        />
      )}
    </div>
  );
};

export default Dashboard;
