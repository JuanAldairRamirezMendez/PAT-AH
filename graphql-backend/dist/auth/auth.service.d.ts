import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    constructor(usersService: UsersService);
    register(data: any): Promise<{
        token: string;
        user: {
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
        };
    }>;
    login(phone: string, password: string): Promise<{
        token: string;
        user: {
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
        };
    }>;
    signToken(userId: string): string;
}
