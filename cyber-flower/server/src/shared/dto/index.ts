import { IsString, IsNumber, IsEnum, IsOptional, Min, Max, MaxLength, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ============ Auth DTOs ============

export class WxLoginDto {
  @ApiProperty({ description: '微信登录code' })
  @IsString()
  code: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: '刷新Token' })
  @IsString()
  refreshToken: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(32)
  nickname?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  avatar?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(140)
  bio?: string;
}

// ============ Flower DTOs ============

export class PlantFlowerDto {
  @ApiProperty()
  @IsString()
  seedId: string;

  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString() @MaxLength(20)
  name: string;
}

export class CareFlowerDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ enum: ['water', 'fertilize', 'prune', 'adjust_light', 'talk'] })
  @IsEnum(['water', 'fertilize', 'prune', 'adjust_light', 'talk'])
  action: string;

  @ApiProperty()
  @IsNumber() @Min(1) @Max(100)
  value: number;
}

export class UpdateFlowerDto {
  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(20)
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(200)
  memo?: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsBoolean()
  isFavorite?: boolean;
}

// ============ Breed DTOs ============

export class GenerateSeedDto {
  @ApiProperty({ description: '关键词 1-50字' })
  @IsString() @MinLength(1) @MaxLength(50)
  keyword: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString()
  mood?: string;

  @ApiProperty()
  @IsString()
  userId: string;
}

export class PlantSeedDto {
  @ApiProperty()
  @IsString()
  userId: string;
}

// ============ Chat DTOs ============

export class SendMessageDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty({ description: '消息内容 1-500字' })
  @IsString() @MinLength(1) @MaxLength(500)
  message: string;
}

// ============ Social DTOs ============

export class GiftSeedDto {
  @ApiProperty()
  @IsString()
  toUserId: string;

  @ApiProperty()
  @IsString()
  seedId: string;

  @ApiProperty({ required: false })
  @IsOptional() @IsString() @MaxLength(100)
  message?: string;
}

export class CommentGardenDto {
  @ApiProperty()
  @IsString() @MinLength(1) @MaxLength(200)
  text: string;
}
