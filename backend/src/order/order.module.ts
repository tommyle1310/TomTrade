import { Module, forwardRef } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { PrismaModule } from 'prisma/prisma.module';
import { TransactionModule } from 'src/transaction/transaction.module';

@Module({
  imports: [PrismaModule, forwardRef(() => TransactionModule)],
  providers: [OrderResolver, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
