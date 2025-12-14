import { describe, it, expect } from 'vitest'
import { serializeMessages } from './serialize-messages'
import type { UIMessage } from 'ai'

describe('serializeMessages', () => {
  it('serializes simple text messages', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        parts: [{ type: 'text', text: 'Hello, world!' }],
      },
      {
        id: 'msg-2',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Hi there!' }],
      },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed).toHaveLength(2)
    expect(parsed[0]).toEqual({
      id: 'msg-1',
      role: 'user',
      parts: [{ type: 'text', text: 'Hello, world!' }],
    })
    expect(parsed[1]).toEqual({
      id: 'msg-2',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hi there!' }],
    })
  })

  it('serializes reasoning parts', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        parts: [
          { type: 'reasoning', text: 'Let me think about this...' },
          { type: 'text', text: 'Here is my answer.' },
        ],
      },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].parts).toHaveLength(2)
    expect(parsed[0].parts[0]).toEqual({
      type: 'reasoning',
      text: 'Let me think about this...',
    })
  })

  it('serializes step-start parts', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        parts: [{ type: 'step-start' }],
      },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].parts[0]).toEqual({ type: 'step-start' })
  })

  it('serializes source-url parts', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        parts: [
          {
            type: 'source-url',
            sourceId: 'src-1',
            url: 'https://example.com',
            title: 'Example Site',
          },
        ],
      },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].parts[0]).toEqual({
      type: 'source-url',
      sourceId: 'src-1',
      url: 'https://example.com',
      title: 'Example Site',
    })
  })

  it('serializes file parts', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        parts: [
          {
            type: 'file',
            mediaType: 'image/png',
            url: 'https://example.com/image.png',
            filename: 'image.png',
          },
        ],
      },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].parts[0]).toEqual({
      type: 'file',
      mediaType: 'image/png',
      url: 'https://example.com/image.png',
      filename: 'image.png',
    })
  })

  it('serializes tool parts with normal data', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocationId: 'tool-1',
            toolName: 'search',
            state: 'result',
            args: { query: 'test' },
            result: { items: ['a', 'b', 'c'] },
          } as any,
        ],
      },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].parts[0].type).toBe('tool-invocation')
    expect(parsed[0].parts[0].toolName).toBe('search')
    expect(parsed[0].parts[0].args).toEqual({ query: 'test' })
    expect(parsed[0].parts[0].result).toEqual({ items: ['a', 'b', 'c'] })
  })

  it('handles circular references in tool parts gracefully', () => {
    // Create an object with circular reference
    const circularObj: any = { name: 'test' }
    circularObj.self = circularObj

    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocationId: 'tool-1',
            toolName: 'problematic',
            state: 'result',
            args: { query: 'test' },
            result: circularObj,
          } as any,
        ],
      },
    ]

    // Should not throw
    expect(() => serializeMessages(messages)).not.toThrow()

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    // Should have extracted safe properties
    expect(parsed[0].parts[0].type).toBe('tool-invocation')
    expect(parsed[0].parts[0].toolName).toBe('problematic')
    expect(parsed[0].parts[0].args).toEqual({ query: 'test' })
    // Result should be marked as unserializable
    expect(parsed[0].parts[0].result).toBe('[Unserializable]')
  })

  it('handles circular references in args gracefully', () => {
    const circularArgs: any = { query: 'test' }
    circularArgs.self = circularArgs

    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-invocation',
            toolInvocationId: 'tool-1',
            toolName: 'problematic',
            state: 'call',
            args: circularArgs,
          } as any,
        ],
      },
    ]

    expect(() => serializeMessages(messages)).not.toThrow()

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].parts[0].args).toBe('[Unserializable]')
  })

  it('handles empty messages array', () => {
    const messages: UIMessage[] = []

    const result = serializeMessages(messages)
    expect(result).toBe('[]')
  })

  it('handles messages with empty parts array', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        parts: [],
      },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].parts).toEqual([])
  })

  it('handles mixed part types in a single message', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'assistant',
        parts: [
          { type: 'step-start' },
          { type: 'text', text: 'Let me search for that.' },
          {
            type: 'tool-invocation',
            toolInvocationId: 'tool-1',
            toolName: 'search',
            state: 'result',
            args: { q: 'test' },
            result: { found: true },
          } as any,
          { type: 'text', text: 'I found something!' },
        ],
      },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].parts).toHaveLength(4)
    expect(parsed[0].parts[0].type).toBe('step-start')
    expect(parsed[0].parts[1].type).toBe('text')
    expect(parsed[0].parts[2].type).toBe('tool-invocation')
    expect(parsed[0].parts[3].type).toBe('text')
  })

  it('preserves all roles correctly', () => {
    const messages: UIMessage[] = [
      { id: '1', role: 'system', parts: [{ type: 'text', text: 'System msg' }] },
      { id: '2', role: 'user', parts: [{ type: 'text', text: 'User msg' }] },
      { id: '3', role: 'assistant', parts: [{ type: 'text', text: 'Assistant msg' }] },
    ]

    const result = serializeMessages(messages)
    const parsed = JSON.parse(result)

    expect(parsed[0].role).toBe('system')
    expect(parsed[1].role).toBe('user')
    expect(parsed[2].role).toBe('assistant')
  })

  it('output is valid JSON that can be parsed back', () => {
    const messages: UIMessage[] = [
      {
        id: 'msg-1',
        role: 'user',
        parts: [{ type: 'text', text: 'Test with "quotes" and special chars: \n\t' }],
      },
    ]

    const result = serializeMessages(messages)

    // Should not throw when parsing
    expect(() => JSON.parse(result)).not.toThrow()

    const parsed = JSON.parse(result)
    expect(parsed[0].parts[0].text).toBe('Test with "quotes" and special chars: \n\t')
  })
})
