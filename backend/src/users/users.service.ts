import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, ListUsersQueryDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /* ─── Auth helpers ──────────────────────────────────────────────── */

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id }, relations: ['school'] });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /* ─── Admin CRUD ────────────────────────────────────────────────── */

  /** Create a new user (called by Super Admin or seed script) */
  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException(`Email ${dto.email} is already registered`);

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = this.userRepo.create({
      email:     dto.email,
      passwordHash,
      firstName: dto.firstName,
      lastName:  dto.lastName,
      roles:     dto.roles,
      phone:     dto.phone,
      staffNo:   dto.staffNo,
      schoolId:  dto.schoolId,
    });
    return this.userRepo.save(user);
  }

  /** List all users, optionally filtered by school / search / status */
  async findAll(query: ListUsersQueryDto): Promise<User[]> {
    const where: any = {};

    if (query.schoolId) where.schoolId = query.schoolId;
    if (query.status === 'active')   where.isActive = true;
    if (query.status === 'inactive') where.isActive = false;

    let users = await this.userRepo.find({ where, relations: ['school'] });

    if (query.search) {
      const q = query.search.toLowerCase();
      users = users.filter(
        u =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q)  ||
          u.email.toLowerCase().includes(q)     ||
          (u.staffNo ?? '').toLowerCase().includes(q),
      );
    }

    return users;
  }

  /** Update user fields (roles, name, status, etc.) */
  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName  !== undefined) user.lastName  = dto.lastName;
    if (dto.email     !== undefined) {
      const clash = await this.userRepo.findOne({ where: { email: dto.email } });
      if (clash && clash.id !== id) throw new ConflictException('Email already in use');
      user.email = dto.email;
    }
    if (dto.roles    !== undefined) user.roles    = dto.roles;
    if (dto.phone    !== undefined) user.phone    = dto.phone;
    if (dto.staffNo  !== undefined) user.staffNo  = dto.staffNo;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;

    return this.userRepo.save(user);
  }

  /** Toggle active/inactive */
  async toggleStatus(id: string): Promise<User> {
    const user = await this.findById(id);
    user.isActive = !user.isActive;
    return this.userRepo.save(user);
  }

  /** Legacy helper still used by other modules */
  async findAllBySchool(schoolId: string): Promise<User[]> {
    return this.userRepo.find({ where: { schoolId, isActive: true } });
  }

  /** Serialise a user to a safe public shape */
  toPublic(u: User) {
    return {
      id:        u.id,
      name:      `${u.firstName} ${u.lastName}`,
      firstName: u.firstName,
      lastName:  u.lastName,
      email:     u.email,
      phone:     u.phone ?? '—',
      staffNo:   u.staffNo ?? '—',
      roles:     u.roles,
      schoolId:  u.schoolId,
      schoolName:u.school?.name ?? '',
      avatarUrl: u.avatarUrl,
      isActive:  u.isActive,
      status:    u.isActive ? 'active' : 'inactive',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }
}
