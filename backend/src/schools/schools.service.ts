import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSchoolDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() motto?: string;
  @IsOptional() @IsString() foundedYear?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() ownership?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsString() principalName?: string;
  @IsOptional() @IsString() deoName?: string;
  @IsOptional() @IsString() moesId?: string;
  @IsOptional() @IsString() streams?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() currency?: string;
}

@Injectable()
export class SchoolsService {
  constructor(
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
  ) {}

  findAll(): Promise<School[]> {
    return this.schoolRepo.find({ where: { isActive: true } });
  }

  async findOne(id: string): Promise<School> {
    const school = await this.schoolRepo.findOne({ where: { id } });
    if (!school) throw new NotFoundException(`School ${id} not found`);
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto): Promise<School> {
    const school = await this.findOne(id);
    Object.assign(school, dto);
    return this.schoolRepo.save(school);
  }

  create(data: Partial<School>): Promise<School> {
    return this.schoolRepo.save(this.schoolRepo.create(data));
  }
}
