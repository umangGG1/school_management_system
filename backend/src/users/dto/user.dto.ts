import {
  IsEmail, IsString, IsNotEmpty, IsEnum, IsArray,
  IsOptional, MinLength, IsBoolean,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  staffNo?: string;

  @IsOptional()
  @IsString()
  schoolId?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  staffNo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListUsersQueryDto {
  @IsOptional()
  @IsString()
  schoolId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive';
}
