import { JwtService } from '@nestjs/jwt';
import { PasswordUtil } from './utils/password.util';
import { toAuthUser } from './utils/auth-user.util';
import { UsersService } from '@core/users/users.service';
import type { AuthResponse, AuthUser, JwtPayload } from './types/auth.types';
import { LoginDto, RegisterDto } from './dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly usersService: UsersService,
    ) {}

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const user = await this.usersService.create(dto);

        return this.respond(toAuthUser({ ...user, membership: null }));
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.authenticateUser(dto.email, dto.password);

        return this.respond(toAuthUser(user));
    }

    private respond({ id, name, email, role, roles }: AuthUser): AuthResponse {
        const payload: JwtPayload = { sub: id, email, role, roles };

        return {
            user: { id, name, email, role, roles },
            accessToken: this.jwtService.sign(payload),
        };
    }

    private async authenticateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordValid = await PasswordUtil.compare(
            password,
            user.passwordHash,
        );
        if (!passwordValid)
            throw new UnauthorizedException('Invalid credentials');

        return user;
    }
}
