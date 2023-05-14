import { Length } from "class-validator";
import { Column, Entity, ManyToMany, JoinTable, PrimaryGeneratedColumn } from "typeorm";
import Language from "./language";


@Entity()
export default class Special_User_Profile {

    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ default: "" })
    @Length(1, 280, { message: "Bio exceeds maximum allowed length, please limit your bio to 280 characters" })
    bio: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    city: string

    @Column()
    phonenumber: string

    @ManyToMany(() => Language)
    @JoinTable()
    languages: Language[]



}