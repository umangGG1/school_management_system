import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GateLog, SecurityIncident, IncidentStatus, IncidentSeverity } from './entities/security.entities';
import { NotificationGateway } from '../common/gateways/notification.gateway';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(GateLog) private readonly gateRepo: Repository<GateLog>,
    @InjectRepository(SecurityIncident) private readonly incidentRepo: Repository<SecurityIncident>,
    private readonly gateway: NotificationGateway,
  ) {}

  async overview(schoolId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const [visitorsToday, openIncidents, activeIncidents] = await Promise.all([
      this.gateRepo.count({ where: { schoolId } }),
      this.incidentRepo.count({ where: { schoolId, status: IncidentStatus.OPEN } }),
      this.incidentRepo.count({ where: { schoolId, status: IncidentStatus.IN_PROGRESS } }),
    ]);
    return { visitorsToday, openIncidents, activeIncidents, gatesOperational: 4 };
  }

  async findGateLog(schoolId: string, date?: string) {
    const qb = this.gateRepo
      .createQueryBuilder('g')
      .leftJoinAndSelect('g.guard', 'guard')
      .where('g.school_id = :schoolId', { schoolId })
      .orderBy('g.check_in_time', 'DESC');
    if (date) {
      qb.andWhere("DATE(g.check_in_time) = :date", { date });
    }
    return qb.getMany();
  }

  async createGateLog(schoolId: string, guardId: string, dto: Partial<GateLog>): Promise<GateLog> {
    return this.gateRepo.save(this.gateRepo.create({ ...dto, schoolId, guardId }));
  }

  async markCheckout(id: string, schoolId: string): Promise<GateLog> {
    const log = await this.gateRepo.findOne({ where: { id, schoolId } });
    if (!log) throw new NotFoundException('Gate log not found');
    log.checkOutTime = new Date();
    return this.gateRepo.save(log);
  }

  async findIncidents(schoolId: string, status?: string) {
    const where: any = { schoolId };
    if (status) where.status = status;
    return this.incidentRepo.find({ where, relations: ['reportedBy', 'assignedTo'], order: { createdAt: 'DESC' } });
  }

  async createIncident(schoolId: string, reportedById: string, dto: Partial<SecurityIncident>): Promise<SecurityIncident> {
    const incident = await this.incidentRepo.save(
      this.incidentRepo.create({ ...dto, schoolId, reportedById }),
    );

    // Real-time alert: always emit new incidents; HIGH/CRITICAL are especially urgent
    this.gateway.emitToSchool(schoolId, 'security:new-incident', {
      incidentId: incident.id,
      title: incident.title,
      severity: incident.severity,
      urgent: incident.severity === IncidentSeverity.HIGH || incident.severity === IncidentSeverity.CRITICAL,
      timestamp: incident.createdAt,
    });

    return incident;
  }

  async updateIncident(id: string, schoolId: string, dto: Partial<SecurityIncident>): Promise<SecurityIncident> {
    const incident = await this.incidentRepo.findOne({ where: { id, schoolId } });
    if (!incident) throw new NotFoundException('Incident not found');
    if (dto.status === IncidentStatus.RESOLVED && !incident.resolvedAt) dto.resolvedAt = new Date();
    Object.assign(incident, dto);
    return this.incidentRepo.save(incident);
  }
}
