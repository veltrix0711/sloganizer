import express from 'express';
import { supabase } from '../services/supabase.js';

const router = express.Router();

// Get analytics overview for a user (with caching)
router.get('/overview', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    // Get user profile to check subscription
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return mock analytics overview for now
    const mockOverview = {
      totalPosts: 15,
      totalViews: 2500,
      totalEngagement: 450,
      totalReach: 1800,
      topPlatform: 'Instagram',
      engagementRate: 18.0,
      growthRate: 12.5
    };

    res.json({
      success: true,
      overview: mockOverview,
      cached: false
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get detailed metrics for a specific time period (with caching)
router.get('/metrics', async (req, res) => {
  try {
    const { email, platform, days = 30 } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return mock analytics metrics for now
    const mockMetrics = {
      dailyViews: [100, 120, 90, 150, 180, 200, 170],
      dailyEngagement: [15, 18, 12, 22, 25, 30, 28],
      platformBreakdown: {
        instagram: 45,
        facebook: 35,
        twitter: 20
      },
      topContent: [
        { title: 'Sample Post 1', views: 500, engagement: 45 },
        { title: 'Sample Post 2', views: 350, engagement: 32 }
      ]
    };

    res.json({
      success: true,
      metrics: mockMetrics,
      cached: false
    });

  } catch (error) {
    console.error('Analytics metrics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get top performing posts (with caching)
router.get('/top-posts', async (req, res) => {
  try {
    const { email, limit = 10, platform } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return mock top posts for now
    const mockTopPosts = [
      {
        id: '1',
        content: 'Introducing our new feature! 🚀',
        platform: 'instagram',
        views: 1500,
        likes: 120,
        shares: 25,
        comments: 15,
        engagement_rate: 10.67,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2', 
        content: 'Behind the scenes at our office',
        platform: 'facebook',
        views: 1200,
        likes: 95,
        shares: 18,
        comments: 22,
        engagement_rate: 11.25,
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      }
    ];

    res.json({
      success: true,
      topPosts: mockTopPosts.slice(0, parseInt(limit)),
      cached: false
    });

  } catch (error) {
    console.error('Top posts error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Record analytics event
router.post('/event', async (req, res) => {
  try {
    const { email, eventType, platform, contentId, data } = req.body;
    
    if (!email || !eventType) {
      return res.status(400).json({
        success: false,
        error: 'Email and eventType required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Record the analytics event
    const { data: event, error: eventError } = await supabase
      .from('analytics_events')
      .insert({
        user_id: profile.id,
        event_type: eventType,
        platform: platform || null,
        content_id: contentId || null,
        event_data: data || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (eventError) {
      return res.status(500).json({
        success: false,
        error: eventError.message
      });
    }

    res.json({
      success: true,
      event
    });

  } catch (error) {
    console.error('Analytics event error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get analytics export data (enhanced with PDF support)
router.get('/export', async (req, res) => {
  try {
    const { email, format = 'json', platform, days = 30, reportType = 'basic' } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Handle PDF report generation
    if (format === 'pdf') {
      const pdfResult = await reportGenerator.generatePDFReport(profile.id, {
        days: parseInt(days),
        platform,
        reportType
      });

      if (pdfResult.success) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${pdfResult.filename}"`);
        return res.send(pdfResult.buffer);
      } else {
        return res.status(500).json({
          success: false,
          error: pdfResult.error
        });
      }
    }

    // Handle enhanced CSV report
    if (format === 'csv-enhanced') {
      const csvResult = await reportGenerator.generateCSVReport(profile.id, {
        days: parseInt(days),
        platform
      });

      if (csvResult.success) {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${csvResult.filename}"`);
        return res.send(csvResult.content);
      } else {
        return res.status(500).json({
          success: false,
          error: csvResult.error
        });
      }
    }

    // Calculate date range for basic exports
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all data for export
    let query = supabase
      .from('content_posts')
      .select(`
        *,
        post_metrics (*)
      `)
      .eq('user_id', profile.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data: posts, error: postsError } = await query;

    if (postsError) {
      return res.status(500).json({
        success: false,
        error: postsError.message
      });
    }

    // Format data for export
    const exportData = posts?.map(post => {
      const metrics = post.post_metrics?.[0] || {};
      return {
        postId: post.id,
        platform: post.platform,
        content: post.content,
        createdAt: post.created_at,
        scheduledFor: post.scheduled_for,
        status: post.status,
        views: metrics.views || 0,
        likes: metrics.likes || 0,
        shares: metrics.shares || 0,
        comments: metrics.comments || 0,
        saves: metrics.saves || 0,
        reach: metrics.reach || 0,
        impressions: metrics.impressions || 0,
        engagementRate: metrics.views > 0 ? 
          (((metrics.likes || 0) + (metrics.shares || 0) + (metrics.comments || 0)) / metrics.views * 100).toFixed(2) : 0
      };
    }) || [];

    if (format === 'csv') {
      // Convert to CSV format
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${email}-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.send(csvContent);
    }

    // Default JSON response
    res.json({
      success: true,
      data: exportData,
      summary: {
        totalPosts: exportData.length,
        totalViews: exportData.reduce((sum, post) => sum + parseInt(post.views), 0),
        totalEngagement: exportData.reduce((sum, post) => sum + parseInt(post.likes) + parseInt(post.shares) + parseInt(post.comments), 0),
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('Analytics export error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync social media data for a user
router.post('/sync', async (req, res) => {
  try {
    const { email, platform } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return mock sync result
    const mockSyncResult = {
      success: true,
      synced_posts: 5,
      updated_metrics: 12,
      platform: platform || 'all',
      sync_time: new Date().toISOString()
    };

    res.json({
      success: true,
      sync: mockSyncResult,
      message: platform ? `${platform} data synced successfully` : 'All connected accounts synced successfully'
    });

  } catch (error) {
    console.error('Analytics sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Connect a social media account
router.post('/connect', async (req, res) => {
  try {
    const { email, platform, accessToken, refreshToken, platformUserData } = req.body;
    
    if (!email || !platform || !accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Email, platform, and accessToken are required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return mock connection result
    const mockResult = {
      success: true,
      account_id: Date.now().toString(),
      platform: platform,
      username: platformUserData?.username || 'user123',
      connected_at: new Date().toISOString(),
      message: `${platform} account connected successfully`
    };

    res.json(mockResult);

  } catch (error) {
    console.error('Connect account error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get connected social accounts for a user
router.get('/accounts', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get connected accounts (without tokens for security)
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('id, platform, username, display_name, profile_picture_url, is_active, connected_at, last_sync_at')
      .eq('user_id', profile.id)
      .eq('is_active', true);

    if (accountsError) {
      return res.status(500).json({
        success: false,
        error: accountsError.message
      });
    }

    res.json({
      success: true,
      accounts: accounts || []
    });

  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Disconnect a social media account
router.delete('/accounts/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Deactivate the account (don't delete to preserve historical data)
    const { data, error } = await supabase
      .from('social_accounts')
      .update({ 
        is_active: false,
        updated_at: new Date()
      })
      .eq('id', accountId)
      .eq('user_id', profile.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Account not found or not owned by user'
      });
    }

    res.json({
      success: true,
      message: `${data.platform} account disconnected successfully`
    });

  } catch (error) {
    console.error('Disconnect account error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get sync status for user accounts
router.get('/sync/status', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get sync status for all accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('social_accounts')
      .select('platform, last_sync_at, is_active')
      .eq('user_id', profile.id)
      .eq('is_active', true);

    if (accountsError) {
      return res.status(500).json({
        success: false,
        error: accountsError.message
      });
    }

    // Calculate sync status
    const now = new Date();
    const syncStatus = accounts.map(account => {
      const lastSync = account.last_sync_at ? new Date(account.last_sync_at) : null;
      const hoursSinceSync = lastSync ? (now - lastSync) / (1000 * 60 * 60) : null;
      
      return {
        platform: account.platform,
        lastSync: lastSync ? lastSync.toISOString() : null,
        hoursSinceLastSync: hoursSinceSync ? Math.round(hoursSinceSync * 10) / 10 : null,
        needsSync: !lastSync || hoursSinceSync > 24, // Needs sync if no sync or > 24 hours
        isActive: account.is_active
      };
    });

    res.json({
      success: true,
      syncStatus,
      totalAccounts: accounts.length,
      needsSyncCount: syncStatus.filter(s => s.needsSync).length
    });

  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get cache statistics (admin endpoint)
router.get('/cache/stats', async (req, res) => {
  try {
    const mockStats = {
      success: true,
      cache: {
        entries: 0,
        hits: 0,
        misses: 0,
        memoryUsageMB: '0.00'
      }
    };
    
    res.json(mockStats);

  } catch (error) {
    console.error('Cache stats error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear cache (admin endpoint)
router.post('/cache/clear', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Cache cleared (mock response)'
    });

  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Preload user data (admin endpoint)
router.post('/cache/preload', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter required'
      });
    }

    res.json({
      success: true,
      message: `Data preloaded for user: ${email} (mock response)`
    });

  } catch (error) {
    console.error('Cache preload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;