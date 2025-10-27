import { AuthService } from './auth.service';
import { RegisterInput } from './dto/register.input';
export declare class AuthResolver {
    private authService;
    constructor(authService: AuthService);
    register(input: RegisterInput): Promise<{
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
}
