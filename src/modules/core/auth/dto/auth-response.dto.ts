import { ApiProperty } from '@nestjs/swagger';
import { ROLE_KEYS, type RoleKey } from '@common/enums/roles';

export class AuthResponseUserDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ format: 'email' })
    email: string;

    @ApiProperty()
    role: string;

    @ApiProperty({ enum: ROLE_KEYS, isArray: true })
    roles: RoleKey[];
}

export class AuthResponseDto {
    @ApiProperty({ type: AuthResponseUserDto })
    user: AuthResponseUserDto;

    @ApiProperty({ required: false })
    accessToken?: string;
}
