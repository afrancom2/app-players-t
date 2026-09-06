import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, type Relation } from 'typeorm';
import { Team } from '../../catalogs/entities/team.entity.js';
import { Player } from './player.entity.js';

@Entity('player_trayectoria')
export class Trayectoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'player_id' })
  playerId!: number;

  @ManyToOne(() => Player, (player) => player.trayectoria, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'player_id' })
  player!: Relation<Player>;

  @Column({ name: 'club_id' })
  clubId!: number;

  @ManyToOne(() => Team, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'club_id' })
  club!: Relation<Team>;

  @Column({ name: 'anio_inicio' })
  anioInicio!: number;

  @Column({ name: 'anio_fin', nullable: true })
  anioFin?: number;
}
