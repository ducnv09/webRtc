import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

@InputType()
export class CreateRoomInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { defaultValue: 10 })
  @IsInt()
  @Min(2)
  @Max(50)
  maxMembers: number;
}

@InputType()
export class UpdateRoomInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(50)
  maxMembers?: number;

  @Field({ nullable: true })
  @IsOptional()
  isActive?: boolean;
}