export class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.metadata = new Map(); // Para guardar metadados como tokens de paginação
    this.lastFullRefresh = Date.now();
    this.FULL_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 horas
  }
  
  set(key, value, ttlSeconds = 300, metadata = {}) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Set the value with metadata
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
      metadata
    });
    
    // Store metadata separately for easy access
    if (Object.keys(metadata).length > 0) {
      this.metadata.set(key, metadata);
    }
    
    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);
    
    this.timers.set(key, timer);
    
    console.log(`Cache SET: ${key} (TTL: ${ttlSeconds}s) with metadata:`, metadata);
  }
  
  get(key) {
    //const item = this.cache.get(key);
    
    //if (!item) {
      //return null;
    //}
    
    // Check if expired
    //if (Date.now() - item.timestamp > item.ttl) {
      //this.delete(key);
      //return null;
    //}
    
    //console.log(`Cache HIT: ${key}`);
    //return item.value;
    return undefined;
  }
  
  getMetadata(key) {
    //return this.metadata.get(key) || {};
    return undefined;
  }
  
  updateMetadata(key, newMetadata) {
    const existing = this.metadata.get(key) || {};
    const updated = { ...existing, ...newMetadata };
    this.metadata.set(key, updated);
    
    // Also update in cache if item exists
    const item = this.cache.get(key);
    if (item) {
      item.metadata = updated;
    }
    
    console.log(`Cache METADATA UPDATE: ${key}`, updated);
  }
  
  // Atualizar dados específicos no cache
  updateCacheData(key, updater) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const originalValue = item.value;
    const updatedValue = updater(originalValue);
    
    // Só atualizar se houve mudança real
    if (JSON.stringify(originalValue) !== JSON.stringify(updatedValue)) {
      item.value = updatedValue;
      item.timestamp = Date.now(); // Refresh timestamp
      console.log(`Cache DATA UPDATE: ${key}`);
      return true;
    }
    
    return false;
  }
  
  // Adicionar novos itens ao cache existente
  appendToCacheData(key, newItems) {
    const item = this.cache.get(key);
    if (!item || !Array.isArray(item.value)) return false;
    
    // Evitar duplicatas baseado no ID
    const existingIds = new Set(item.value.map(item => item.id));
    const uniqueNewItems = newItems.filter(newItem => !existingIds.has(newItem.id));
    
    if (uniqueNewItems.length > 0) {
      item.value = [...item.value, ...uniqueNewItems];
      item.timestamp = Date.now();
      console.log(`Cache APPEND: ${key} - Added ${uniqueNewItems.length} new items (${newItems.length - uniqueNewItems.length} duplicates skipped)`);
      return true;
    }
    
    console.log(`Cache APPEND: ${key} - No new items to add (all ${newItems.length} were duplicates)`);
    return false;
  }
  
  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    // Remove from cache and metadata
    const deleted = this.cache.delete(key);
    this.metadata.delete(key);
    
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
    this.metadata.clear();
    this.lastFullRefresh = Date.now();
    
    console.log('Cache CLEARED - Full refresh timestamp updated');
  }
  
  // Verificar se precisa de refresh completo (24 horas)
  needsFullRefresh() {
    return Date.now() - this.lastFullRefresh > this.FULL_REFRESH_INTERVAL;
  }
  
  // Marcar que foi feito um refresh completo
  markFullRefresh() {
    this.lastFullRefresh = Date.now();
    console.log('Cache FULL REFRESH marked');
  }
  
  // Invalidar caches relacionados por padrão
  invalidatePattern(pattern) {
    const keys = Array.from(this.cache.keys());
    let invalidatedCount = 0;
    
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.delete(key);
        invalidatedCount++;
      }
    });
    
    console.log(`Cache PATTERN INVALIDATION: ${pattern} - Removed ${invalidatedCount} entries`);
    return invalidatedCount;
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
      memoryUsage: JSON.stringify(items).length,
      lastFullRefresh: new Date(this.lastFullRefresh).toISOString(),
      needsFullRefresh: this.needsFullRefresh(),
      metadataKeys: Array.from(this.metadata.keys()),
      cacheKeys: this.keys()
    };
  }
}