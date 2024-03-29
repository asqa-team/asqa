import { Test, TestingModule } from '@nestjs/testing';
import { PlatformApiService, MessagesEventBroker, Passages, Answer, TextTypes, IMessageToUserEvent, IEventMeta, IEventIdentity } from 'src/bot/interfaces';
import { MessagesEventAdapterService } from 'src/bot/messages-event-adapter.service';
import { SlowAnswerService } from 'src/bot/slow-answer.service';
import { PlatformApiAdapterService } from 'src/platform-api-adapter';

describe('LongAnswerService', () => {
  let service: SlowAnswerService;
  let mockPlatformApi: PlatformApiService 
  let broker: MessagesEventBroker

  beforeEach(async () => {

    mockPlatformApi = {
      searchPassages(question: string): Promise<Passages[]> {
        throw new Error('Method not implemented.');
      },
      predictAnswers(question: string, context: string): Promise<Answer[]> {
          throw new Error('Method not implemented.');
      },
      generateText(type: TextTypes): Promise<string> {
          throw new Error('Method not implemented.');
      }
    }

    broker = {
      sendToUser(identity, text) {
        throw new Error('Method not implemented.');
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PlatformApiAdapterService,
          useValue: mockPlatformApi,
        },
        {
          provide: MessagesEventAdapterService,
          useValue: broker
        },
        SlowAnswerService
      ],
    }).compile();

    service = module.get<SlowAnswerService>(SlowAnswerService);

    jest.useFakeTimers('legacy');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send excuses on long answer', async () => {
    
    const excuses = ["Hm, need to think...", "It harder than I were thinking"]

    let countOfCalls = 0
    const generateText = jest.fn((type: TextTypes) => Promise.resolve(excuses[countOfCalls++]))
    mockPlatformApi.generateText = generateText

    const sendToUser = jest.fn(e => {})
    broker.sendToUser = sendToUser

    const answer = 'Some answer, which will be generated'
    let resolveAnswer
    const answerPromise = new Promise(resolve => {resolveAnswer = resolve})
    const callback = jest.fn(() => answerPromise)

    const identity: IEventIdentity = {id: '', provider: ''}
    const longAnswerPromise = service.wrapSlowAnswerExcuse(identity, callback)

    expect(setTimeout).toHaveBeenCalledTimes(2);

    expect(callback.mock.calls.length).toBe(1)

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    jest.runAllTimers();

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    expect(generateText.mock.calls.length).toBe(2)
    expect(generateText.mock.calls[0][0]).toBe(TextTypes.EXCUSE_SLOW_ANSWER)
    expect(generateText.mock.calls[1][0]).toBe(TextTypes.EXCUSE_VERY_SLOW_ANSWER)

    expect(sendToUser.mock.calls.length).toBe(2)
    expect(sendToUser.mock.calls[0][0]).toEqual(identity)
    // @ts-ignore
    expect(sendToUser.mock.calls[0][1]).toEqual(excuses[0])
    expect(sendToUser.mock.calls[1][0]).toEqual(identity)
    // @ts-ignore
    expect(sendToUser.mock.calls[1][1]).toEqual(excuses[1])

    resolveAnswer(answer)

    const longAnswerResult = await longAnswerPromise

    expect(longAnswerResult).toBe(answer)

  })

  it('should not send excuse on fast answer', async () => {
    
    const excuses = ["Hm, need to think...", "It harder than I were thinking"]

    let countOfCalls = 0
    const generateText = jest.fn((type: TextTypes) => Promise.resolve(excuses[countOfCalls++]))
    mockPlatformApi.generateText = generateText

    const sendToUser = jest.fn(e => {})
    broker.sendToUser = sendToUser

    const answer = 'Some answer, which will be generated'
    let resolveAnswer
    const answerPromise = new Promise(resolve => {resolveAnswer = resolve})
    const callback = jest.fn(() => answerPromise)

    const identity: IEventIdentity = {id: '', provider: ''}
    const longAnswerPromise = service.wrapSlowAnswerExcuse(identity, callback)

    expect(setTimeout).toHaveBeenCalledTimes(2);

    expect(callback.mock.calls.length).toBe(1)

    resolveAnswer(answer)

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    jest.runAllTimers();

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    expect(generateText.mock.calls.length).toBe(0)
    expect(sendToUser.mock.calls.length).toBe(0)

    const longAnswerResult = await longAnswerPromise

    expect(longAnswerResult).toBe(answer)

  })

  it('should send one excuse on not very slow answer', async () => {
    
    const excuses = ["Hm, need to think...", "It harder than I were thinking"]

    let countOfCalls = 0
    const generateText = jest.fn((type: TextTypes) => Promise.resolve(excuses[countOfCalls++]))
    mockPlatformApi.generateText = generateText

    const sendToUser = jest.fn(e => {})
    broker.sendToUser = sendToUser

    const answer = 'Some answer, which will be generated'
    let resolveAnswer
    const answerPromise = new Promise(resolve => {resolveAnswer = resolve})
    const callback = jest.fn(() => answerPromise)

    const identity: IEventIdentity = {id: '', provider: ''}
    const longAnswerPromise = service.wrapSlowAnswerExcuse(identity, callback)

    expect(setTimeout).toHaveBeenCalledTimes(2);

    expect(callback.mock.calls.length).toBe(1)

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    jest.advanceTimersByTime(5000);

    resolveAnswer(answer)

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    jest.runAllTimers();

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    expect(generateText.mock.calls.length).toBe(1)
    expect(generateText.mock.calls[0][0]).toBe(TextTypes.EXCUSE_SLOW_ANSWER)

    expect(sendToUser.mock.calls.length).toBe(1)
    expect(sendToUser.mock.calls[0][0]).toEqual(identity)
    // @ts-ignore
    expect(sendToUser.mock.calls[0][1]).toEqual(excuses[0])

    const longAnswerResult = await longAnswerPromise

    expect(longAnswerResult).toBe(answer)

  })

  it('should not send excuse on fast exception fail', async () => {
    
    const excuses = ["Hm, need to think...", "It harder than I were thinking"]

    let countOfCalls = 0
    const generateText = jest.fn((type: TextTypes) => Promise.resolve(excuses[countOfCalls++]))
    mockPlatformApi.generateText = generateText

    const sendToUser = jest.fn(e => {})
    broker.sendToUser = sendToUser

    const answer = 'Some answer, which will be generated'
    let rejectAnswer
    const answerPromise = new Promise((resolve, reject) => {rejectAnswer = reject})
    const callback = jest.fn(() => answerPromise)

    const identity: IEventIdentity = {id: '', provider: ''}
    const longAnswerPromise = service.wrapSlowAnswerExcuse(identity, callback)

    expect(setTimeout).toHaveBeenCalledTimes(2);

    expect(callback.mock.calls.length).toBe(1)

    rejectAnswer(answer)

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    jest.runAllTimers();

    // Wait other promises executed
    await (new Promise((resolve, reject) => {
      resolve(1)
    }))

    expect(generateText.mock.calls.length).toBe(0)
    expect(sendToUser.mock.calls.length).toBe(0)

    const longAnswerResult = await longAnswerPromise

    expect(longAnswerResult).toBe(answer)

  })
});
