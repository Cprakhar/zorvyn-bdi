import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    VIEWER = "viewer",
    ANALYST = "analyst",
    ADMIN = "admin"
}


@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "simple-enum", enum: UserRole, default: UserRole.VIEWER })
    role!: UserRole;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    passwordHash!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: "boolean", default: true })
    isActive!: boolean;
}