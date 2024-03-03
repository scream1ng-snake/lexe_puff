import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Injectable } from '@nestjs/common/decorators/core';
import { Entity, Column, PrimaryColumn, Repository } from 'typeorm';

@Entity()
export class Sys {
   @PrimaryColumn()
   name: string;

   @Column()
   version: string;

   @Column()
   key: string;
}

@Injectable()
export class SysRepository extends Repository<Sys> {
  constructor(private dataSource: DataSource) {
    super(Sys, dataSource.createEntityManager())
  }
  async findByName(name: string) {
    return await this.findOne({ where: { name } })
  }
  async createSys(sys: Sys) {
    return await this.save(sys);
  };
  async updateVersion(params: Pick<Sys, 'name' | 'version'>) {
    return await this.save(params)
  }
  async updateKey(params: Pick<Sys, 'name' | 'key'>) {
    return await this.save(params)
  }
}

type dbOptions = {
  type: any
  user: string
  host: string
  port: number
  password: string
  database: string
  schema: string
}

export const modelsList = [
  Sys
]

export const reposList = [
  SysRepository
]

@Module({
  imports: [
    ConfigModule, 
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const appDbConfig = configService.get<dbOptions>('db.application')
        const mode = configService.get('mode')
        const options: DataSourceOptions = {
          ...appDbConfig,
          username: appDbConfig.user,
          logging: true, 
          migrationsRun: true,
          entities: modelsList, 
          synchronize: mode === 'development'
        }
        return options
      },
      dataSourceFactory: async (options) => new DataSource(options).initialize()
     }),
  ],
  controllers: [],
  providers: [...reposList],
  exports: [...reposList],
})
export class DatabaseModule {}

