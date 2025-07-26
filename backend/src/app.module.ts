import { forwardRef, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import './stock/enums/interval.enum';
import { AuthModule } from './auth/auth.module';
import { MarketDataModule } from './market-data/market-data.module';
import { OrderModule } from './order/order.module';
import { GraphQLModule } from '@nestjs/graphql';
import { PortfolioModule } from './portfolio/portfolio.module';
import { TransactionModule } from './transaction/transaction.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppResolver } from './app.resolver';
import { StockModule } from './stock/stock.module';
import { PrismaModule } from 'prisma/prisma.module';
import { AlertRuleModule } from './alert-rule/alert-rule.module';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SocketService } from './core/socket-gateway.service';
import { CoreModule } from './core/core.module';
import { UserModule } from './user/user.module';
import { BalanceModule } from './balance/balance.module';
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),
      sortSchema: true,
      playground: true,
    }),
    EventEmitterModule.forRoot(),
    CoreModule,
    BalanceModule,
    PrismaModule,
    AuthModule,
    MarketDataModule,
    UserModule,
    OrderModule,
    PortfolioModule,
    TransactionModule,
    StockModule,
    AlertRuleModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppResolver,
    ConfigService,
    JwtService,
    SocketService,
  ],
  exports: [],
})
export class AppModule {}
