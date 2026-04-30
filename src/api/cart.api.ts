import { apiClient, ApiResponse } from './client';
import type {
  CartItemRequest,
  CartResponse,
  CartItemQuantityRequest, CartItemQuantityResponse,
  CartItemDeleteResponse,
  CartClearResponse,
  AddCartItemResponse
} from './types';

// 장바구니가 변경됐음을 Layout 등 외부 구독자에 알리기 위한 이벤트 키.
// useCartCount 가 listen 하여 즉시 refresh.
export const CART_CHANGED_EVENT = 'cart:changed';

const emitCartChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_CHANGED_EVENT));
  }
};

export const addCartItem = async (body: CartItemRequest) => {
  const res = await apiClient.post<AddCartItemResponse>('/cart/items', body);
  emitCartChanged();
  return res;
};

export const getCart = () =>
  apiClient.get<CartResponse>('/cart');

export const updateCartItemQuantity = async (
  cartItemId: string,
  body: CartItemQuantityRequest,
) => {
  const res = await apiClient.patch<CartItemQuantityResponse>(
    `/cart/items/${cartItemId}`,
    body,
  );
  emitCartChanged();
  return res;
};

export const deleteCartItem = async (cartItemId: string) => {
  const res = await apiClient.delete<CartItemDeleteResponse>(
    `/cart/items/${cartItemId}`,
  );
  emitCartChanged();
  return res;
};

export const clearCart = async () => {
  const res = await apiClient.delete<CartClearResponse>('/cart');
  emitCartChanged();
  return res;
};
