import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const options = new DocumentBuilder()
        .setTitle('MushMallow API Document')
        .setDescription('The MushMallow API Document')
        .setVersion('1.0')
        .addTag('mushmallow')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('doc', app, document);

    await app.listen(3000);
}
bootstrap();
