import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import './stock/enums/interval.enum';
import { AuthModule } from './auth/auth.module';
import { MarketDataModule } from './market-data/market-data.module';
import { OrderModule } from './order/order.module';
import { GraphQLModule } from '@nestjs/graphql';
import { PortfolioModule } from './portfolio/portfolio.module';
import { StockGateway } from './common/gateway/stock/stock.gateway';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { StockModule } from './stock/stock.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),          
      sortSchema: true,
      playground: true,
    }),
    PrismaModule,
    AuthModule,
    MarketDataModule,
    OrderModule,
    PortfolioModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [AppService, StockGateway, AppResolver],
})
export class AppModule {}
