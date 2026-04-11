import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';

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

  create(data: Partial<School>): Promise<School> {
    return this.schoolRepo.save(this.schoolRepo.create(data));
  }
}
