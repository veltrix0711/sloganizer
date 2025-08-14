import express from 'express';
const router = express.Router();

// Mock template data - in production this would come from a database
const mockTemplates = [
  {
    id: 'template-1',
    title: 'Tech Startup Boost',
    description: 'Perfect for technology companies and startups looking to make a bold statement',
    category: 'technology',
    tier: 'free',
    preview: 'Innovation meets excellence in every line of code',
    tags: ['tech', 'startup', 'innovation', 'modern'],
    downloads: 1250,
    rating: 4.8,
    created_at: '2024-01-15T10:00:00Z',
    template_data: {
      industry: 'Technology',
      tone: 'professional',
      keywords: ['innovation', 'excellence', 'cutting-edge', 'solutions'],
      style: 'modern'
    }
  },
  {
    id: 'template-2',
    title: 'Luxury Brand Elegance',
    description: 'Sophisticated templates for high-end brands and luxury services',
    category: 'luxury',
    tier: 'pro',
    preview: 'Where luxury meets perfection, excellence is born',
    tags: ['luxury', 'premium', 'elegant', 'sophisticated'],
    downloads: 890,
    rating: 4.9,
    created_at: '2024-01-10T14:30:00Z',
    template_data: {
      industry: 'Luxury',
      tone: 'sophisticated',
      keywords: ['luxury', 'perfection', 'excellence', 'premium'],
      style: 'elegant'
    }
  },
  {
    id: 'template-3',
    title: 'Health & Wellness Focus',
    description: 'Inspiring templates for health, fitness, and wellness brands',
    category: 'health',
    tier: 'free',
    preview: 'Your health, our passion, together we thrive',
    tags: ['health', 'wellness', 'fitness', 'lifestyle'],
    downloads: 2100,
    rating: 4.7,
    created_at: '2024-01-08T09:15:00Z',
    template_data: {
      industry: 'Health & Wellness',
      tone: 'inspiring',
      keywords: ['health', 'passion', 'thrive', 'wellness'],
      style: 'warm'
    }
  },
  {
    id: 'template-4',
    title: 'E-commerce Power',
    description: 'High-converting templates designed for online retail success',
    category: 'ecommerce',
    tier: 'pro',
    preview: 'Shop smart, live better, choose excellence',
    tags: ['ecommerce', 'retail', 'shopping', 'conversion'],
    downloads: 1680,
    rating: 4.6,
    created_at: '2024-01-05T16:45:00Z',
    template_data: {
      industry: 'E-commerce',
      tone: 'persuasive',
      keywords: ['smart', 'better', 'excellence', 'quality'],
      style: 'dynamic'
    }
  },
  {
    id: 'template-5',
    title: 'Creative Agency Spark',
    description: 'Bold and creative templates for agencies and design studios',
    category: 'creative',
    tier: 'enterprise',
    preview: 'Creativity unleashed, imagination realized, dreams delivered',
    tags: ['creative', 'agency', 'design', 'artistic'],
    downloads: 756,
    rating: 5.0,
    created_at: '2024-01-12T11:20:00Z',
    template_data: {
      industry: 'Creative',
      tone: 'bold',
      keywords: ['creativity', 'imagination', 'dreams', 'artistic'],
      style: 'vibrant'
    }
  },
  {
    id: 'template-6',
    title: 'Food & Restaurant Flavor',
    description: 'Appetizing templates for restaurants, cafes, and food brands',
    category: 'food',
    tier: 'free',
    preview: 'Taste the difference, savor the experience',
    tags: ['food', 'restaurant', 'culinary', 'taste'],
    downloads: 1420,
    rating: 4.5,
    created_at: '2024-01-20T13:10:00Z',
    template_data: {
      industry: 'Food & Beverage',
      tone: 'appetizing',
      keywords: ['taste', 'difference', 'savor', 'experience'],
      style: 'warm'
    }
  },
  {
    id: 'template-7',
    title: 'Financial Services Trust',
    description: 'Professional templates for banks, insurance, and financial services',
    category: 'finance',
    tier: 'pro',
    preview: 'Your financial future, our trusted expertise',
    tags: ['finance', 'trust', 'professional', 'security'],
    downloads: 934,
    rating: 4.4,
    created_at: '2024-01-18T08:30:00Z',
    template_data: {
      industry: 'Financial Services',
      tone: 'trustworthy',
      keywords: ['financial', 'future', 'trusted', 'expertise'],
      style: 'professional'
    }
  },
  {
    id: 'template-8',
    title: 'Education & Learning',
    description: 'Inspiring templates for schools, courses, and educational platforms',
    category: 'education',
    tier: 'free',
    preview: 'Learn today, lead tomorrow, shape the future',
    tags: ['education', 'learning', 'school', 'knowledge'],
    downloads: 1890,
    rating: 4.8,
    created_at: '2024-01-22T15:45:00Z',
    template_data: {
      industry: 'Education',
      tone: 'inspiring',
      keywords: ['learn', 'lead', 'shape', 'future'],
      style: 'encouraging'
    }
  }
];

