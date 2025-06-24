export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }
  
  set(key, value, ttlSeconds = 300) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Set the value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    });
    
    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);
    
    this.timers.set(key, timer);
    
    console.log(`Cache SET: ${key} (TTL: ${ttlSeconds}s)`);
  }
  
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      return null;
    }
    
    console.log(`Cache HIT: ${key}`);
    return item.value;
  }
  
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    // Remove from cache
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      console.log(`Cache DELETE: ${key}`);
    }
    
    return deleted;
  }
  
  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.timers.clear();
    this.cache.clear();
    
    console.log('Cache CLEARED');
  }
  
  size() {
    return this.cache.size;
  }
  
  keys() {
    return Array.from(this.cache.keys());
  }
  
  stats() {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      totalItems: items.length,
      validItems: items.filter(item => now - item.timestamp <= item.ttl).length,
      expiredItems: items.filter(item => now - item.timestamp > item.ttl).length,
      memoryUsage: JSON.stringify(items).length
    };
  }
}