---
title: "Personalization Test Letter"
excerpt: "Testing the personalization feature with various placeholder patterns."
date: "2025-11-15"
image: "/letters_media/_DSC4253.JPG"
---

# Hey {{name}}!

This is a test letter to demonstrate the personalization feature. Let me show you how it works:

## Basic Replacement

Hello {{name}}, welcome to this personalized letter!

## With Inline Defaults

Dear {{name|friend}}, I hope you're doing well. This uses "friend" as the default if no name is provided in the URL.

Hey {{name|buddy}}, check out this different default!

## Multiple Instances

{{name}}, you'll notice that your name appears multiple times throughout this letter. Every instance of {{name}} gets replaced consistently, {{name}}!

## Mixed Patterns

This paragraph has {{name}} without a default, {{name|pal}} with "pal" as default, and {{name|amigo}} with "amigo" as default. When you provide a name in the URL, all of these get replaced with your name. When you don't, each uses its own default (or "friend" for the first one).

## Real-World Usage

Dear {{name|friend}},

I wanted to reach out personally to let you know how much I appreciate you. {{name}}, your presence in my life has made a real difference.

Looking forward to connecting soon, {{name|my friend}}!

Best regards,
Abay

---

## How to Test This

Try opening this letter with different URL parameters:

1. **With a name**: `/letters/test_personalization?name=Alice`
   - All `{{name}}` placeholders will show "Alice"

2. **Without a name**: `/letters/test_personalization`
   - `{{name}}` → "friend"
   - `{{name|friend}}` → "friend"
   - `{{name|buddy}}` → "buddy"
   - `{{name|pal}}` → "pal"
   - etc.

3. **With special characters**: `/letters/test_personalization?name=José`
   - Works with accented characters!

4. **With compound names**: `/letters/test_personalization?name=Mary Jane`
   - Handles spaces in names!
