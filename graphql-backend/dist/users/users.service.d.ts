import { PrismaService } from '../prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: string;
        nombre: string | null;
        email: string | null;
        telefono: string;
        password: string;
        ciudad: string | null;
        activo: boolean;
        prefs: string | null;
        roles: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByPhone(phone: string): Promise<{
        id: string;
        nombre: string | null;
        email: string | null;
        telefono: string;
        password: string;
        ciudad: string | null;
        activo: boolean;
        prefs: string | null;
        roles: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<{
        id: string;
        nombre: string | null;
        email: string | null;
        telefono: string;
        password: string;
        ciudad: string | null;
        activo: boolean;
        prefs: string | null;
        roles: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
