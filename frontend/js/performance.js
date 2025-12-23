/**
 * Co-Fleeter Performance Utilities
 * Debounce, throttle, and virtual scrolling helpers
 */

class PerformanceUtils {
    /**
     * Debounce function - delays execution until after wait time has elapsed
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function - limits execution to once per wait time
     * @param {Function} func - Function to throttle
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Throttled function
     */
    throttle(func, wait = 300) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, wait);
            }
        };
    }

    /**
     * Memoize function results
     * @param {Function} func - Function to memoize
     * @returns {Function} Memoized function
     */
    memoize(func) {
        const cache = new Map();
        return function (...args) {
            const key = JSON.stringify(args);
            if (cache.has(key)) {
                return cache.get(key);
            }
            const result = func(...args);
            cache.set(key, result);
            return result;
        };
    }

    /**
     * Lazy load images
     * @param {string} selector - CSS selector for images
     */
    lazyLoadImages(selector = 'img[data-src]') {
        const images = document.querySelectorAll(selector);

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Virtual scrolling for large lists
     * @param {HTMLElement} container - Container element
     * @param {Array} items - Array of items to render
     * @param {Function} renderItem - Function to render each item
     * @param {number} itemHeight - Height of each item in pixels
     */
    virtualScroll(container, items, renderItem, itemHeight = 50) {
        const totalHeight = items.length * itemHeight;
        const visibleCount = Math.ceil(container.clientHeight / itemHeight);
        const buffer = 5; // Extra items to render above/below viewport

        let scrollTop = 0;

        const render = () => {
            const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
            const endIndex = Math.min(items.length, startIndex + visibleCount + buffer * 2);

            const visibleItems = items.slice(startIndex, endIndex);
            const offsetY = startIndex * itemHeight;

            container.innerHTML = `
                <div style="height: ${totalHeight}px; position: relative;">
                    <div style="transform: translateY(${offsetY}px);">
                        ${visibleItems.map(item => renderItem(item)).join('')}
                    </div>
                </div>
            `;
        };

        const handleScroll = this.throttle(() => {
            scrollTop = container.scrollTop;
            render();
        }, 16); // ~60fps

        container.addEventListener('scroll', handleScroll);
        render();

        return () => container.removeEventListener('scroll', handleScroll);
    }

    /**
     * Measure performance of a function
     * @param {Function} func - Function to measure
     * @param {string} label - Label for the measurement
     */
    async measurePerformance(func, label = 'Function') {
        const start = performance.now();
        const result = await func();
        const end = performance.now();
        console.log(`${label} took ${(end - start).toFixed(2)}ms`);
        return result;
    }

    /**
     * Request idle callback wrapper
     * @param {Function} callback - Callback to execute when idle
     */
    runWhenIdle(callback) {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback);
        } else {
            setTimeout(callback, 1);
        }
    }

    /**
     * Batch DOM updates
     * @param {Function} updateFunc - Function that performs DOM updates
     */
    batchDOMUpdates(updateFunc) {
        requestAnimationFrame(() => {
            updateFunc();
        });
    }

    /**
     * Optimize event listeners
     * @param {HTMLElement} parent - Parent element
     * @param {string} eventType - Event type
     * @param {string} selector - Child selector
     * @param {Function} handler - Event handler
     */
    delegateEvent(parent, eventType, selector, handler) {
        parent.addEventListener(eventType, (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        });
    }

    /**
     * Preload resources
     * @param {Array} urls - Array of resource URLs
     * @param {string} type - Resource type ('script', 'style', 'image')
     */
    preloadResources(urls, type = 'script') {
        urls.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = url;
            link.as = type;
            document.head.appendChild(link);
        });
    }

    /**
     * Check if element is in viewport
     * @param {HTMLElement} element - Element to check
     * @returns {boolean} Is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// Create global instance
const performanceUtils = new PerformanceUtils();
