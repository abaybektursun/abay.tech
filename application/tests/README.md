# Test Suite

This directory contains all tests for the application, isolated from the main source code.

## Directory Structure

```
tests/
├── unit/                           # Unit tests
│   ├── PersonalizedArticle.test.ts             # TypeScript unit tests
│   └── PersonalizedArticle.standalone.test.js  # Standalone JavaScript tests (no deps)
└── README.md                       # This file
```

## Running Tests

### Standalone Tests (No Dependencies)

The standalone test runner requires no dependencies and can be run directly with Node.js:

```bash
# From project root
node tests/unit/PersonalizedArticle.standalone.test.js

# From any directory (must use absolute path or copy file out)
cd /tmp
node /path/to/tests/unit/PersonalizedArticle.standalone.test.js
```

**Note**: Due to package.json LFS issues, you may need to run from outside the application directory:
```bash
cp tests/unit/PersonalizedArticle.standalone.test.js /tmp/test.js
cd / && node /tmp/test.js
```

### TypeScript Tests

TypeScript tests require the TypeScript runtime and proper module resolution:

```bash
# Using tsx (recommended for development)
npx tsx tests/unit/PersonalizedArticle.test.ts

# Or using ts-node
npx ts-node tests/unit/PersonalizedArticle.test.ts
```

## Test Coverage

### PersonalizedArticle Tests (45+ test cases)

Comprehensive tests for the `replaceName` function used in personalized letters:

- **Basic Functionality** (4 tests)
  - Name replacement with URL parameter
  - Default fallback when no name provided
  - Unchanged text without placeholders
  - Empty string handling

- **Inline Default Values** (4 tests)
  - Custom defaults via `{{name|default}}` syntax
  - URL parameter takes precedence over defaults
  - Multiple different defaults
  - Defaults at start of string

- **Multiple Placeholders** (6 tests)
  - Multiple identical placeholders
  - Multiple with defaults
  - Mixed placeholder styles
  - Priority handling

- **Whitespace Handling** (3 tests)
  - Whitespace preservation
  - Spaces in defaults
  - Empty string vs null handling

- **Special Characters** (6 tests)
  - Accented characters (José)
  - Unicode (Chinese characters)
  - Apostrophes (O'Brien)
  - Hyphens (Anne-Marie)
  - Special chars in defaults

- **Edge Cases** (5 tests)
  - Consecutive placeholders
  - Code-like contexts
  - Numeric values
  - Empty inline defaults

- **Invalid Patterns** (5 tests)
  - Malformed syntax protection
  - Single-brace patterns
  - Different variable names
  - Extra pipes in defaults

- **Realistic Content** (4 tests)
  - Letter context
  - Multiline content
  - HTML content
  - Email format

- **Stress Tests** (3 tests)
  - 100+ repeated placeholders
  - 1000+ character names
  - Very long default values

- **Performance** (1 test)
  - Sub-1ms for 20KB text
  - Handles large documents efficiently

## Adding New Tests

### 1. Create test file in appropriate directory

```typescript
// tests/unit/MyComponent.test.ts
import { myFunction } from '../../src/path/to/MyComponent';

function runTests() {
  console.log('🧪 Running MyComponent Tests\n');

  // Your tests here

  console.log('\n✅ All tests passed!\n');
}

if (require.main === module) {
  try {
    runTests();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export { runTests };
```

### 2. For standalone tests (no dependencies)

```javascript
// tests/unit/MyFunction.standalone.test.js
#!/usr/bin/env node

// Copy the function code here (for true zero-dependency)
function myFunction(input) {
  // implementation
}

// Test utilities
function assertEqual(actual, expected, testName) {
  if (actual !== expected) {
    throw new Error(`❌ ${testName}\nExpected: "${expected}"\nActual: "${actual}"`);
  }
  console.log(`✓ ${testName}`);
}

// Tests
console.log('🧪 Running Tests\n');
assertEqual(myFunction('input'), 'expected', 'Test description');
console.log('\n✅ All tests passed!\n');
```

## Test Philosophy

1. **Isolation**: Tests are isolated from application code
2. **Comprehensiveness**: Cover all edge cases, not just happy paths
3. **No Dependencies**: Standalone tests should run without npm install
4. **Fast**: Tests should complete in under 1 second
5. **Clear Output**: Easy to understand what passed/failed
6. **Self-Documenting**: Test names describe what they test

## CI/CD Integration

These tests can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Standalone Tests
  run: |
    cd /tmp
    node $GITHUB_WORKSPACE/tests/unit/PersonalizedArticle.standalone.test.js
```

## Troubleshooting

### "Invalid package config" error

If you get this error, the package.json is in Git LFS and causing issues. Solution:

```bash
# Copy test to temp location
cp tests/unit/*.standalone.test.js /tmp/
cd /
node /tmp/PersonalizedArticle.standalone.test.js
```

### Import/Module errors

Make sure to use correct relative paths when importing from src:

```typescript
// ✅ Correct
import { func } from '../../src/components/MyComponent';

// ❌ Wrong
import { func } from '@/components/MyComponent'; // Won't work in test context
```

## Future Improvements

- [ ] Add integration tests
- [ ] Add E2E tests with Playwright
- [ ] Set up Jest/Vitest for proper test framework
- [ ] Add test coverage reporting
- [ ] Add visual regression tests
- [ ] Add performance benchmarks
