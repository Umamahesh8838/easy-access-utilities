/**
 * Performance Budget Monitoring
 * Tracks key performance metrics and warns when budgets are exceeded
 */

interface PerformanceBudget {
  // Core Web Vitals budgets
  lcp: number; // Largest Contentful Paint (ms)
  fcp: number; // First Contentful Paint (ms)
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay (ms)
  
  // Resource budgets
  totalJSSize: number; // Total JavaScript size (KB)
  totalCSSSize: number; // Total CSS size (KB)
  totalImageSize: number; // Total image size (KB)
  
  // Network budgets
  httpRequests: number; // Maximum HTTP requests
  loadTime: number; // Total page load time (ms)
}

const PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500,     // 2.5 seconds
  fcp: 1800,     // 1.8 seconds
  cls: 0.1,      // 0.1 layout shift score
  fid: 100,      // 100ms
  totalJSSize: 1000,  // 1MB
  totalCSSSize: 100,  // 100KB
  totalImageSize: 500, // 500KB
  httpRequests: 50,   // 50 requests
  loadTime: 3000,     // 3 seconds
};

export class PerformanceBudgetMonitor {
  private violations: string[] = [];

  checkCoreWebVitals() {
    if (typeof window === 'undefined') return;

    // Check LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry.startTime > PERFORMANCE_BUDGET.lcp) {
        this.addViolation(`LCP exceeded budget: ${Math.round(lastEntry.startTime)}ms > ${PERFORMANCE_BUDGET.lcp}ms`);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Check FCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.startTime > PERFORMANCE_BUDGET.fcp) {
          this.addViolation(`FCP exceeded budget: ${Math.round(entry.startTime)}ms > ${PERFORMANCE_BUDGET.fcp}ms`);
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // Check CLS
    new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      if (clsValue > PERFORMANCE_BUDGET.cls) {
        this.addViolation(`CLS exceeded budget: ${clsValue.toFixed(3)} > ${PERFORMANCE_BUDGET.cls}`);
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  checkResourceSizes() {
    if (typeof window === 'undefined') return;

    setTimeout(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      let totalJS = 0;
      let totalCSS = 0;
      let totalImages = 0;
      let httpRequests = resources.length;

      resources.forEach((resource) => {
        const size = resource.transferSize || 0;
        const sizeKB = size / 1024;

        if (resource.name.includes('.js')) {
          totalJS += sizeKB;
        } else if (resource.name.includes('.css')) {
          totalCSS += sizeKB;
        } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          totalImages += sizeKB;
        }
      });

      // Check budgets
      if (totalJS > PERFORMANCE_BUDGET.totalJSSize) {
        this.addViolation(`JavaScript size exceeded budget: ${Math.round(totalJS)}KB > ${PERFORMANCE_BUDGET.totalJSSize}KB`);
      }

      if (totalCSS > PERFORMANCE_BUDGET.totalCSSSize) {
        this.addViolation(`CSS size exceeded budget: ${Math.round(totalCSS)}KB > ${PERFORMANCE_BUDGET.totalCSSSize}KB`);
      }

      if (totalImages > PERFORMANCE_BUDGET.totalImageSize) {
        this.addViolation(`Image size exceeded budget: ${Math.round(totalImages)}KB > ${PERFORMANCE_BUDGET.totalImageSize}KB`);
      }

      if (httpRequests > PERFORMANCE_BUDGET.httpRequests) {
        this.addViolation(`HTTP requests exceeded budget: ${httpRequests} > ${PERFORMANCE_BUDGET.httpRequests}`);
      }

      // Check load time
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      if (loadTime > PERFORMANCE_BUDGET.loadTime) {
        this.addViolation(`Load time exceeded budget: ${loadTime}ms > ${PERFORMANCE_BUDGET.loadTime}ms`);
      }

      this.reportViolations();
    }, 5000); // Check after 5 seconds
  }

  private addViolation(violation: string) {
    this.violations.push(violation);
    console.warn(`⚠️ Performance Budget Violation: ${violation}`);
  }

  private reportViolations() {
    if (this.violations.length === 0) {
      console.log('✅ All performance budgets met!');
      return;
    }

    console.group('🚨 Performance Budget Report');
    console.log(`Found ${this.violations.length} violation(s):`);
    this.violations.forEach((violation, index) => {
      console.log(`${index + 1}. ${violation}`);
    });
    console.groupEnd();

    // Send to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_budget_violation', {
        event_category: 'Performance',
        event_label: 'Budget Exceeded',
        value: this.violations.length,
      });
    }
  }

  public getViolations(): string[] {
    return [...this.violations];
  }

  public reset() {
    this.violations = [];
  }
}

// Initialize monitoring in development
export const initPerformanceBudgetMonitoring = () => {
  if (import.meta.env.DEV) {
    const monitor = new PerformanceBudgetMonitor();
    
    // Start monitoring when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        monitor.checkCoreWebVitals();
        monitor.checkResourceSizes();
      });
    } else {
      monitor.checkCoreWebVitals();
      monitor.checkResourceSizes();
    }
    
    return monitor;
  }
  return null;
};
