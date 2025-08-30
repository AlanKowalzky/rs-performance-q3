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

This section documents the performance analysis of the application as required by the task.

## Initial Profiling (Before Optimization)

*This section should be filled out based on the application's state **before** adding `useMemo`, `useCallback`, and `React.memo`.*

### Interactions Measured

The following user interactions were recorded using the React Dev Tools Profiler:

1.  **Sorting by Name:** Clicking the 'Sort by Name' button.
2.  **Sorting by Population:** Clicking the 'Sort by Population' button.
3.  **Searching:** Typing a query into the search bar (e.g., "Poland").
4.  **Changing Year:** Selecting a different year from the dropdown.
5.  **Changing Columns:** Opening the modal, selecting/deselecting a column, and saving.

### Findings

*TODO: Briefly describe the performance here. Note any slow components, long commit durations, or unnecessary re-renders identified in the Flame Graph and Ranked Chart.*

### Screenshots

*TODO: Add screenshots from the Profiler for the interactions listed above. Focus on the Flame Graph and Ranked Chart for each.*

**Example Screenshot:**

`[Insert Screenshot of Profiler for Sorting]`

## Profiling After Optimization

*This section documents the performance **after** implementing `useMemo`, `useCallback`, and `React.memo`.*

### Findings & Comparison

*TODO: Describe the new performance results. Compare them directly to the initial profiling. Note the improvements in commit duration, the reduction in re-renders for specific components (e.g., `CountryListItem`), and how the Flame Graph has changed.*

### Screenshots

*TODO: Add new screenshots from the Profiler for the same set of interactions. This will visually demonstrate the impact of the optimizations.*

**Example Screenshot:**

`[Insert Screenshot of Post-Optimization Profiler for Sorting]`