import { IsEnum, IsString, IsOptional, IsDateString } from 'class-validator';
import { SubscriptionTier } from '../../auth/entities/user.entity';
import { SubscriptionPeriod } from '../entities/subscription-period.entity';

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionTier)
  plano: SubscriptionTier;

  @IsEnum(SubscriptionPeriod)
  @IsOptional()
  periodo?: SubscriptionPeriod;

  @IsString()
  @IsOptional()
  receipt_ios?: string;

  @IsString()
  @IsOptional()
  receipt_android?: string;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsString()
  @IsOptional()
  original_transaction_id?: string;

  @IsString()
  @IsOptional()
  plataforma?: string;
}

export class ValidateIosReceiptDto {
  @IsString()
  receipt: string;

  @IsString()
  @IsOptional()
  transaction_id?: string;
}

export class ValidateAndroidPurchaseDto {
  @IsString()
  purchase_token: string;

  @IsString()
  product_id: string;

  @IsString()
  @IsOptional()
  transaction_id?: string;
}

export class RestorePurchasesDto {
  @IsString()
  plataforma: 'ios' | 'android';

  @IsString()
  @IsOptional()
  receipt?: string;

  @IsString()
  @IsOptional()
  purchase_token?: string;
}

