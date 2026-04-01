import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum TransactionType {
    INCOME = "income",
    EXPENSE = "expense"
}

@Entity()
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("int")
    @Check("amount > 0")
    amount: number

    @Column("enum", { enum: TransactionType })
    type: TransactionType

    @Column("varchar", { length: 255 })
    category: string

    @Column({default: () => "CURRENT_TIMESTAMP"})
    transactionDate: Date

    @Column("varchar", { length: 255, nullable: true })
    description: string | null
}