import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Announcement } from '../announcements/entities/announcement.entity';
import { Company } from '../companies/entities/company.entity';
import { Interest } from '../interests/entities/interest.entity';
import { Contract } from '../messages/entities/contract.entity';
import { Message } from '../messages/entities/message.entity';
import { User } from '../users/entities/user.entity';
import { SiteVisit } from './entities/site-visit.entity';

const BACKUP_FORMAT = 'cci-b2b-database-backup';
const BACKUP_VERSION = 1;
const BACKUP_ENTITIES = [
  User,
  Company,
  Announcement,
  Interest,
  Message,
  Contract,
  SiteVisit,
];

type BackupRow = Record<string, unknown>;

export interface DatabaseBackup {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  createdAt: string;
  tables: Record<string, BackupRow[]>;
}

@Injectable()
export class AdminDataBackupService {
  constructor(private readonly dataSource: DataSource) {}

  async createBackup(): Promise<DatabaseBackup> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const tables: Record<string, BackupRow[]> = {};
      for (const entity of BACKUP_ENTITIES) {
        const metadata = this.dataSource.getMetadata(entity);
        tables[metadata.tableName] = await queryRunner.query(
          `SELECT * FROM ${this.getTablePath(metadata)}`,
        );
      }

      return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        createdAt: new Date().toISOString(),
        tables,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async restoreBackup(contents: Buffer) {
    let parsedBackup: unknown;
    try {
      parsedBackup = JSON.parse(contents.toString('utf8'));
    } catch (cause) {
      if (cause instanceof SyntaxError) {
        throw new BadRequestException('Le fichier de sauvegarde JSON est invalide.');
      }
      throw cause;
    }

    const backup = this.validateBackup(parsedBackup);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();
      const metadataList = BACKUP_ENTITIES.map((entity) =>
        this.dataSource.getMetadata(entity),
      );
      const tablePaths = metadataList.map((metadata) =>
        this.getTablePath(metadata),
      );

      await queryRunner.query(
        `TRUNCATE TABLE ${tablePaths.join(', ')} RESTART IDENTITY`,
      );

      const restoredRows: Record<string, number> = {};
      for (const metadata of metadataList) {
        const rows = backup.tables[metadata.tableName];
        restoredRows[metadata.tableName] = rows.length;

        for (const row of rows) {
          const columns = metadata.columns.filter((column) =>
            Object.hasOwn(row, column.databaseName),
          );
          const columnNames = columns
            .map((column) => this.quoteIdentifier(column.databaseName))
            .join(', ');
          const placeholders = columns
            .map((_, index) => `$${index + 1}`)
            .join(', ');
          const values = columns.map((column) =>
            this.restoreValue(row[column.databaseName]),
          );

          await queryRunner.query(
            `INSERT INTO ${this.getTablePath(metadata)} (${columnNames}) VALUES (${placeholders})`,
            values,
          );
        }
      }

      await queryRunner.commitTransaction();
      return { restoredRows };
    } catch (cause) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw cause;
    } finally {
      await queryRunner.release();
    }
  }

  private validateBackup(value: unknown): DatabaseBackup {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new BadRequestException('Le fichier de sauvegarde est invalide.');
    }

    const candidate = value as Partial<DatabaseBackup>;
    const metadataList = BACKUP_ENTITIES.map((entity) =>
      this.dataSource.getMetadata(entity),
    );
    const expectedTables = metadataList.map((metadata) => metadata.tableName);

    if (
      candidate.format !== BACKUP_FORMAT ||
      candidate.version !== BACKUP_VERSION ||
      !candidate.tables ||
      typeof candidate.tables !== 'object' ||
      Array.isArray(candidate.tables) ||
      expectedTables.some(
        (tableName) => !Array.isArray(candidate.tables?.[tableName]),
      ) ||
      Object.keys(candidate.tables).some(
        (tableName) => !expectedTables.includes(tableName),
      )
    ) {
      throw new BadRequestException(
        'Le fichier ne correspond pas à une sauvegarde compatible de la base.',
      );
    }

    for (const metadata of metadataList) {
      const allowedColumns = new Set(
        metadata.columns.map((column) => column.databaseName),
      );
      for (const row of candidate.tables[metadata.tableName] ?? []) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) {
          throw new BadRequestException(
            `Une ligne de la table ${metadata.tableName} est invalide.`,
          );
        }
        if (
          Object.keys(row).length === 0 ||
          Object.keys(row).some((column) => !allowedColumns.has(column))
        ) {
          throw new BadRequestException(
            `Les colonnes de la table ${metadata.tableName} sont invalides.`,
          );
        }
      }
    }

    return candidate as DatabaseBackup;
  }

  private restoreValue(value: unknown): unknown {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      'type' in value &&
      value.type === 'Buffer' &&
      'data' in value &&
      Array.isArray(value.data) &&
      value.data.every(
        (byte): byte is number =>
          typeof byte === 'number' &&
          Number.isInteger(byte) &&
          byte >= 0 &&
          byte <= 255,
      )
    ) {
      return Buffer.from(value.data);
    }

    return value;
  }

  private getTablePath(metadata: {
    schema?: string;
    tableName: string;
  }): string {
    const tableName = this.quoteIdentifier(metadata.tableName);
    return metadata.schema
      ? `${this.quoteIdentifier(metadata.schema)}.${tableName}`
      : tableName;
  }

  private quoteIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }
}
