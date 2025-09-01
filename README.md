# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\nOpen [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.\nIt correctly bundles React in production mode and optimizes the build for the best performance.

## Learn More

You can learn more in the [Create React App documentation](https://reactjs.org/).

---

# Performance Profiling

### Trial 1: `useMemo` Optimization

This trial focused on a common React optimization technique.

1.  **What was optimized?** The memoization of data passed to the `YearlyDataTable` component within `CountryListItem`.
2.  **What were the assumptions?** The goal was to prevent unnecessary recalculations and re-renders of `YearlyDataTable` by caching the data, which was expected to improve performance.
3.  **Was it successful?** It's not possible to definitively say based on the provided screenshots. The effect was likely minimal because the core performance issue was not data processing.
4.  **What was the effect?** The effect was negligible or unnoticeable as the primary bottleneck was elsewhere, namely the cost of rendering a large number of DOM elements.

---


### Trial 2: Problem Diagnosis

This trial was an analytical step to correctly identify the root cause of the performance issues.

1.  **What was optimized?** Nothing was optimized at this stage. This was a diagnostic phase.
2.  **What were the assumptions?** The goal was to accurately pinpoint the reason for the poor performance, despite the asynchronous data processing handled by a Web Worker.
3.  **Was it successful?** Yes, this was a crucial step. The correct diagnosis was made: the problem was not data processing but the **high cost of rendering** on the main thread because the application was attempting to draw hundreds of elements simultaneously.
4.  **What was the effect?** This led to a critical change in strategy, shifting the focus from data processing to render optimization.

---


### Trial 3: Pagination Implementation

This trial was the successful implementation of a render optimization strategy.

1.  **What was optimized?** The rendering of the country list by implementing **pagination**.
2.  **What were the assumptions?** The assumption was that limiting the number of DOM elements rendered on the screen would drastically reduce the rendering time.
3.  **Was it successful?** Yes, this was the **most effective trial**.
4.  **What was the effect?** The render duration dropped dramatically from over **800 ms** to less than **100 ms**, making the application fast and responsive.

---


### Optimization Results Summary

| Optimization Trial       | Initial Render Duration (ms) | Optimized Render Duration (ms) | Effect                                          |
| :----------------------- | :--------------------------- | :----------------------------- | :---------------------------------------------- |
| **`useMemo`** | 223                          | ~223                           | Marginal/Negligible                             |
| **Diagnosis** | 658.1, 850.9                 | -                              | Shifted focus to render optimization            |
| **Pagination** | 658.1, 850.9                 | 70.8, 87.2                     | **Significant Improvement** (over 90% reduction) |
