/**
 * Navigation types for Expo Router
 */


/**
 * Root Stack Navigator
 */
export type RootStackParamList = {
  '(auth)': undefined;
  '(customer)': undefined;
  '(admin)': undefined;
};

/**
 * Auth Stack Navigator
 */
export type AuthStackParamList = {
  login: undefined;
  'verify-otp': {
    email: string;
  };
};

/**
 * Customer Tab Navigator
 */
export type CustomerTabParamList = {
  home: undefined;
  orders: undefined;
  rewards: undefined;
  profile: undefined;
};

/**
 * Customer Stack Navigator
 */
export type CustomerStackParamList = {
  '(tabs)': undefined;
  'restaurant/[id]': {
    id: string;
  };
  cart: undefined;
  checkout: {
    restaurantId: string;
  };
  'order-detail/[id]': {
    id: string;
  };
  'review/[restaurantId]': {
    restaurantId: string;
    orderId: string;
  };
};

/**
 * Admin Tab Navigator
 */
export type AdminTabParamList = {
  dashboard: undefined;
  restaurants: undefined;
  orders: undefined;
  menu: undefined;
};

/**
 * Admin Stack Navigator
 */
export type AdminStackParamList = {
  '(tabs)': undefined;
  'restaurant/create': undefined;
  'restaurant/edit/[id]': {
    id: string;
  };
  'menu-item/create': {
    restaurantId: string;
    categoryId: string;
  };
  'menu-item/edit/[id]': {
    id: string;
  };
};
