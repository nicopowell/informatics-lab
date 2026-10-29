import { Outlet } from "react-router"
import SiteBreadcrumb from "./SiteBreadcrumb"
import SiteHeader from "./SiteHeader"
import SiteFooter from "./SiteFooter"

function SiteLayout() {
  return (
    <>
      <SiteHeader />
      <SiteBreadcrumb />
      <main className="site-content">
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}

export default SiteLayout