import { login, gqlRequest } from './test-utils';

async function main() {
  try {
    console.log('🔐 Logging in...');
    const token = await login('demo@example.com', 'password123');
    console.log('✅ Login successful');

    // 1. Tạo watchlist mới
    console.log('📋 Creating watchlist...');
    const { createWatchlist } = await gqlRequest(
      `
      mutation CreateWatchlist($input: CreateWatchlistInput!) {
        createWatchlist(input: $input) {
          id
          name
        }
      }
      `,
      { input: { name: 'Tech Stocks' } },
      token,
    );
    const watchlistId = createWatchlist.id;
    console.log(`✅ Created watchlist: ${watchlistId}`);

    // 2. Thêm cổ phiếu vào watchlist
    console.log('➕ Adding stocks to watchlist...');
    const stocksToAdd = ['AAPL', 'GOOG'];
    for (const ticker of stocksToAdd) {
      await gqlRequest(
        `
        mutation AddStockToWatchlist($input: AddStockToWatchlistInput!) {
          addStockToWatchlist(input: $input)
        }
        `,
        { input: { watchlistId, ticker } },
        token,
      );
      console.log(`✅ Added ${ticker} to watchlist`);
    }

    // 3. Xem lại toàn bộ watchlist hiện tại
    console.log('🔎 Querying all watchlists...');
    const { myWatchlists } = await gqlRequest(
      `
      query {
        myWatchlists {
          id
          name
          stocks {
            ticker
            companyName
          }
        }
      }
      `,
      {},
      token,
    );
    console.log('📋 Watchlists:');
    console.dir(myWatchlists, { depth: null });

    // 4. Xóa 1 cổ phiếu
    console.log('❌ Removing stock from watchlist...');
    await gqlRequest(
      `
      mutation RemoveStockFromWatchlist($input: AddStockToWatchlistInput!) {
        removeStockFromWatchlist(input: $input)
      }
      `,
      { input: { watchlistId, ticker: 'AAPL' } },
      token,
    );
    console.log('✅ Removed AAPL');

    // 5. Xác minh lại sau khi xóa
    console.log('🔎 Verifying stock removed...');
    const { myWatchlists: finalWatchlists } = await gqlRequest(
      `
      query {
        myWatchlists {
          id
          name
          stocks {
            ticker
            companyName
          }
        }
      }
      `,
      {},
      token,
    );
    console.log('📋 Final watchlists:');
    console.dir(finalWatchlists, { depth: null });

    console.log('✅ Watchlist test completed successfully!');
  } catch (error) {
    console.error('❌ Error in watchlist test:', error);
    throw error;
  }
}

main().catch(console.error);
