import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { OrderSide } from '../enums/order-side.enum';
import { OrderType } from '../enums/order-type.enum';
import { TimeInForce } from '../enums/time-in-force.enum';

@InputType()
export class PlaceStopOrderInput {
  @Field()
  @IsString()
  ticker: string;

  @Field(() => OrderSide)
  @IsEnum(OrderSide)
  side: OrderSide;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  price: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0.01)
  triggerPrice: number;

  @Field(() => OrderType)
  @IsEnum(OrderType)
  type: OrderType;

  @Field(() => TimeInForce, { defaultValue: 'GTC' })
  @IsEnum(TimeInForce)
  @IsOptional()
  timeInForce?: TimeInForce;
}
