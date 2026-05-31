/**
 * LRU (Least Recently Used) Cache Implementation
 * 
 * Built this to stop the server from hitting the database every single time someone searches for the same thing. The LRU approach means
 * the most recently used results stay in memory while old unused ones get evicted when the cache fills up.
 
 * Uses a hash map for O(1) lookups combined with a doubly linked list to track access order. This is the same approach used by Redis and other production caching systems.
 
 * Time complexity: O(1) for get and set operations
 * Space complexity: O(capacity)
 * 
 * @module utils/LRUCache
 */

/**
 * A single node in the doubly linked list
 * Stores both the cache key and value together
 */
class ListNode {
    /**
     * @param {string} key - Cache key
     * @param {*} value - Cached value
     */
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
        this.timestamp = Date.now();
    }
}

/**
 * LRU Cache using HashMap + Doubly Linked List
 * Most recently used items stay at the head
 * Least recently used items drift to the tail and get evicted
 */
class LRUCache {
    /**
     * @param {number} capacity - Max number of items to store (default 100)
     * @param {number} ttl - Time to live in milliseconds (default 5 minutes)
     */
    constructor(capacity = 100, ttl = 5 * 60 * 1000) {
        this.capacity = capacity;
        this.ttl = ttl;
        this.cache = new Map();

        // Dummy head and tail nodes make insertion/deletion cleaner
        // No need to check for null pointers at the edges
        this.head = new ListNode(null, null); // Most recently used end
        this.tail = new ListNode(null, null); // Least recently used end
        this.head.next = this.tail;
        this.tail.prev = this.head;

        // Track hits and misses for benchmarking
        this.hits = 0;
        this.misses = 0;
        this.evictions = 0;
    }

    /**
     * Get a value from the cache
     * Moves the accessed node to the front (most recently used)
     * Returns null if not found or expired
     * 
     * @param {string} key - Cache key to look up
     * @returns {*} Cached value or null
     */
    get(key) {
        if (!this.cache.has(key)) {
            this.misses++;
            return null;
        }

        const node = this.cache.get(key);

        // Check if the cached data has expired
        if (Date.now() - node.timestamp > this.ttl) {
            this._removeNode(node);
            this.cache.delete(key);
            this.misses++;
            return null;
        }

        // Move to front since it was just used
        this._moveToHead(node);
        this.hits++;
        return node.value;
    }

    /**
     * Store a value in the cache
     * If key exists, update it. If cache is full, evict the LRU item.
     * 
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     */
    set(key, value) {
        if (this.cache.has(key)) {
            // Update existing node and move to front
            const node = this.cache.get(key);
            node.value = value;
            node.timestamp = Date.now();
            this._moveToHead(node);
            return;
        }

        // Create new node and add to front
        const newNode = new ListNode(key, value);
        this.cache.set(key, newNode);
        this._addToHead(newNode);

        // If over capacity, evict the least recently used item
        if (this.cache.size > this.capacity) {
            const lruNode = this._removeTail();
            this.cache.delete(lruNode.key);
            this.evictions++;
        }
    }

    /**
     * Remove a specific key from the cache
     * Called when a trip is updated or deleted so stale data
     * doesnt get served from cache
     * 
     * @param {string} key - Cache key to remove
     */
    delete(key) {
        if (!this.cache.has(key)) return;

        const node = this.cache.get(key);
        this._removeNode(node);
        this.cache.delete(key);
    }

    /**
     * Clear all cached data
     * Called when a major data update happens
     */
    clear() {
        this.cache.clear();
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    /**
     * Get cache performance stats
     * Useful for showing the improvement in the narrative
     * @returns {Object} Stats including hit rate
     */
    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? ((this.hits / total) * 100).toFixed(2) : 0;

        return {
            size: this.cache.size,
            capacity: this.capacity,
            hits: this.hits,
            misses: this.misses,
            evictions: this.evictions,
            hitRate: `${hitRate}%`,
            ttlSeconds: this.ttl / 1000
        };
    }

    // ---- Private helper methods for linked list operations ----

    /**
     * Add a node right after the head (most recently used position)
     * @param {ListNode} node
     */
    _addToHead(node) {
        node.prev = this.head;
        node.next = this.head.next;
        this.head.next.prev = node;
        this.head.next = node;
    }

    /**
     * Remove a node from wherever it is in the list
     * @param {ListNode} node
     */
    _removeNode(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    /**
     * Move an existing node to the head (mark as recently used)
     * @param {ListNode} node
     */
    _moveToHead(node) {
        this._removeNode(node);
        this._addToHead(node);
    }

    /**
     * Remove and return the tail node (least recently used)
     * @returns {ListNode} The evicted node
     */
    _removeTail() {
        const tailNode = this.tail.prev;
        this._removeNode(tailNode);
        return tailNode;
    }
}

module.exports = LRUCache;