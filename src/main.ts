import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(helmet());
    app.enableCors({
        origin: true
    });

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
