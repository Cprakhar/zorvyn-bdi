import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    VIEWER = "viewer",
    ANALYST = "analyst",
    ADMIN = "admin"
}


@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({type: "enum", enum: UserRole, default: UserRole.VIEWER})
    Role: UserRole;

    @Column({type: "varchar", length: 255, unique: true})
    email: string

    @Column({type: "varchar", length: 255})
    password: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({type: "boolean", default: true})
    isActive: boolean;

    @BeforeInsert()
    async hashPassword() {
        // todo: implement password hashing
    }
}