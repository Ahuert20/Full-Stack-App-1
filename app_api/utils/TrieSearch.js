/**
 * Trie Data Structure for Trip Search Autocomplete
 * 
 * I built this to replace the slow linear search that was checking every single trip one by one. A Trie organizes words by their
 * characters so we can find prefix matches really fast instead of scanning the whole database every time someone types in the search box.

 * Time complexity: O(p + k) where p = prefix length, k = results
 * Space complexity: O(n * m) where n = words, m = average word length
 * 
 * @module utils/TrieSearch
 */

/**
 * Represents a single node in the Trie
 * Each node holds one character and links to child nodes
 */
class TrieNode {
    constructor() {
        // Each child is a letter a-z or space
        this.children = {};
        // If this node ends a word, store the trip data here
        this.isEndOfWord = false;
        this.trips = [];
    }
}

/**
 * Trie data structure for fast prefix-based trip search
 * Indexes trip names and resort locations for autocomplete
 */
class TrieSearch {
    constructor() {
        this.root = new TrieNode();
        this.totalWords = 0;
    }

    /**
     * Insert a word and its associated trip into the Trie
     * @param {string} word - The word to insert (trip name or resort)
     * @param {Object} trip - The trip object to associate with this word
     */
    insert(word, trip) {
        if (!word || typeof word !== 'string') return;

        // Normalize to lowercase for case-insensitive search
        const normalized = word.toLowerCase().trim();
        let current = this.root;

        for (const char of normalized) {
            // Skip non-alphanumeric characters except spaces
            if (!/[a-z0-9 ]/.test(char)) continue;

            if (!current.children[char]) {
                current.children[char] = new TrieNode();
            }
            current = current.children[char];
        }

        // Mark end of word and store trip reference
        current.isEndOfWord = true;

        // Only add trip if it isnt already stored at this node
        const alreadyExists = current.trips.some(t => 
            t._id && trip._id && t._id.toString() === trip._id.toString()
        );

        if (!alreadyExists) {
            current.trips.push(trip);
            this.totalWords++;
        }
    }

    /**
     * Search for all trips matching a given prefix
     * This is the core of the autocomplete - finds everything
     * that starts with whatever the user has typed so far
     * 
     * @param {string} prefix - The search prefix typed by the user
     * @param {number} limit - Max results to return (default 10)
     * @returns {Array} Array of matching trip objects
     */
    search(prefix, limit = 10) {
        if (!prefix || typeof prefix !== 'string') return [];

        const normalized = prefix.toLowerCase().trim();
        let current = this.root;

        // Navigate to the end of the prefix
        for (const char of normalized) {
            if (!/[a-z0-9 ]/.test(char)) continue;

            if (!current.children[char]) {
                // Prefix not found in trie
                return [];
            }
            current = current.children[char];
        }

        // Collect all trips from this node downward
        const results = [];
        this._collectTrips(current, results, limit);
        return results;
    }

    /**
     * Recursively collect all trips from a node and its children
     * Basically a depth-first search through the subtree
     * 
     * @param {TrieNode} node - Starting node
     * @param {Array} results - Array to push results into
     * @param {number} limit - Stop collecting after this many results
     */
    _collectTrips(node, results, limit) {
        if (results.length >= limit) return;

        // If this node marks the end of a word, add its trips
        if (node.isEndOfWord && node.trips.length > 0) {
            for (const trip of node.trips) {
                if (results.length >= limit) break;

                // Avoid duplicate trips in results
                const isDuplicate = results.some(r => 
                    r._id && trip._id && r._id.toString() === trip._id.toString()
                );

                if (!isDuplicate) {
                    results.push(trip);
                }
            }
        }

        // Recurse through all children
        for (const char in node.children) {
            if (results.length >= limit) break;
            this._collectTrips(node.children[char], results, limit);
        }
    }

    /**
     * Remove a trip from the Trie when it gets deleted or updated
     * @param {string} word - The word associated with the trip
     * @param {string} tripId - The MongoDB ID of the trip to remove
     */
    remove(word, tripId) {
        if (!word || !tripId) return;

        const normalized = word.toLowerCase().trim();
        let current = this.root;

        for (const char of normalized) {
            if (!/[a-z0-9 ]/.test(char)) continue;
            if (!current.children[char]) return;
            current = current.children[char];
        }

        if (current.isEndOfWord) {
            current.trips = current.trips.filter(t => 
                t._id.toString() !== tripId.toString()
            );

            if (current.trips.length === 0) {
                current.isEndOfWord = false;
                this.totalWords--;
            }
        }
    }

    /**
     * Rebuild the entire Trie from a fresh list of trips
     * Called on startup and whenever trips are modified
     * @param {Array} trips - Array of trip objects from database
     */
    rebuild(trips) {
        this.root = new TrieNode();
        this.totalWords = 0;

        for (const trip of trips) {
            // Index by trip name
            if (trip.name) this.insert(trip.name, trip);

            // Index by resort location
            if (trip.resort) this.insert(trip.resort, trip);

            // Index individual words in trip name for partial matching
            if (trip.name) {
                const words = trip.name.split(' ');
                for (const word of words) {
                    if (word.length > 2) {
                        this.insert(word, trip);
                    }
                }
            }
        }

        console.log(`Trie rebuilt with ${this.totalWords} entries from ${trips.length} trips`);
    }

    /**
     * Get stats about the current Trie state
     * Useful for debugging and monitoring
     * @returns {Object} Stats object
     */
    getStats() {
        return {
            totalWords: this.totalWords,
            hasData: this.totalWords > 0
        };
    }
}

module.exports = TrieSearch;