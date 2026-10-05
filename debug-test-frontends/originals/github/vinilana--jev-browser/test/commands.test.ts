import assert from 'node:assert/strict';
import { test } from 'node:test';
import { inferInitialUrl, parseCommandsJson, validateCommands } from '../src/domain/commands.js';

test('aceita um batch JSON e preserva a ordem dos comandos', () => {
  assert.deepEqual(parseCommandsJson('[" acesse google.com ","pesquise Example Academy"]'), [
    'acesse google.com',
    'pesquise Example Academy',
  ]);
});

test('rejeita batch inválido, vazio ou grande demais', () => {
  assert.throws(() => parseCommandsJson('{"comando":"x"}'), /array JSON/);
  assert.throws(() => parseCommandsJson('["ok", 2]'), /array JSON/);
  assert.throws(() => validateCommands([]), /pelo menos um/);
  assert.throws(() => validateCommands(Array.from({ length: 21 }, () => 'x')), /máximo 20/);
});

test('infere URL inicial a partir do primeiro domínio válido', () => {
  assert.equal(
    inferInitialUrl(['acesse google.com', 'depois abra https://example.com/path']),
    'https://google.com/',
  );
  assert.equal(inferInitialUrl(['abra https://example.com/path']), 'https://example.com/path');
  assert.equal(inferInitialUrl(['pesquise sem domínio']), undefined);
});
