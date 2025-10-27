import { AuthService } from '../auth/auth.service';
export declare class RestController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        phone: string;
        password: string;
    }): Promise<{
        success: boolean;
        message: string;
        token?: undefined;
        user?: undefined;
    } | {
        success: boolean;
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
        message?: undefined;
    }>;
    createUser(body: any): Promise<{
        success: boolean;
        message: string;
        user?: undefined;
    } | {
        success: boolean;
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
        message?: undefined;
    }>;
}
