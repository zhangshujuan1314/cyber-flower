import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('CyberBloom API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health & Root', () => {
    it('/health (GET) — 健康检查', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('ok');
          expect(res.body.service).toBe('cyber-bloom-api');
        });
    });

    it('/ (GET) — API根信息', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200);
    });
  });

  describe('Auth', () => {
    it('/v1/auth/login (POST) — 缺少code返回400', () => {
      return request(app.getHttpServer())
        .post('/v1/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('Flowers', () => {
    it('/v1/flowers (GET) — 无Token返回401', () => {
      return request(app.getHttpServer())
        .get('/v1/flowers')
        .expect(401);
    });
  });

  describe('Breed', () => {
    it('/v1/seeds/generate (POST) — 无Token返回401', () => {
      return request(app.getHttpServer())
        .post('/v1/seeds/generate')
        .send({ keyword: 'test' })
        .expect(401);
    });
  });
});
