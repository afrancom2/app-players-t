import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type TeamDocument = HydratedDocument<Team>;

@Schema({ timestamps: true })
export class Team {
  @Prop({ required: true, trim: true })
  nombre!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'League', required: true })
  ligaId!: Types.ObjectId;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
TeamSchema.index({ ligaId: 1 });
