import { gql } from '@apollo/client';

// Authentication Queries
export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        role
        isBanned
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      accessToken
      user {
        id
        email
        role
        isBanned
      }
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      role
      isBanned
      avatar
      createdAt
    }
  }
`;

// Dashboard Queries
export const GET_DASHBOARD = gql`
  query GetDashboard {
    getDashboard {
      cashBalance
      totalPortfolioValue
      totalPnL
      totalRealizedPnL
      totalUnrealizedPnL
      stockPositions {
        ticker
        companyName
        quantity
        averageBuyPrice
        currentPrice
        marketValue
        unrealizedPnL
        unrealizedPnLPercent
        avatar
      }
    }
  }
`;

export const GET_MY_BALANCE = gql`
  query GetMyBalance {
    getMyBalance
  }
`;

// Portfolio Queries
export const MY_PORTFOLIO = gql`
  query MyPortfolio {
    myPortfolio {
      ticker
      quantity
      averagePrice
    }
  }
`;

export const MY_TRANSACTIONS = gql`
  query MyTransactions {
    myTransactions {
      id
      ticker
      action
      shares
      price
      timestamp
    }
  }
`;

// Order Queries
export const MY_ORDERS = gql`
  query MyOrders {
    myOrders {
      id
      ticker
      side
      type
      quantity
      price
      status
      timeInForce
      createdAt
      matchedAt
    }
  }
`;

export const ORDER_BOOK = gql`
  query OrderBook($ticker: String!) {
    orderBook(ticker: $ticker) {
      buyOrders {
        id
        price
        quantity
        createdAt
      }
      sellOrders {
        id
        price
        quantity
        createdAt
      }
    }
  }
`;

// Order Mutations
export const PLACE_ORDER = gql`
  mutation PlaceOrder($input: PlaceOrderInput!) {
    placeOrder(input: $input) {
      id
      ticker
      side
      type
      quantity
      price
      status
      timeInForce
      createdAt
    }
  }
`;

export const PLACE_STOP_ORDER = gql`
  mutation PlaceStopOrder($input: PlaceStopOrderInput!) {
    placeStopOrder(input: $input) {
      id
      ticker
      side
      type
      quantity
      price
      status
      timeInForce
      createdAt
    }
  }
`;

export const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: String!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

// Stock Queries (removed marketCap to fix GraphQL error)
export const GET_STOCKS = gql`
  query GetStocks {
    stocks {
      ticker
      companyName
      exchange
      sector
      industry
      currency
      avatar
    }
  }
`;

// Stocks with latest market data for Markets tab
export const GET_STOCKS_WITH_MARKET = gql`
  query GetStocksWithMarket {
    stocks {
      ticker
      companyName
      exchange
      currency
      avatar
      marketData(interval: _1d) {
        close
        timestamp
      }
    }
  }
`;

export const GET_STOCK = gql`
  query GetStock($ticker: String!) {
    stock(ticker: $ticker) {
      ticker
      companyName
      exchange
      sector
      industry
      currency
      avatar
      marketData(interval: _1d) {
        open
        high
        low
        close
        volume
        timestamp
      }
      news(limit: 10) {
        id
        headline
        summary
        publishedAt
        source
        url
      }
    }
  }
`;

// Technical Indicators
export const GET_SMA = gql`
  query GetSMA($ticker: String!, $period: Float!, $interval: Interval!) {
    getSMA(ticker: $ticker, period: $period, interval: $interval)
  }
`;

export const GET_EMA = gql`
  query GetEMA($ticker: String!, $period: Float!, $interval: Interval!) {
    getEMA(ticker: $ticker, period: $period, interval: $interval)
  }
`;

export const GET_RSI = gql`
  query GetRSI($ticker: String!, $period: Float!, $interval: Interval!) {
    getRSI(ticker: $ticker, period: $period, interval: $interval)
  }
`;

export const GET_BOLLINGER_BANDS = gql`
  query GetBollingerBands(
    $ticker: String!
    $period: Float!
    $stdDev: Float!
    $interval: Interval!
  ) {
    getBollingerBands(
      ticker: $ticker
      period: $period
      stdDev: $stdDev
      interval: $interval
    )
  }
`;

// Watchlist Queries
export const MY_WATCHLISTS = gql`
  query MyWatchlists {
    myWatchlists {
      id
      name
      createdAt
      stocks {
        ticker
        companyName
        exchange
        avatar
      }
    }
  }
`;

export const CREATE_WATCHLIST = gql`
  mutation CreateWatchlist($input: CreateWatchlistInput!) {
    createWatchlist(input: $input) {
      id
      name
      createdAt
    }
  }
`;

export const ADD_STOCK_TO_WATCHLIST = gql`
  mutation AddStockToWatchlist($input: AddStockToWatchlistInput!) {
    addStockToWatchlist(input: $input)
  }
`;

export const REMOVE_STOCK_FROM_WATCHLIST = gql`
  mutation RemoveStockFromWatchlist($input: AddStockToWatchlistInput!) {
    removeStockFromWatchlist(input: $input)
  }
`;

// Balance Management
export const DEPOSIT = gql`
  mutation Deposit($amount: Float!) {
    deposit(amount: $amount)
  }
`;

export const DEDUCT = gql`
  mutation Deduct($amount: Float!) {
    deduct(amount: $amount)
  }
`;

// Alert Rules
export const GET_MY_ALERT_RULES = gql`
  query GetMyAlertRules {
    getMyAlertRules {
      id
      ticker
      ruleType
      targetValue
      createdAt
    }
  }
`;

export const CREATE_ALERT_RULE = gql`
  mutation CreateAlertRule($input: CreateAlertRuleInput!) {
    createAlertRule(input: $input) {
      id
      ticker
      ruleType
      targetValue
      createdAt
    }
  }
`;

export const DELETE_ALERT_RULE = gql`
  mutation DeleteAlertRule($id: ID!) {
    deleteAlertRule(id: $id)
  }
`;

// User profile updates
export const UPDATE_AVATAR = gql`
  mutation UpdateAvatar($avatarUrl: String!) {
    updateAvatar(avatarUrl: $avatarUrl) {
      id
      email
      avatar
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
  }
`;

// Order Book Queries
export const GET_ORDER_BOOK = gql`
  query GetOrderBook($ticker: String!) {
    orderBook(ticker: $ticker) {
      buyOrders {
        id
        price
        quantity
        createdAt
        side
        status
        type
        timeInForce
      }
      sellOrders {
        id
        price
        quantity
        createdAt
        side
        status
        type
        timeInForce
      }
    }
  }
`;

// Admin Queries (for admin users)
export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      id
      email
      role
      isBanned
      createdAt
    }
  }
`;

export const BAN_USER = gql`
  mutation BanUser($userId: String!) {
    banUser(userId: $userId) {
      id
      isBanned
    }
  }
`;

export const UNBAN_USER = gql`
  mutation UnbanUser($userId: String!) {
    unbanUser(userId: $userId) {
      id
      isBanned
    }
  }
`;

export const PROMOTE_TO_ADMIN = gql`
  mutation PromoteToAdmin($userId: String!) {
    promoteToAdmin(userId: $userId) {
      id
      role
    }
  }
`;

export const DEMOTE_FROM_ADMIN = gql`
  mutation DemoteFromAdmin($userId: String!) {
    demoteFromAdmin(userId: $userId) {
      id
      role
    }
  }
`;
