import { Column, Entity, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Team } from './team.entity.js';

@Entity('leagues')
export class League {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column()
  pais!: string;

  @Column({ type: 'int', nullable: true })
  orden!: number | null;

  @OneToMany(() => Team, (team) => team.liga)
  equipos!: Relation<Team>[];
}
