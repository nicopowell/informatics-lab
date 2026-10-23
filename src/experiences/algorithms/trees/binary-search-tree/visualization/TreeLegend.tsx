/*
 * Every state the canvas can show, named below the zoom viewport so the
 * legend itself never zooms or pans.
 */
function TreeLegend() {
  return (
    <ul className="legend">
      <li>
        <span className="legend__swatch legend__swatch--node" /> Node
      </li>
      <li>
        <span className="legend__swatch legend__swatch--comparing" /> Comparing
      </li>
      <li>
        <span className="legend__swatch legend__swatch--route" /> On the route
      </li>
      <li>
        <span className="legend__swatch legend__swatch--success" /> Found or new
      </li>
      <li>
        <span className="legend__swatch legend__swatch--discarded" /> Discarded
        subtree
      </li>
      <li>
        <span className="legend__swatch legend__swatch--gap" /> Empty slot
      </li>
    </ul>
  )
}

export default TreeLegend
