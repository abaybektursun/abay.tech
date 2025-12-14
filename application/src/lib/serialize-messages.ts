import type { UIMessage } from 'ai'

/**
 * Safely serialize UIMessage[] for storage.
 * UIMessage objects from the AI SDK can contain circular references
 * or non-serializable properties (especially in providerMetadata and tool results).
 * This function extracts only the known serializable properties.
 */
export function serializeMessages(messages: UIMessage[]): string {
  const sanitized = messages.map(msg => ({
    id: msg.id,
    role: msg.role,
    parts: msg.parts.map(part => {
      // Handle each part type, extracting only serializable data
      switch (part.type) {
        case 'text':
          return {
            type: 'text',
            text: part.text,
          }
        case 'reasoning':
          return {
            type: 'reasoning',
            text: part.text,
          }
        case 'step-start':
          return { type: 'step-start' }
        case 'source-url':
          return {
            type: 'source-url',
            sourceId: part.sourceId,
            url: part.url,
            title: part.title,
          }
        case 'file':
          return {
            type: 'file',
            mediaType: part.mediaType,
            url: part.url,
            filename: part.filename,
          }
        default:
          // For tool parts (type: 'tool-*') and other dynamic types,
          // safely extract properties avoiding circular refs
          try {
            // Attempt direct serialization of the part
            const serialized = JSON.parse(JSON.stringify(part))
            return serialized
          } catch {
            // If serialization fails, extract known safe properties
            const safePart: Record<string, unknown> = { type: part.type }
            if ('toolInvocationId' in part) safePart.toolInvocationId = part.toolInvocationId
            if ('toolName' in part) safePart.toolName = part.toolName
            if ('state' in part) safePart.state = part.state
            // For args/result, try to serialize them individually
            if ('args' in part) {
              try {
                safePart.args = JSON.parse(JSON.stringify(part.args))
              } catch {
                safePart.args = '[Unserializable]'
              }
            }
            if ('result' in part) {
              try {
                safePart.result = JSON.parse(JSON.stringify(part.result))
              } catch {
                safePart.result = '[Unserializable]'
              }
            }
            return safePart
          }
      }
    }),
  }))

  return JSON.stringify(sanitized)
}
