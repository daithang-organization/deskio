import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'SERVICE_NAME') return 'test-service';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('healthz', () => {
    it('should return health status', () => {
      const result = controller.healthz();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('test-service');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('readyz', () => {
    it('should return readiness status', () => {
      const result = controller.readyz();
      expect(result.status).toBe('ready');
      expect(result.checks).toBeDefined();
    });
  });
});
