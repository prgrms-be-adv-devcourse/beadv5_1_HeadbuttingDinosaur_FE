import { Navigate, Route, Routes } from 'react-router-dom';
import { MyPage as MyPageShell } from './MyPage';
import { TicketsTab } from './tabs/Tickets/TicketsTab';
import { OrdersTab } from './tabs/Orders/OrdersTab';
import { WalletTab } from './tabs/Wallet/WalletTab';
import { RefundTab } from './tabs/Refund/RefundTab';

export function MyPageRouterV2() {
  return (
    <Routes>
      <Route element={<MyPageShell />}>
        <Route index           element={<Navigate to="tickets" replace />} />
        <Route path="tickets"  element={<TicketsTab />} />
        <Route path="orders"   element={<OrdersTab />} />
        <Route path="wallet"   element={<WalletTab />} />
        <Route path="refund"   element={<RefundTab />} />
        <Route path="*"        element={<Navigate to="tickets" replace />} />
      </Route>
    </Routes>
  );
}

export default MyPageRouterV2;
