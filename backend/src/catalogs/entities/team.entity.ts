import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { League } from './league.entity.js';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  nombre!: string;

  @Column({ name: 'liga_id' })
  ligaId!: number;

  @ManyToOne(() => League, (league) => league.equipos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'liga_id' })
  liga!: Relation<League>;
}
