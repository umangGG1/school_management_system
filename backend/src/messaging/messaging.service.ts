import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Or, Equal } from 'typeorm';
import { Message, MessageStatus, MessageCategory } from './entities/message.entity';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  async sendMessage(data: {
    schoolId: string;
    senderId: string;
    recipientId: string;
    subject: string;
    body: string;
    category?: MessageCategory;
    parentMessageId?: string;
  }): Promise<Message> {
    const message = this.messageRepo.create({
      schoolId: data.schoolId,
      senderId: data.senderId,
      recipientId: data.recipientId,
      subject: data.subject,
      body: data.body,
      category: data.category ?? MessageCategory.GENERAL,
      parentMessageId: data.parentMessageId,
    });
    return this.messageRepo.save(message);
  }

  async getInbox(userId: string, schoolId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { recipientId: userId, schoolId, isDeletedByRecipient: false },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async getSent(userId: string, schoolId: string): Promise<Message[]> {
    return this.messageRepo.find({
      where: { senderId: userId, schoolId, isDeletedBySender: false },
      relations: ['recipient'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMessage(id: string, userId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { id },
      relations: ['sender', 'recipient', 'parentMessage'],
    });
    if (!message) throw new NotFoundException('Message not found');
    // Mark as read if recipient is viewing
    if (message.recipientId === userId && message.status === MessageStatus.UNREAD) {
      message.status = MessageStatus.READ;
      await this.messageRepo.save(message);
    }
    return message;
  }

  async markRead(id: string, userId: string): Promise<{ success: boolean }> {
    const message = await this.messageRepo.findOne({ where: { id, recipientId: userId } });
    if (!message) throw new NotFoundException('Message not found');
    message.status = MessageStatus.READ;
    await this.messageRepo.save(message);
    return { success: true };
  }

  async markAllRead(userId: string, schoolId: string): Promise<{ updated: number }> {
    const result = await this.messageRepo.update(
      { recipientId: userId, schoolId, status: MessageStatus.UNREAD },
      { status: MessageStatus.READ },
    );
    return { updated: result.affected ?? 0 };
  }

  async deleteMessage(id: string, userId: string): Promise<{ success: boolean }> {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId === userId) {
      message.isDeletedBySender = true;
    } else if (message.recipientId === userId) {
      message.isDeletedByRecipient = true;
    }
    await this.messageRepo.save(message);
    return { success: true };
  }

  async getUnreadCount(userId: string, schoolId: string): Promise<{ count: number }> {
    const count = await this.messageRepo.count({
      where: { recipientId: userId, schoolId, status: MessageStatus.UNREAD, isDeletedByRecipient: false },
    });
    return { count };
  }
}
