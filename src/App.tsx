import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import SellerLayout from './components/SellerLayout'
import AdminLayout from './components/AdminLayout'
import Loading from './components/Loading'
import { RequireAuthV2 } from './router-v2'

// 즉시 로드 (비로그인 첫 화면)
import Signup            from './pages/Signup'
import NotFound          from './pages/NotFound'

// lazy – 소셜 로그인
const OAuthCallback       = lazy(() => import('./pages/OAuthCallback'))
const SocialProfileSetup  = lazy(() => import('./pages/SocialProfileSetup'))

// lazy – v2 재구축 (router-toggle.plan, Login.plan §6, EventList.plan §10 PR 1, Cart.plan §10.1 / §10.3 PR 5, Landing.plan §12.4 PR 4)
const LoginV2             = lazy(() => import('./pages-v2/Login'))
const EventListV2         = lazy(() => import('./pages-v2/EventList'))
const EventDetailV2       = lazy(() => import('./pages-v2/EventDetail'))
const CartV2              = lazy(() => import('./pages-v2/Cart'))
const PaymentSuccessV2    = lazy(() => import('./pages-v2/PaymentCallback/PaymentSuccessPage'))
const PaymentFailV2       = lazy(() => import('./pages-v2/PaymentCallback/PaymentFailPage'))
const PaymentCompleteV2   = lazy(() => import('./pages-v2/PaymentCallback/PaymentCompletePage'))
const MyPageV2            = lazy(() => import('./pages-v2/MyPage'))
const LandingV2           = lazy(() => import('./pages-v2/Landing'))

// lazy – 로그인 후 접근
const SignupComplete      = lazy(() => import('./pages/SignupComplete'))
const Payment             = lazy(() => import('./pages/Payment'))
const SellerApply         = lazy(() => import('./pages/SellerApply'))
const WalletChargeSuccess = lazy(() => import('./pages/WalletChargeSuccess'))
const WalletChargeFail    = lazy(() => import('./pages/WalletChargeFail'))

// lazy – 판매자
const SellerDashboard   = lazy(() => import('./pages/seller/SellerDashboard'))
const SellerEventCreate = lazy(() => import('./pages/seller/SellerEventCreate'))
const SellerEventEdit   = lazy(() => import('./pages/seller/SellerEventEdit'))
const SellerEventDetail = lazy(() => import('./pages/seller/SellerEventDetail'))
const SellerSettlement  = lazy(() => import('./pages/seller/SellerSettlement'))

// lazy – 관리자
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers        = lazy(() => import('./pages/admin/AdminUsers'))
const AdminEvents       = lazy(() => import('./pages/admin/AdminEvents'))
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'))
const AdminSettlements  = lazy(() => import('./pages/admin/AdminSettlements'))
const AdminTechStacks   = lazy(() => import('./pages/admin/AdminTechStacks'))

// ── 가드 ──────────────────────────────────────────────────────────
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth()
  if (isLoading) return <Loading fullscreen />
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireSeller({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAuth()
  if (isLoading) return <Loading fullscreen />
  if (role !== 'SELLER' && role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { role, isLoading } = useAuth()
  if (isLoading) return <Loading fullscreen />
  if (role !== 'ADMIN') return <Navigate to="/" replace />
  return <>{children}</>
}

// ── 앱 ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Suspense fallback={<Loading fullscreen />}>
      <Routes>
        {/* 공개 */}
        <Route path="/login"               element={<LoginV2 />} />
        <Route path="/signup"              element={<Signup />} />
        <Route path="/signup/complete"     element={<SignupComplete />} />

        {/* 소셜 로그인 */}
        <Route path="/oauth/callback"      element={<OAuthCallback />} />
        <Route path="/social/profile-setup" element={<SocialProfileSetup />} />

        {/* 일반 사용자 */}
        <Route element={<Layout />}>
          <Route path="/"                       element={<LandingV2 />} />
          <Route path="/events"                 element={<EventListV2 />} />
          <Route path="/events/:id"             element={<EventDetailV2 />} />
          <Route path="/cart"                   element={<RequireAuth><CartV2 /></RequireAuth>} />
          <Route path="/payment"                element={<RequireAuth><Payment /></RequireAuth>} />
          <Route path="/payment/complete"       element={<RequireAuth><PaymentCompleteV2 /></RequireAuth>} />
          <Route path="/mypage/*"               element={<RequireAuthV2><MyPageV2 /></RequireAuthV2>} />
          <Route path="/seller-apply"           element={<RequireAuth><SellerApply /></RequireAuth>} />
          <Route path="/payment/success"        element={<RequireAuth><PaymentSuccessV2 /></RequireAuth>} />
          <Route path="/payment/fail"           element={<RequireAuth><PaymentFailV2 /></RequireAuth>} />
          <Route path="/wallet/charge/success"  element={<RequireAuth><WalletChargeSuccess /></RequireAuth>} />
          <Route path="/wallet/charge/fail"     element={<RequireAuth><WalletChargeFail /></RequireAuth>} />
        </Route>

        {/* 판매자 */}
        <Route element={<RequireSeller><SellerLayout /></RequireSeller>}>
          <Route path="/seller"                 element={<SellerDashboard />} />
          <Route path="/seller/events/create"   element={<SellerEventCreate />} />
          <Route path="/seller/events/:id/edit" element={<SellerEventEdit />} />
          <Route path="/seller/events/:id"      element={<SellerEventDetail />} />
          <Route path="/seller/settlements"     element={<SellerSettlement />} />
        </Route>

        {/* 관리자 */}
        <Route element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route path="/admin"              element={<AdminDashboard />} />
          <Route path="/admin/users"        element={<AdminUsers />} />
          <Route path="/admin/events"       element={<AdminEvents />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/settlements"  element={<AdminSettlements />} />
          <Route path="/admin/techstacks"   element={<AdminTechStacks />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
