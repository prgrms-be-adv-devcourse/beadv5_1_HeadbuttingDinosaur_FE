import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import SellerLayout from './components/SellerLayout'
import AdminLayout from './components/AdminLayout'
import Loading from './components/Loading'
import { VersionedRoute, RequireAuthV2 } from './router-v2'

// 즉시 로드 (비로그인 첫 화면)
import EventList         from './pages/EventList'
import EventDetail       from './pages/EventDetail'
import Login             from './pages/Login'
import Signup            from './pages/Signup'
import NotFound          from './pages/NotFound'

// lazy – 소셜 로그인
const OAuthCallback       = lazy(() => import('./pages/OAuthCallback'))
const SocialProfileSetup  = lazy(() => import('./pages/SocialProfileSetup'))

// lazy – v2 재구축 (router-toggle.plan, Login.plan §6, EventList.plan §10 PR 1, Cart.plan §10.1 / §10.3 PR 5)
const LoginV2             = lazy(() => import('./pages-v2/Login'))
const EventListV2         = lazy(() => import('./pages-v2/EventList'))
const EventDetailV2       = lazy(() => import('./pages-v2/EventDetail'))
const CartV2              = lazy(() => import('./pages-v2/Cart'))
const PaymentSuccessV2    = lazy(() => import('./pages-v2/PaymentCallback/PaymentSuccessPage'))
const PaymentFailV2       = lazy(() => import('./pages-v2/PaymentCallback/PaymentFailPage'))
const PaymentCompleteV2   = lazy(() => import('./pages-v2/PaymentCallback/PaymentCompletePage'))
const MyPageV2            = lazy(() => import('./pages-v2/MyPage'))

// lazy – v2 dev showcase (Landing.plan §12.1 PR 1; cutover/PR 4 cleanup 시 제거)
const TypedTerminalShowcase = lazy(() => import('./pages-v2/_dev/TypedTerminalShowcase'))

// lazy – 로그인 후 접근
const SignupComplete      = lazy(() => import('./pages/SignupComplete'))
const Cart                = lazy(() => import('./pages/Cart'))
const Payment             = lazy(() => import('./pages/Payment'))
const PaymentComplete     = lazy(() => import('./pages/PaymentComplete'))
const MyPage              = lazy(() => import('./pages/MyPage'))
const SellerApply         = lazy(() => import('./pages/SellerApply'))
const PaymentSuccess      = lazy(() => import('./pages/PaymentSuccess'))
const PaymentFail         = lazy(() => import('./pages/PaymentFail'))
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
        <Route path="/login"               element={<VersionedRoute v1={<Login />} v2={<LoginV2 />} />} />
        <Route path="/signup"              element={<Signup />} />
        <Route path="/signup/complete"     element={<SignupComplete />} />

        {/* 소셜 로그인 */}
        <Route path="/oauth/callback"      element={<OAuthCallback />} />
        <Route path="/social/profile-setup" element={<SocialProfileSetup />} />

        {/* v2 dev showcase (cutover/PR 4 cleanup 시 제거) */}
        <Route path="/_dev/typed-terminal" element={<TypedTerminalShowcase />} />

        {/* 일반 사용자 */}
        <Route element={<Layout />}>
          <Route path="/"                       element={<VersionedRoute v1={<EventList />} v2={<EventListV2 />} />} />
          <Route path="/events/:id"             element={<VersionedRoute v1={<EventDetail />} v2={<EventDetailV2 />} />} />
          <Route path="/cart"                   element={<RequireAuth><VersionedRoute v1={<Cart />} v2={<CartV2 />} /></RequireAuth>} />
          <Route path="/payment"                element={<RequireAuth><Payment /></RequireAuth>} />
          <Route path="/payment/complete"       element={<RequireAuth><VersionedRoute v1={<PaymentComplete />} v2={<PaymentCompleteV2 />} /></RequireAuth>} />
          <Route path="/mypage/*"               element={
            <VersionedRoute
              v1={<RequireAuth><MyPage /></RequireAuth>}
              v2={<RequireAuthV2><MyPageV2 /></RequireAuthV2>}
            />
          } />
          <Route path="/seller-apply"           element={<RequireAuth><SellerApply /></RequireAuth>} />
          <Route path="/payment/success"        element={<RequireAuth><VersionedRoute v1={<PaymentSuccess />} v2={<PaymentSuccessV2 />} /></RequireAuth>} />
          <Route path="/payment/fail"           element={<RequireAuth><VersionedRoute v1={<PaymentFail />} v2={<PaymentFailV2 />} /></RequireAuth>} />
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
