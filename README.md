# Employee Insights Dashboard

A production-grade React application for employee management, featuring high-performance data grids, custom virtualization, and identity verification modules.

## 🚀 Architecture

Built with **React 19**, **Vite**, and **Tailwind CSS v4**.

-   **Modular Component Design**: Decoupled UI components for high reusability.
-   **State Management**: React Context API (`AuthContext`) for global authentication and state persistence via `localStorage`.
-   **Routing**: Secure route protection using React Router with `PrivateRoute` wrappers.
-   **Performance First**: Custom virtualization logic ensures 10,000+ records can be displayed with minimal DOM footprint.
-   **Native APIs**: Integration with Browser Camera API for profile capture and HTML5 Canvas for digital signatures.

## 📊 Virtualization Logic

The `VirtualizedTable` uses a custom `useVirtualScroll` hook to optimize rendering.

### Math Breakdown:
-   **startIndex**: `floor(scrollTop / rowHeight)`
    -   Determines the first visible row based on how far the user has scrolled.
-   **visibleRows**: `ceil(containerHeight / rowHeight)`
    -   Calculates how many rows can fit in the visible area.
-   **endIndex**: `startIndex + visibleRows + buffer`
    -   The last row to render, adding a small `buffer` to prevent flicker during fast scrolling.
-   **Spacer**: A `div` with `height: totalItemCount * rowHeight` handles the scrollbar size.
-   **Absolute Positioning**: Rows are placed inside the spacer using `translateY(startIndex * rowHeight)` to maintain their correct vertical position.

## 🖼️ Image Merge Logic

The identity verification flow merges a profile photo and an e-signature programmatically:

1.  **Capture**: Photo is captured as a Base64 DataURL from the video stream.
2.  **Draw**: Signature is drawn on a secondary HTML5 Canvas.
3.  **Merge**: A third hidden canvas is created.
4.  **Compose**:
    -   The photo is drawn as the background layer.
    -   A semi-transparent white overlay is applied to the signature area for readability.
    -   The signature canvas is drawn over the photo with a 40% scaling factor.
5.  **Export**: The final result is exported using `canvas.toDataURL('image/png')`.

## 🗺️ City Mapping

City markers are placed on an interactive map using predefined geographic coordinates:

| City | Latitude | Longitude |
| :--- | :--- | :--- |
| Mumbai | 19.0760 | 72.8777 |
| Delhi | 28.7041 | 77.1025 |
| Bangalore | 12.9716 | 77.5946 |
| Chennai | 13.0827 | 80.2707 |

## 🐞 Intentional Performance Bug

**Location**: `src/pages/List.jsx`

**The Bug**:
The `calculateStats` function is called on every single render cycle of the `List` component.

**Why it causes issues**:
1.  **Expensive Computation**: It contains a tight loop running 1,000,000 iterations of `Math.sqrt`, consuming significant CPU cycles.
2.  **Missing Memoization**: It is not wrapped in `useMemo` or `useCallback`.
3.  **Frequent Triggers**: Any state update in the `List` page (like scrolling through the virtualized table) causes the component to re-render, triggering this expensive calculation every time and leading to "jank" and frame drops.

---

Built by Antigravity - Senior React Engineer.
