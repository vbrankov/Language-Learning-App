#!/usr/bin/env node

/**
 * ID Assignment Tool
 * 
 * Processes raw lesson JSON and assigns stable integer IDs to lessons and sentences.
 * 
 * Usage:
 *   node assign-ids.js <input-file> [output-file]
 * 
 * Example:
 *   node assign-ids.js ../db/lessons_1_to_106_bilingual_complete.json ../db/lessons_1_to_106_enhanced.json
 */

import { readFile, writeFile } from 'fs/promises';
import { resolve, basename } from 'path';

function assignIds(rawData) {
  console.log('\n📊 Processing lesson database...\n');

  // Extract metadata if it exists
  const metadata = rawData.metadata || {};
  const lessons = rawData.lessons || [];

  let nextLessonId = 1;
  let nextSentenceId = 1;

  // Process each lesson
  const enhancedLessons = lessons.map((lesson) => {
    const lessonId = nextLessonId++;
    
    console.log(`  Lesson ${lessonId}: ${lesson.title}`);
    
    // Process sentences
    const enhancedSentences = (lesson.sentences || []).map((sentence) => {
      const sentenceId = nextSentenceId++;
      
      // Handle both array format [source, destination] and object format
      let source, destination;
      if (Array.isArray(sentence)) {
        [source, destination] = sentence;
      } else {
        source = sentence.source;
        destination = sentence.destination;
      }
      
      return {
        id: sentenceId,
        source,
        destination
      };
    });

    console.log(`    ✓ ${enhancedSentences.length} sentences (IDs: ${lessonId === 1 ? '1' : enhancedSentences[0]?.id || 'N/A'}-${enhancedSentences[enhancedSentences.length - 1]?.id || 'N/A'})`);

    return {
      id: lessonId,
      title: lesson.title,
      words: lesson.words || [],
      sentences: enhancedSentences
    };
  });

  // Create enhanced database structure
  const enhancedData = {
    version: '1.0',
    sourceLanguage: metadata.sourceLanguage || 'English',
    destinationLanguage: metadata.destinationLanguage || 'Serbian',
    lastUpdated: new Date().toISOString().split('T')[0],
    nextLessonId,
    nextSentenceId,
    metadata: {
      ...metadata,
      enhanced: true,
      enhancedDate: new Date().toISOString()
    },
    lessons: enhancedLessons
  };

  return enhancedData;
}

function printSummary(data) {
  const totalLessons = data.lessons.length;
  const totalSentences = data.lessons.reduce((sum, lesson) => sum + lesson.sentences.length, 0);
  const totalWords = data.lessons.reduce((sum, lesson) => sum + (lesson.words?.length || 0), 0);

  console.log('\n' + '='.repeat(80));
  console.log('✅ ID ASSIGNMENT COMPLETE');
  console.log('='.repeat(80));
  console.log(`
📈 Statistics:
  • Total Lessons:        ${totalLessons}
  • Total Sentences:      ${totalSentences}
  • Total Vocabulary:     ${totalWords}
  • Next Lesson ID:       ${data.nextLessonId}
  • Next Sentence ID:     ${data.nextSentenceId}
  • Source Language:      ${data.sourceLanguage}
  • Destination Language: ${data.destinationLanguage}
  • Version:              ${data.version}
  • Last Updated:         ${data.lastUpdated}
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('❌ Error: No input file specified\n');
    console.log('Usage: node assign-ids.js <input-file> [output-file]\n');
    console.log('Example:');
    console.log('  node assign-ids.js ../db/lessons_1_to_106_bilingual_complete.json ../db/lessons_1_to_106_enhanced.json');
    process.exit(1);
  }

  const inputFile = resolve(args[0]);
  const outputFile = args[1] 
    ? resolve(args[1])
    : inputFile.replace('.json', '_enhanced.json');

  console.log('='.repeat(80));
  console.log('🔧 ID ASSIGNMENT TOOL');
  console.log('='.repeat(80));
  console.log(`\n📂 Input:  ${inputFile}`);
  console.log(`💾 Output: ${outputFile}\n`);

  try {
    // Read input file
    console.log('📖 Reading input file...');
    const rawJson = await readFile(inputFile, 'utf-8');
    const rawData = JSON.parse(rawJson);
    console.log('✓ File loaded successfully');

    // Assign IDs
    const enhancedData = assignIds(rawData);

    // Print summary
    printSummary(enhancedData);

    // Write output file
    console.log(`💾 Writing to ${basename(outputFile)}...`);
    await writeFile(outputFile, JSON.stringify(enhancedData, null, 2), 'utf-8');
    console.log('✓ File saved successfully\n');

    console.log('='.repeat(80));
    console.log(`🎉 Done! Enhanced database saved to:\n   ${outputFile}`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ENOENT') {
      console.error(`   File not found: ${inputFile}`);
    }
    process.exit(1);
  }
}

main();
