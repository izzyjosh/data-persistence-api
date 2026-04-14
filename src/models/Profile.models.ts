import { BeforeInsert, Column, Entity, PrimaryColumn } from "typeorm";
import { uuidv7 } from "uuidv7";

@Entity()
export class Profile {
  @PrimaryColumn("uuid")
  id?: string;

  @Column()
  name?: string;

  @Column()
  gender?: string;

  @Column({ type: "double precision" })
  gender_probability?: number;

  @Column()
  sample_size?: number;

  @Column()
  age?: number;

  @Column()
  age_group?: string;

  @Column()
  country?: string;

  @Column({ type: "double precision" })
  country_probability?: number;

  @Column()
  created_at?: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv7();
  }

  @BeforeInsert()
  setCreatedAt() {
    this.created_at = new Date().toISOString();
  }
}
