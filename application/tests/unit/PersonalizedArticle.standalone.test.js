#!/usr/bin/env node
// Standalone test runner for PersonalizedArticle replaceName function
// No dependencies required - pure JavaScript

/**
 * Replaces {{name}} or {{name|default}} placeholders with the provided name.
 */
function replaceName(text, recipientName) {
  const pattern = /\{\{name(?:\|([^}]*))?\}\}/g;
  return text.replace(pattern, (match, inlineDefault) => {
    if (recipientName) return recipientName;
    if (inlineDefault !== undefined) return inlineDefault;
    return 'friend';
  });
}

// Test utilities
function assertEqual(actual, expected, testName) {
  if (actual !== expected) {
    throw new Error(
      `❌ ${testName}\n` +
      `   Expected: "${expected}"\n` +
      `   Actual:   "${actual}"`
    );
  }
  console.log(`✓ ${testName}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
}

// Run all tests
function runTests() {
  console.log('\n🧪 Running PersonalizedArticle Tests\n');

  // ==========================================
  // BASIC FUNCTIONALITY
  // ==========================================
  console.log('📋 Basic Functionality:');

  assertEqual(
    replaceName('Hi {{name}}!', 'Alice'),
    'Hi Alice!',
    'Should replace {{name}} with provided name'
  );

  assertEqual(
    replaceName('Hi {{name}}!', null),
    'Hi friend!',
    'Should use "friend" as default when no name provided'
  );

  assertEqual(
    replaceName('Hello there!', 'Alice'),
    'Hello there!',
    'Should leave text unchanged when no placeholder present'
  );

  assertEqual(
    replaceName('', 'Alice'),
    '',
    'Should handle empty string'
  );

  // ==========================================
  // INLINE DEFAULT VALUES
  // ==========================================
  console.log('\n📋 Inline Default Values:');

  assertEqual(
    replaceName('Hi {{name|buddy}}!', null),
    'Hi buddy!',
    'Should use inline default when no name provided'
  );

  assertEqual(
    replaceName('Hi {{name|buddy}}!', 'Alice'),
    'Hi Alice!',
    'Should prefer URL name over inline default'
  );

  assertEqual(
    replaceName('Hey {{name|there}}!', null),
    'Hey there!',
    'Should support different inline defaults'
  );

  assertEqual(
    replaceName('{{name|Anonymous}}, welcome!', null),
    'Anonymous, welcome!',
    'Should work at start of string'
  );

  // ==========================================
  // MULTIPLE PLACEHOLDERS
  // ==========================================
  console.log('\n📋 Multiple Placeholders:');

  assertEqual(
    replaceName('Hi {{name}}, yes you {{name}}!', 'Alice'),
    'Hi Alice, yes you Alice!',
    'Should replace multiple identical placeholders'
  );

  assertEqual(
    replaceName('Hi {{name}}, yes you {{name}}!', null),
    'Hi friend, yes you friend!',
    'Should replace multiple placeholders with default'
  );

  assertEqual(
    replaceName('{{name|buddy}}, meet {{name|pal}}!', null),
    'buddy, meet pal!',
    'Should handle multiple different inline defaults'
  );

  assertEqual(
    replaceName('{{name|buddy}}, meet {{name|pal}}!', 'Alice'),
    'Alice, meet Alice!',
    'Should replace all with URL name when provided'
  );

  assertEqual(
    replaceName('{{name}} and {{name|friend}} and {{name|buddy}}', 'Bob'),
    'Bob and Bob and Bob',
    'Should replace mixed placeholder styles'
  );

  assertEqual(
    replaceName('{{name}} and {{name|friend}} and {{name|buddy}}', null),
    'friend and friend and buddy',
    'Should handle mixed placeholders without URL name'
  );

  // ==========================================
  // WHITESPACE HANDLING
  // ==========================================
  console.log('\n📋 Whitespace Handling:');

  assertEqual(
    replaceName('Hi {{name}}!', '  Alice  '),
    'Hi   Alice  !',
    'Should preserve whitespace in name (trimming happens in component)'
  );

  assertEqual(
    replaceName('Hi {{name|dear friend}}!', null),
    'Hi dear friend!',
    'Should support spaces in inline default'
  );

  assertEqual(
    replaceName('{{name}}', ''),
    'friend',
    'Should use global default for empty string name'
  );

  // ==========================================
  // SPECIAL CHARACTERS
  // ==========================================
  console.log('\n📋 Special Characters:');

  assertEqual(
    replaceName('Hi {{name}}!', 'José'),
    'Hi José!',
    'Should handle accented characters'
  );

  assertEqual(
    replaceName('Hi {{name}}!', '张伟'),
    'Hi 张伟!',
    'Should handle Unicode characters (Chinese)'
  );

  assertEqual(
    replaceName('Hi {{name}}!', 'O\'Brien'),
    'Hi O\'Brien!',
    'Should handle apostrophes in names'
  );

  assertEqual(
    replaceName('Hi {{name}}!', 'Anne-Marie'),
    'Hi Anne-Marie!',
    'Should handle hyphens in names'
  );

  assertEqual(
    replaceName('Hi {{name|friend-o-mine}}!', null),
    'Hi friend-o-mine!',
    'Should handle hyphens in defaults'
  );

  assertEqual(
    replaceName('{{name|O\'Reilly}}', null),
    'O\'Reilly',
    'Should handle apostrophes in defaults'
  );

  // ==========================================
  // EDGE CASES
  // ==========================================
  console.log('\n📋 Edge Cases:');

  assertEqual(
    replaceName('{{name}}{{name}}{{name}}', 'Alice'),
    'AliceAliceAlice',
    'Should handle consecutive placeholders'
  );

  assertEqual(
    replaceName('Use {{name}} in code like {{name}}.toLowerCase()', 'Alice'),
    'Use Alice in code like Alice.toLowerCase()',
    'Should work in code-like contexts'
  );

  assertEqual(
    replaceName('Price: ${{name}} USD', '50'),
    'Price: $50 USD',
    'Should work with numeric-like names'
  );

  assertEqual(
    replaceName('{{name|}}', null),
    '',
    'Should handle empty inline default'
  );

  assertEqual(
    replaceName('{{name|}}', 'Alice'),
    'Alice',
    'Should prefer name over empty inline default'
  );

  // ==========================================
  // MALFORMED / INVALID PATTERNS
  // ==========================================
  console.log('\n📋 Invalid/Malformed Patterns:');

  assertEqual(
    replaceName('{{name', 'Alice'),
    '{{name',
    'Should not replace malformed placeholder (missing closing)'
  );

  assertEqual(
    replaceName('name}}', 'Alice'),
    'name}}',
    'Should not replace malformed placeholder (missing opening)'
  );

  assertEqual(
    replaceName('{name}', 'Alice'),
    '{name}',
    'Should not replace single-brace pattern'
  );

  assertEqual(
    replaceName('{{other}}', 'Alice'),
    '{{other}}',
    'Should not replace different variable names'
  );

  assertEqual(
    replaceName('{{name|default|extra}}', null),
    'default|extra',
    'Should handle extra pipes in default value'
  );

  // ==========================================
  // REALISTIC CONTENT
  // ==========================================
  console.log('\n📋 Realistic Content:');

  assertEqual(
    replaceName(
      'Hey {{name}}! If you are reading this, it means I like you.',
      'Sarah'
    ),
    'Hey Sarah! If you are reading this, it means I like you.',
    'Should work in real letter context'
  );

  assertEqual(
    replaceName(
      'Dear {{name|friend}},\n\nI hope this letter finds you well.\n\nBest,\nAbay',
      null
    ),
    'Dear friend,\n\nI hope this letter finds you well.\n\nBest,\nAbay',
    'Should handle multiline content with newlines'
  );

  assertEqual(
    replaceName(
      '<p>Hi {{name|there}}!</p><p>How are you, {{name|friend}}?</p>',
      'Alice'
    ),
    '<p>Hi Alice!</p><p>How are you, Alice?</p>',
    'Should work with HTML content'
  );

  assertEqual(
    replaceName(
      'To: {{name|recipient}}\nFrom: Abay\nSubject: {{name}}, let\'s catch up!',
      'Mike'
    ),
    'To: Mike\nFrom: Abay\nSubject: Mike, let\'s catch up!',
    'Should work in email-like format'
  );

  // ==========================================
  // STRESS TESTS
  // ==========================================
  console.log('\n📋 Stress Tests:');

  const longText = 'Hi {{name}}! '.repeat(100);
  const longResult = replaceName(longText, 'Alice');
  assert(
    longResult === 'Hi Alice! '.repeat(100),
    'Should handle many repeated placeholders'
  );
  console.log('✓ Should handle 100 repeated placeholders');

  const longName = 'A'.repeat(1000);
  const longNameResult = replaceName('Hi {{name}}!', longName);
  assert(
    longNameResult === `Hi ${longName}!`,
    'Should handle very long names'
  );
  console.log('✓ Should handle very long names (1000 chars)');

  const longDefault = 'friend'.repeat(100);
  const longDefaultResult = replaceName(`Hi {{name|${longDefault}}}!`, null);
  assert(
    longDefaultResult === `Hi ${longDefault}!`,
    'Should handle very long defaults'
  );
  console.log('✓ Should handle very long defaults');

  // ==========================================
  // PERFORMANCE TEST
  // ==========================================
  console.log('\n📋 Performance Test:');

  const largeText = 'Some text here. '.repeat(1000) + '{{name}}' + ' More text.'.repeat(1000);
  const start = Date.now();
  const perfResult = replaceName(largeText, 'Alice');
  const duration = Date.now() - start;

  assert(
    perfResult.includes('Alice'),
    'Should find and replace in large text'
  );
  assert(
    duration < 100,
    `Should complete in reasonable time (took ${duration}ms)`
  );
  console.log(`✓ Performance test passed (${duration}ms for ~20KB text)`);

  console.log('\n✅ All tests passed!\n');
}

// Run tests
try {
  runTests();
  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
