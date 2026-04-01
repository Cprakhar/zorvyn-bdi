import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";

export enum TransactionType {
    INCOME = "income",
    EXPENSE = "expense"
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column("int")
    @Check("amount > 0")
    amount!: number;

    @Column("simple-enum", { enum: TransactionType })
    type!: TransactionType;

    @Column("varchar", { length: 255 })
    category!: string;

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    transactionDate!: Date;

    @Column("varchar", { length: 255, nullable: true })
    description!: string | null;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: "createdById" })
    createdBy!: User;

    @Column("varchar", { length: 36 })
    createdById!: string;
}