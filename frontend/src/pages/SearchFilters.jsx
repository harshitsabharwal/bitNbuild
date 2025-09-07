import React from 'react';
import { Search } from 'lucide-react';

const SearchFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  priceFilter,
  setPriceFilter,
  sortBy,
  setSortBy,
  categories,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search courses, topics, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Filter */}
        <div className="flex flex-col">
          <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Price Filter */}
        <div className="flex flex-col">
          <label htmlFor="price" className="text-sm font-medium text-gray-700 mb-1">Price</label>
          <select 
            id="price" 
            value={priceFilter} 
            onChange={(e) => setPriceFilter(e.target.value)} 
            className="px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="flex flex-col">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700 mb-1">Sort by</label>
          <select 
            id="sort" 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="rating">Highest Rated</option>
            <option value="students">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