const mockCategories = [
  { id: 'technology', name: 'Technology', count: 12 },
  { id: 'luxury', name: 'Luxury', count: 8 },
  { id: 'health', name: 'Health & Wellness', count: 15 },
  { id: 'ecommerce', name: 'E-commerce', count: 10 },
  { id: 'creative', name: 'Creative', count: 9 },
  { id: 'food', name: 'Food & Restaurant', count: 11 },
  { id: 'finance', name: 'Finance', count: 7 },
  { id: 'education', name: 'Education', count: 13 }
];

// Mock user favorites (in production, this would be stored in database)
const mockUserFavorites = new Map();

// Get all templates
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      templates: mockTemplates,
      total: mockTemplates.length
    });
  } catch (error) {
    console.error('Templates fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch templates'
    });
  }
});

// Get template categories
router.get('/categories', async (req, res) => {
  try {
    res.json({
      success: true,
      categories: mockCategories
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

// Get user's favorite templates
router.get('/favorites', async (req, res) => {
  try {
    const userEmail = req.user?.email || req.query.email;
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userFavorites = mockUserFavorites.get(userEmail) || [];
    
    res.json({
      success: true,
      favoriteIds: userFavorites,
      favorites: mockTemplates.filter(template => userFavorites.includes(template.id))
    });
  } catch (error) {
    console.error('Favorites fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
});

// Add template to favorites
router.post('/favorites', async (req, res) => {
  try {
    const userEmail = req.user?.email || req.body.email;
    const { templateId } = req.body;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required'
      });
    }

    // Check if template exists
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    const userFavorites = mockUserFavorites.get(userEmail) || [];
    
    if (userFavorites.includes(templateId)) {
      return res.status(400).json({
        success: false,
        error: 'Template already in favorites'
      });
    }

    userFavorites.push(templateId);
    mockUserFavorites.set(userEmail, userFavorites);

    res.json({
      success: true,
      message: 'Template added to favorites',
      favoriteIds: userFavorites
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to favorites'
    });
  }
});

// Remove template from favorites
router.delete('/favorites/:templateId', async (req, res) => {
  try {
    const userEmail = req.user?.email || req.query.email;
    const { templateId } = req.params;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userFavorites = mockUserFavorites.get(userEmail) || [];
    const updatedFavorites = userFavorites.filter(id => id !== templateId);
    
    mockUserFavorites.set(userEmail, updatedFavorites);

    res.json({
      success: true,
      message: 'Template removed from favorites',
      favoriteIds: updatedFavorites
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from favorites'
    });
  }
});

// Use a template (apply it to slogan generation)
router.post('/use', async (req, res) => {
  try {
    const userEmail = req.user?.email || req.body.email;
    const { templateId } = req.body;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required'
      });
    }

    // Find the template
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Increment download count (in production, this would update the database)
    template.downloads = (template.downloads || 0) + 1;

    res.json({
      success: true,
      message: 'Template applied successfully',
      template: template,
      templateData: template.template_data
    });
  } catch (error) {
    console.error('Use template error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to use template'
    });
  }
});

// Get template by ID
router.get('/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    
    const template = mockTemplates.find(t => t.id === templateId);
    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      template: template
    });
  } catch (error) {
    console.error('Template fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch template'
    });
  }
});

// Search templates
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();

    const results = mockTemplates.filter(template => 
      template.title.toLowerCase().includes(searchTerm) ||
      template.description.toLowerCase().includes(searchTerm) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      template.category.toLowerCase().includes(searchTerm)
    );

    res.json({
      success: true,
      query: query,
      templates: results,
      total: results.length
    });
  } catch (error) {
    console.error('Template search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search templates'
    });
  }
});

export default router;