import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

async function sources(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? sources(join(directory, entry.name)) : [join(directory, entry.name)],
      ),
    )
  )
    .flat()
    .filter((path) => path.endsWith('.ts'));
}

test('dependências respeitam camadas e não formam ciclos', async () => {
  const root = resolve('src');
  const graph = new Map<string, string[]>();
  for (const path of await sources(root)) {
    const source = await readFile(path, 'utf8');
    const dependencies: string[] = [];
    // Covers this project's static import/export declarations, including multiline types.
    const imports = source.matchAll(/^(?:import|export)\s+(?:[^;]*?\sfrom\s+)?['"]([^'"]+)['"]/gm);
    for (const match of imports) {
      const name = match[1];
      if (!name) continue;
      const layer = relative(root, path).split('/').at(0) ?? '';
      if (['domain', 'application'].includes(layer)) {
        assert(name.startsWith('.'), `${path}: SDK ou módulo externo ${name} no núcleo`);
        const targetLayer =
          relative(root, resolve(dirname(path), name))
            .split('/')
            .at(0) ?? '';
        assert(
          ['domain', ...(layer === 'application' ? ['application'] : [])].includes(targetLayer),
          `${path}: dependência indevida de ${name}`,
        );
      }
      if (name.startsWith('.'))
        dependencies.push(resolve(dirname(path), name.replace(/\.js$/, '.ts')));
    }
    graph.set(path, dependencies);
  }
  const visited = new Set<string>();
  function visit(path: string, stack: string[]) {
    assert(
      !stack.includes(path),
      `Ciclo: ${[...stack, path].map((p) => relative(root, p)).join(' -> ')}`,
    );
    if (visited.has(path)) return;
    for (const dependency of graph.get(path) ?? []) visit(dependency, [...stack, path]);
    visited.add(path);
  }
  for (const path of graph.keys()) visit(path, []);
});
