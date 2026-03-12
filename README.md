# Employee Insights Dashboard

A production-ready React application showcasing custom virtualization, media capturing, canvas manipulation, and data visualization utilizing raw SVGs without relying on any external component, charting, or virtualization libraries.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Login Credentials:
   - **Username:** `testuser`
   - **Password:** `Test123`

---

## 1. Custom Virtualization Math

The List page (`/list`) implements a highly performant custom virtualized grid to render thousands of rows smoothly by only keeping visible rows inside the DOM.

**Logic Breakdown:**
- **Scroll container**: Contains a large inner `div` determining the total height (`data.length * rowHeight`) to trigger native scrollbars.
- **`scrollTop` Tracking**: We listen to `onScroll` to grab the current scroll position in pixels.
- **Row Calculation**:
  ```javascript
  const start = Math.floor(scrollTop / rowHeight);
  const visibleRowCount = Math.ceil(containerHeight / rowHeight);
  ```
- **Buffer**: We add a `buffer = 5` to render rows slightly off-screen (above and below the viewport) to prevent flickering during fast scrolls.
  ```javascript
  const visibleStartIndex = Math.max(0, start - buffer);
  const visibleEndIndex = Math.min(data.length - 1, start + visibleRowCount + buffer);
  ```
- **Absolute Positioning**: Visibile components are rendered identically but positioned absolutely using `top: ${index * rowHeight}px`, making them snap accurately into the massive blank scrollable div.

## 2. Image Merge Logic

The Details page (`/details/:id`) leverages browser APIs to fetch the webcam feed, draw it along with a manual signature entirely inside isolated HTML5 canvases.

**Logic Breakdown:**
1. **Camera Feed**: We capture frames continuously to a standard `<video>`.
2. **First Canvas (Photo)**: When "Capture Photo" is clicked, we call `ctx.drawImage(video, 0, 0)` onto a dedicated `photoCanvas` drawing exact pixel data.
3. **Second Canvas (Signature)**: An overlaid transparent canvas captures drawing paths directly by calculating `(clientX - rect.left)` over `mousemove/touchmove` events.
4. **Merge Canvas (Offscreen)**: Upon finalizing, we create an invisible `offscreenCanvas` in memory:
   ```javascript
   const offscreenCanvas = document.createElement('canvas');
   const ctx = offscreenCanvas.getContext('2d');
   
   // 1. Draw base photo
   ctx.drawImage(photoCanvasRef.current, 0, 0);
   // 2. Overlay signature
   ctx.drawImage(signatureCanvasRef.current, 0, 0);
   
   // 3. Export
   const finalImage = offscreenCanvas.toDataURL('image/png');
   ```

## 3. Intentional Bug Documentation

**Location:** `src/pages/List.jsx`
**Type:** Stale Closure / Missing Dependency Array inside `useEffect`

**Explanation:**
The API fetch logic consumes `user.username` implicitly from a broader functional scope but omits it in the dependency array:

```javascript
useEffect(() => {
  const fetchData = async () => { ... } // Uses `user.username` inside POST body
  fetchData();
}, []); // <-- Intentional Bug: `user` or `user.username` is missing here.
```

**Why it's a bug:**
If the user's role, locale, or identity abruptly changes mid-session or isn't fully initialized on mount, the `useEffect` acts entirely as a `componentDidMount` hook. It seals off `user.username` into a closure. It will therefore never refetch new data specific to the newest user token unless the component completely unmounts and remounts, leading to fetching errors or stale state representations.

---

*Built with Vite, React 19, and Tailwind CSS v4.*
