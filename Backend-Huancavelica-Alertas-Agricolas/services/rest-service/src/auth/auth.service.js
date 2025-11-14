"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
let AuthService = class AuthService {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async register(data) {
        const hashed = await bcrypt.hash(data.password, 10);
        try {
            const user = await this.usersService.create({ ...data, password: hashed });
            const token = this.signToken(user.id);
            delete user.password;
            return { token, user };
        }
        catch (err) {
            // Handle Prisma unique constraint error (P2002) and surface a clear HTTP error
            if ((err === null || err === void 0 ? void 0 : err.code) === 'P2002') {
                throw new common_1.HttpException('A user with that email or phone already exists', common_1.HttpStatus.CONFLICT);
            }
            throw new common_1.HttpException('Could not create user', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(phone, password) {
        const user = await this.usersService.findByPhone(phone);
        if (!user)
            return null;
        const ok = await bcrypt.compare(password, user.password || '');
        if (!ok)
            return null;
        const token = this.signToken(user.id);
        delete user.password;
        return { token, user };
    }
    signToken(userId) {
        const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
        return jwt.sign({ sub: userId }, secret, { expiresIn: '1d' });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map