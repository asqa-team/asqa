import { Test, TestingModule } from '@nestjs/testing';
import { PlatformApiAdapterService } from 'src/platform-api-adapter';

describe('PlatformApiAdapterService', () => {
  let service: PlatformApiAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlatformApiAdapterService],
    }).compile();

    service = module.get<PlatformApiAdapterService>(PlatformApiAdapterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
