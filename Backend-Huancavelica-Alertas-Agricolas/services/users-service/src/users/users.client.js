"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var UsersClient_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersClient = void 0;
const common_1 = require("@nestjs/common");
const BASE = process.env.USERS_SERVICE_URL || 'http://backend-users:3002';
let UsersClient = UsersClient_1 = class UsersClient {
    constructor() {
        this.logger = new common_1.Logger(UsersClient_1.name);
    }
    url(path) {
        return `${BASE}${path}`;
    }
    async create(data) {
        const res = await fetch(this.url('/users'), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const text = await res.text();
            this.logger.warn(`UsersClient.create failed: ${res.status} ${text}`);
            throw new Error(`UsersClient create failed: ${res.status}`);
        }
        return res.json();
    }
    async findByPhone(phone) {
        const res = await fetch(this.url(`/users/${encodeURIComponent(phone)}`));
        if (!res.ok)
            return null;
        return res.json();
    }
    async findAll() {
        const res = await fetch(this.url('/users'));
        if (!res.ok)
            return [];
        const body = await res.json();
        // if backend-users returns an array, return it; if wrapped, try to unwrap
        if (Array.isArray(body))
            return body;
        if (body && Array.isArray(body.value))
            return body.value;
        return body;
    }
};
exports.UsersClient = UsersClient;
exports.UsersClient = UsersClient = UsersClient_1 = __decorate([
    (0, common_1.Injectable)()
], UsersClient);
//# sourceMappingURL=users.client.js.map