import React, { useState } from 'react';
import { Building2, DollarSign, Target, Package, Plus, X } from 'lucide-react';

const BUSINESS_MODELS = [
  { value: 'B2C', label: 'B2C (Business to Consumer)' },
  { value: 'B2B', label: 'B2B (Business to Business)' },
  { value: 'B2B2C', label: 'B2B2C (Business to Business to Consumer)' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'saas', label: 'SaaS (Software as a Service)' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'freemium', label: 'Freemium' }
];

const COMPANY_SIZES = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
];

const REVENUE_RANGES = [
  'Pre-revenue', 'Under $100k', '$100k-$500k', '$500k-$1M', 
  '$1M-$5M', '$5M-$10M', '$10M-$50M', '$50M+'
];

const PRICING_STRATEGIES = [
  { value: 'premium', label: 'Premium Pricing' },
  { value: 'competitive', label: 'Competitive Pricing' },
  { value: 'penetration', label: 'Penetration Pricing' },
  { value: 'value', label: 'Value-based Pricing' },
  { value: 'cost-plus', label: 'Cost-plus Pricing' },
  { value: 'freemium', label: 'Freemium Model' }
];

const BusinessDetailsStep = ({ formData, updateFormData, errors }) => {
  const [newProduct, setNewProduct] = useState({ name: '', description: '' });

  const addProduct = () => {
    if (newProduct.name.trim()) {
      const currentProducts = formData.products_services || [];
      updateFormData('products_services', [...currentProducts, { ...newProduct }]);
      setNewProduct({ name: '', description: '' });
    }
  };

  const removeProduct = (index) => {
    const currentProducts = formData.products_services || [];
    updateFormData('products_services', currentProducts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Business Model & Structure */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-blue-600" />
          Business Model & Structure
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Business Model *
            </label>
            <div className="space-y-2">
              {BUSINESS_MODELS.map(model => (
                <button
                  key={model.value}
                  type="button"
                  onClick={() => updateFormData('business_model', model.value)}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                    formData.business_model === model.value
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{model.label}</div>
                </button>
              ))}
            </div>
            {errors.business_model && (
              <p className="mt-1 text-sm text-red-600">{errors.business_model}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Company Size
            </label>
            <div className="space-y-2">
              {COMPANY_SIZES.map(size => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => updateFormData('company_size', size.value)}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                    formData.company_size === size.value
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{size.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Information */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
          Financial Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Revenue Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REVENUE_RANGES.map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => updateFormData('revenue_range', range)}
                  className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                    formData.revenue_range === range
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pricing Strategy
            </label>
            <div className="space-y-2">
              {PRICING_STRATEGIES.map(strategy => (
                <button
                  key={strategy.value}
                  type="button"
                  onClick={() => updateFormData('pricing_strategy', strategy.value)}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                    formData.pricing_strategy === strategy.value
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{strategy.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products & Services */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Products & Services
        </h4>
        
        <div className="space-y-4">
          {formData.products_services && formData.products_services.map((product, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{product.name}</h5>
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          ))}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product or service name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what you offer and its key benefits"
                />
              </div>
              
              <button
                type="button"
                onClick={addProduct}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product/Service
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Unique Selling Proposition */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Unique Selling Proposition
        </h4>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What makes you different? *
            </label>
            <textarea
              value={formData.usp}
              onChange={(e) => updateFormData('usp', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what sets your brand apart from competitors. What unique value do you provide that others don't?"
            />
            <p className="mt-2 text-sm text-gray-500">
              Focus on specific benefits, features, or experiences that make your brand unique.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Key Competitive Advantages
            </label>
            <textarea
              value={formData.competitive_advantages}
              onChange={(e) => updateFormData('competitive_advantages', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="List your main competitive advantages (e.g., proprietary technology, exclusive partnerships, unique expertise)"
            />
          </div>
        </div>
      </div>

      {/* Market Position */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Market Position & Goals
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Market Position
            </label>
            <textarea
              value={formData.current_market_position}
              onChange={(e) => updateFormData('current_market_position', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How do you currently position yourself in the market?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Growth Goals
            </label>
            <textarea
              value={formData.growth_goals}
              onChange={(e) => updateFormData('growth_goals', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What are your main business goals for the next 1-3 years?"
            />
          </div>
        </div>
      </div>

      {/* Success Metrics */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Success Metrics
        </h4>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How do you measure success?
          </label>
          <textarea
            value={formData.success_metrics}
            onChange={(e) => updateFormData('success_metrics', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Key performance indicators, revenue targets, customer acquisition goals, etc."
          />
          <p className="mt-2 text-sm text-gray-500">
            Include specific metrics like revenue growth, customer acquisition, market share, etc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsStep;