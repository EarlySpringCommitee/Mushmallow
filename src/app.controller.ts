import { Controller, Get, UseGuards, Post, Request, Patch, Body, Query } from '@nestjs/common';
import { ApiResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';

import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly authService: AuthService
    ) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @UseGuards(AuthGuard('local'))
    @Post('auth/login')
    async login(@Request() req) {
        return await this.authService.login(req.user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('auth/user')
    async createUser(@Body() body) {
        return await this.authService.createUser(body);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('auth/user')
    @ApiQuery({ name: 'username', type: String })
    async isUsernameExist(@Query() query) {
        return await this.authService.isUsernameExist(query.username);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch('auth/password')
    async changePassword(@Body() body) {
        return await this.authService.changeUserPassword(
            body.username,
            body.oldPassword,
            body.newPassword
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }
}
