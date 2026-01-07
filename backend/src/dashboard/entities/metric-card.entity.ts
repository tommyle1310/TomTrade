import { ObjectType, Field, Float } from '@nestjs/graphql';

/**
 * MetricCard entity represents a single dashboard metric card
 * Used for displaying key trading metrics in a standardized format
 */
@ObjectType()
export class MetricCard {
  @Field(() => String)
  title: string; // Display name of the metric (e.g., "Portfolio Value")

  @Field(() => String)
  value: string; // Primary metric value as string (supports both numbers and text like "Active")

  @Field(() => String, { nullable: true })
  valueUnit?: string; // Unit description (e.g., "currency", "quantity", "Active/Inactive")

  @Field(() => String, { nullable: true })
  valueType?: string; // Type indicator (e.g., "dollar", "number", "status")

  @Field(() => Float, { nullable: true })
  change?: number; // Change amount or delta (can be null for status cards)

  @Field(() => String, { nullable: true })
  changeType?: string; // Change unit (e.g., "dollar", "percent", "number")

  @Field(() => String, { nullable: true })
  changeExtraData?: string; // Additional context (e.g., "+5.17%", "today", "profitable")

  @Field(() => String, { nullable: true })
  extraData?: string; // Supplementary information (e.g., "Joined on 5/9/2025")
}
