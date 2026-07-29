import React from 'react';

const CATEGORIES = ['Sedan', 'SUV', 'Hatchback', 'Coupe', 'Truck', 'Convertible', 'Van'];

const SearchFilterBar = ({ filters, onChange, onSubmit, onReset }) => {
  const update = (field) => (e) => onChange({ ...filters, [field]: e.target.value });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="card p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
    >
      <div className="lg:col-span-2">
        <label className="eyebrow" htmlFor="make">Make</label>
        <input
          id="make"
          type="text"
          placeholder="e.g. Toyota"
          className="input-field"
          value={filters.make}
          onChange={update('make')}
        />
      </div>

      <div>
        <label className="eyebrow" htmlFor="model">Model</label>
        <input
          id="model"
          type="text"
          placeholder="e.g. Corolla"
          className="input-field"
          value={filters.model}
          onChange={update('model')}
        />
      </div>

      <div>
        <label className="eyebrow" htmlFor="category">Category</label>
        <select id="category" className="input-field" value={filters.category} onChange={update('category')}>
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="eyebrow" htmlFor="minPrice">Min price</label>
        <input
          id="minPrice"
          type="number"
          min="0"
          placeholder="$0"
          className="input-field"
          value={filters.minPrice}
          onChange={update('minPrice')}
        />
      </div>

      <div>
        <label className="eyebrow" htmlFor="maxPrice">Max price</label>
        <input
          id="maxPrice"
          type="number"
          min="0"
          placeholder="Any"
          className="input-field"
          value={filters.maxPrice}
          onChange={update('maxPrice')}
        />
      </div>

      <div className="lg:col-span-6 flex gap-3 pt-2">
        <button type="submit" className="btn-primary">Search</button>
        <button type="button" className="btn-secondary" onClick={onReset}>Reset</button>
      </div>
    </form>
  );
};

export default SearchFilterBar;
