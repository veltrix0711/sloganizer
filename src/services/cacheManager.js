import { supabase } from './supabase.js';

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 15 * 60 * 1000; // 15 minutes
    this.cleanupInterval = 5 * 60 * 1000; // 5 minutes
    
    // Start cleanup interval
    this.startCleanup();
  }

  // Generate cache key
  generateKey(prefix, ...params) {
    return `${prefix}:${params.join(':')}`;
  }

  // Set cache with TTL
  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
  }

  // Get from cache
  get(key) {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.value;
  }

  // Delete from cache
  delete(key) {
    return this.cache.delete(key);
  }

  // Clear cache by pattern
  clearPattern(pattern) {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, data] of this.cache.entries()) {
      if (now > data.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Estimate memory usage
  getMemoryUsage() {
    let size = 0;
    for (const [key, data] of this.cache.entries()) {
      size += JSON.stringify(key).length;
      size += JSON.stringify(data.value).length;
      size += 24; // Approximate overhead
    }
    return size;
  }

  // Start cleanup interval
  startCleanup() {
    setInterval(() => {
      this.cleanup();
    }, this.cleanupInterval);
  }

  // Clean expired entries
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, data] of this.cache.entries()) {
      if (now > data.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`Cache cleanup: removed ${keysToDelete.length} expired entries`);
    }
  }

  // Cache analytics overview
  async cacheAnalyticsOverview(userId, email, ttl = this.defaultTTL) {
    const key = this.generateKey('analytics_overview', userId);
    
    // Check cache first
    const cached = this.get(key);
    if (cached) {
      return { success: true, data: cached, fromCache: true };
    }

    try {
      // Get fresh data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: posts, error: postsError } = await supabase
        .from('content_posts')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const { data: metrics, error: metricsError } = await supabase
        .from('post_metrics')
        .select('*')
        .in('post_id', (posts || []).map(p => p.id));

      if (metricsError) throw metricsError;

      // Calculate overview stats
      const totalPosts = posts?.length || 0;
      const totalViews = metrics?.reduce((sum, m) => sum + (m.views || 0), 0) || 0;
      const totalLikes = metrics?.reduce((sum, m) => sum + (m.likes || 0), 0) || 0;
      const totalShares = metrics?.reduce((sum, m) => sum + (m.shares || 0), 0) || 0;
      const totalComments = metrics?.reduce((sum, m) => sum + (m.comments || 0), 0) || 0;

      const engagementRate = totalViews > 0 ? 
        ((totalLikes + totalShares + totalComments) / totalViews * 100).toFixed(2) : 0;

      // Platform breakdown
      const platformStats = {};
      posts?.forEach(post => {
        if (!platformStats[post.platform]) {
          platformStats[post.platform] = { posts: 0, views: 0, engagement: 0 };
        }
        platformStats[post.platform].posts++;
        
        const postMetrics = metrics?.filter(m => m.post_id === post.id) || [];
        postMetrics.forEach(m => {
          platformStats[post.platform].views += m.views || 0;
          platformStats[post.platform].engagement += (m.likes || 0) + (m.shares || 0) + (m.comments || 0);
        });
      });

      const overview = {
        totalPosts,
        totalViews,
        totalLikes,
        totalShares,
        totalComments,
        engagementRate: parseFloat(engagementRate),
        platformStats,
        dateRange: {
          from: thirtyDaysAgo.toISOString(),
          to: new Date().toISOString()
        }
      };

      // Cache the result
      this.set(key, overview, ttl);

      return { success: true, data: overview, fromCache: false };

    } catch (error) {
      console.error('Error caching analytics overview:', error);
      return { success: false, error: error.message };
    }
  }

  // Cache analytics metrics
  async cacheAnalyticsMetrics(userId, platform, days, ttl = this.defaultTTL) {
    const key = this.generateKey('analytics_metrics', userId, platform || 'all', days);
    
    // Check cache first
    const cached = this.get(key);
    if (cached) {
      return { success: true, data: cached, fromCache: true };
    }

    try {
      // Calculate date range
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      // Build query
      let query = supabase
        .from('content_posts')
        .select(`
          *,
          post_metrics (*)
        `)
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data: posts, error: postsError } = await query;

      if (postsError) throw postsError;

      // Process data for charts
      const dailyMetrics = {};
      const platformMetrics = {};

      posts?.forEach(post => {
        const date = post.created_at.split('T')[0];
        const postPlatform = post.platform;

        // Initialize daily metrics
        if (!dailyMetrics[date]) {
          dailyMetrics[date] = {
            date,
            posts: 0,
            views: 0,
            likes: 0,
            shares: 0,
            comments: 0
          };
        }

        // Initialize platform metrics
        if (!platformMetrics[postPlatform]) {
          platformMetrics[postPlatform] = {
            platform: postPlatform,
            posts: 0,
            totalViews: 0,
            totalLikes: 0,
            totalShares: 0,
            totalComments: 0,
            avgEngagement: 0
          };
        }

        dailyMetrics[date].posts++;
        platformMetrics[postPlatform].posts++;

        // Add metrics data
        post.post_metrics?.forEach(metric => {
          dailyMetrics[date].views += metric.views || 0;
          dailyMetrics[date].likes += metric.likes || 0;
          dailyMetrics[date].shares += metric.shares || 0;
          dailyMetrics[date].comments += metric.comments || 0;

          platformMetrics[postPlatform].totalViews += metric.views || 0;
          platformMetrics[postPlatform].totalLikes += metric.likes || 0;
          platformMetrics[postPlatform].totalShares += metric.shares || 0;
          platformMetrics[postPlatform].totalComments += metric.comments || 0;
        });
      });

      // Calculate average engagement for platforms
      Object.values(platformMetrics).forEach(platform => {
        if (platform.totalViews > 0) {
          platform.avgEngagement = (
            (platform.totalLikes + platform.totalShares + platform.totalComments) /
            platform.totalViews * 100
          ).toFixed(2);
        }
      });

      const metrics = {
        dailyMetrics: Object.values(dailyMetrics).sort((a, b) => a.date.localeCompare(b.date)),
        platformMetrics: Object.values(platformMetrics),
        totalPosts: posts?.length || 0,
        dateRange: {
          from: startDate.toISOString(),
          to: new Date().toISOString(),
          days: parseInt(days)
        }
      };

      // Cache the result
      this.set(key, metrics, ttl);

      return { success: true, data: metrics, fromCache: false };

    } catch (error) {
      console.error('Error caching analytics metrics:', error);
      return { success: false, error: error.message };
    }
  }

  // Cache top posts
  async cacheTopPosts(userId, limit, platform, ttl = this.defaultTTL) {
    const key = this.generateKey('top_posts', userId, limit, platform || 'all');
    
    // Check cache first
    const cached = this.get(key);
    if (cached) {
      return { success: true, data: cached, fromCache: true };
    }

    try {
      // Build query for posts with metrics
      let query = supabase
        .from('content_posts')
        .select(`
          *,
          post_metrics (*)
        `)
        .eq('user_id', userId);

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data: posts, error: postsError } = await query;

      if (postsError) throw postsError;

      // Calculate performance scores and sort
      const postsWithScores = posts?.map(post => {
        const metrics = post.post_metrics?.[0] || {};
        const totalEngagement = (metrics.likes || 0) + (metrics.shares || 0) + (metrics.comments || 0);
        const views = metrics.views || 0;
        const engagementRate = views > 0 ? (totalEngagement / views * 100) : 0;
        
        return {
          ...post,
          metrics: metrics,
          performanceScore: totalEngagement + (views * 0.1), // Weighted score
          engagementRate: engagementRate.toFixed(2)
        };
      }).sort((a, b) => b.performanceScore - a.performanceScore) || [];

      const topPosts = postsWithScores.slice(0, parseInt(limit));

      // Cache the result
      this.set(key, topPosts, ttl);

      return { success: true, data: topPosts, fromCache: false };

    } catch (error) {
      console.error('Error caching top posts:', error);
      return { success: false, error: error.message };
    }
  }

  // Invalidate user cache
  invalidateUserCache(userId) {
    this.clearPattern(`analytics_overview:${userId}`);
    this.clearPattern(`analytics_metrics:${userId}`);
    this.clearPattern(`top_posts:${userId}`);
    console.log(`Invalidated cache for user: ${userId}`);
  }

  // Preload frequently accessed data
  async preloadUserData(userId, email) {
    try {
      console.log(`Preloading data for user: ${userId}`);
      
      // Preload with longer TTL for commonly accessed data
      const longTTL = 60 * 60 * 1000; // 1 hour
      
      await Promise.all([
        this.cacheAnalyticsOverview(userId, email, longTTL),
        this.cacheAnalyticsMetrics(userId, null, 30, longTTL),
        this.cacheTopPosts(userId, 10, null, longTTL)
      ]);
      
      console.log(`Successfully preloaded data for user: ${userId}`);
    } catch (error) {
      console.error(`Failed to preload data for user ${userId}:`, error);
    }
  }
}

// Export singleton instance
const cacheManager = new CacheManager();
export default cacheManager;